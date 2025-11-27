import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import crypto from "crypto";

// Mapping status Midtrans ke order_status
const mapMidtransToOrderStatus = (transactionStatus, fraudStatus = null) => {
  console.log(`🔄 Mapping status: ${transactionStatus}, fraud: ${fraudStatus}`);

  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "accept" ? "settlement" : "capture";
    case "settlement":
      return "settlement";
    case "pending":
      return "pending";
    case "deny":
      return "deny";
    case "expire":
      return "expire";
    case "cancel":
      return "cancel";
    case "refund":
    case "partial_refund":
      return "refund";
    case "chargeback":
    case "partial_chargeback":
      return "chargeback";
    case "failure":
      return "failure";
    case "authorize":
      return "authorize";
    default:
      console.warn(`⚠️ Unknown status: ${transactionStatus}`);
      return "pending";
  }
};

// Clear user cart
async function clearUserCart(userId, jwt) {
  try {
    console.log(`🛒 Clearing cart for user: ${userId}`);

    const cartResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts?filters[users_permissions_user][id][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!cartResponse.ok) {
      console.error("❌ Failed to fetch cart");
      return false;
    }

    const cartData = await cartResponse.json();
    const cartItems = cartData.data || [];

    console.log(`🗑️ Deleting ${cartItems.length} cart items`);

    if (cartItems.length === 0) {
      console.log("✅ Cart already empty");
      return true;
    }

    const deletePromises = cartItems.map(async (item) => {
      const itemId = item.documentId || item.id;
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        console.error(`❌ Failed to delete item ${itemId}`);
        return false;
      }

      console.log(`✅ Deleted cart item: ${itemId}`);
      return true;
    });

    await Promise.all(deletePromises);
    console.log(`✅ Cart cleared successfully`);
    return true;
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    return false;
  }
}

// Update product stock
async function updateProductStock(items, jwt) {
  const productItems = items.filter((item) => item.category !== "shipping");
  console.log(`📦 Updating stock for ${productItems.length} products`);

  for (const item of productItems) {
    try {
      console.log(`🔍 Processing product ID: ${item.id}`);

      const productResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products?filters[documentId][$eq]=${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!productResponse.ok) {
        console.error(`❌ Failed to fetch product ${item.id}`);
        continue;
      }

      const productData = await productResponse.json();
      const product = productData.data?.[0];

      if (!product) {
        console.error(`❌ Product not found: ${item.id}`);
        continue;
      }

      const newStock = Math.max(0, product.stock - item.quantity);

      console.log(`📊 ${product.name}: ${product.stock} → ${newStock}`);

      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products/${product.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            data: { stock: newStock },
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error(`❌ Failed to update stock for ${item.id}`);
        continue;
      }

      console.log(`✅ Stock updated for ${product.name}`);
    } catch (error) {
      console.error(`❌ Error updating stock for ${item.id}:`, error);
    }
  }

  console.log("✅ Stock update completed");
}

// Find user by email (fallback)
async function findUserByEmail(email, jwt) {
  try {
    console.log(`🔍 Finding user by email: ${email}`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!response.ok) {
      console.error("❌ Failed to search user");
      return null;
    }

    const users = await response.json();
    const user = users[0];

    if (user?.id) {
      console.log(`✅ User found: ${user.id}`);
      return user.id;
    }

    console.error("❌ User not found");
    return null;
  } catch (error) {
    console.error("❌ Error finding user:", error);
    return null;
  }
}

// Main notification handler
async function processNotification(notificationBody) {
  try {
    console.log("🔔 ========== PROCESSING NOTIFICATION ==========");
    console.log(
      "📦 Notification body:",
      JSON.stringify(notificationBody, null, 2)
    );

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      status_message,
    } = notificationBody;

    // Initialize Midtrans
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Verify with Midtrans API
    console.log(`🔍 Verifying transaction: ${order_id}`);
    const statusResponse = await snap.transaction.status(order_id);

    console.log("💳 Midtrans verification:", {
      transaction_status: statusResponse.transaction_status,
      fraud_status: statusResponse.fraud_status,
      transaction_id: statusResponse.transaction_id,
    });

    // Map status
    const orderStatus = mapMidtransToOrderStatus(
      statusResponse.transaction_status,
      statusResponse.fraud_status
    );

    console.log(`✅ Final order status: ${orderStatus}`);

    // Fetch order from Strapi
    console.log(`🔍 Fetching order: ${order_id}`);
    const orderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[order_id][$eq]=${order_id}&populate=users_permissions_user`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("❌ Failed to fetch order:", errorText);
      return;
    }

    const orderData = await orderResponse.json();
    const order = orderData.data?.[0];

    if (!order) {
      console.error("❌ Order not found:", order_id);
      return;
    }

    console.log("📦 Order found:", {
      documentId: order.documentId,
      current_status: order.order_status,
      customer_email: order.customer_email,
    });

    // Update order
    const orderDocumentId = order.documentId;
    const updatePayload = {
      data: {
        order_status: orderStatus,
        midtrans_transaction_id: statusResponse.transaction_id,
        payment_data: {
          ...statusResponse,
          notification_received: new Date().toISOString(),
          payment_type: payment_type,
          status_message: status_message,
        },
      },
    };

    console.log(`🔄 Updating order ${orderDocumentId} to ${orderStatus}`);
    console.log("📝 Update payload:", JSON.stringify(updatePayload, null, 2));

    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders/${orderDocumentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("❌ Failed to update order:", errorText);
      console.error("❌ Response status:", updateResponse.status);
      return;
    }

    const updateResult = await updateResponse.json();
    console.log("✅ Order updated successfully");
    console.log("📝 Update result:", JSON.stringify(updateResult, null, 2));

    // Post-payment tasks for settlement
    if (orderStatus === "settlement" && order.items) {
      console.log("💰 Payment settled, processing post-payment tasks...");

      try {
        // Update stock
        console.log("📦 Updating product stock...");
        await updateProductStock(order.items, process.env.STRAPI_API_TOKEN);

        // Find user ID
        let userId = null;

        // Try multiple methods to get user ID
        if (order.users_permissions_user?.data?.id) {
          userId = order.users_permissions_user.data.id;
          console.log(
            "👤 User ID from users_permissions_user.data.id:",
            userId
          );
        } else if (order.users_permissions_user?.id) {
          userId = order.users_permissions_user.id;
          console.log("👤 User ID from users_permissions_user.id:", userId);
        } else if (typeof order.users_permissions_user === "number") {
          userId = order.users_permissions_user;
          console.log("👤 User ID (direct number):", userId);
        }

        // Fallback: search by email
        if (!userId && order.customer_email) {
          console.log("🔍 Fallback: searching user by email");
          userId = await findUserByEmail(
            order.customer_email,
            process.env.STRAPI_API_TOKEN
          );
        }

        // Clear cart
        if (userId) {
          console.log(`🛒 Clearing cart for user: ${userId}`);
          await clearUserCart(userId, process.env.STRAPI_API_TOKEN);
        } else {
          console.error("❌ Cannot clear cart: User ID not found");
          console.log("🔍 Order structure:", JSON.stringify(order, null, 2));
        }
      } catch (error) {
        console.error("❌ Error in post-payment tasks:", error);
      }
    }

    console.log("✅ ========== NOTIFICATION PROCESSED ==========");
  } catch (error) {
    console.error("❌ ========== NOTIFICATION ERROR ==========");
    console.error(error);
  }
}

export async function POST(request) {
  try {
    console.log("🔔 ========== WEBHOOK RECEIVED ==========");

    const body = await request.json();
    console.log("📨 Raw notification:", JSON.stringify(body, null, 2));

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
    } = body;

    // Validate signature (production only)
    if (process.env.MIDTRANS_IS_PRODUCTION === "true") {
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      const hash = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (hash !== signature_key) {
        console.error("❌ Invalid signature");
        console.log("Expected:", hash);
        console.log("Received:", signature_key);
        return NextResponse.json(
          { status: "error", message: "Invalid signature" },
          { status: 401 }
        );
      }
      console.log("✅ Signature valid");
    } else {
      console.log("🟡 Development mode: Skip signature validation");
    }

    // Send immediate response to Midtrans
    const response = NextResponse.json({
      status: "OK",
      message: "Notification received",
    });

    // Process in background (don't await)
    processNotification(body).catch((error) => {
      console.error("Background processing error:", error);
    });

    console.log("✅ Response sent to Midtrans");
    return response;
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    // Always return OK to Midtrans to prevent retries
    return NextResponse.json({ status: "OK" });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
