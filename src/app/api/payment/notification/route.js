import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  console.log("🎯 NOTIFICATION RECEIVED - START");

  try {
    const notification = await request.json();

    console.log(
      "📦 FULL NOTIFICATION BODY:",
      JSON.stringify(notification, null, 2)
    );

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      gross_amount,
      status_code,
    } = notification;

    console.log("🔍 EXTRACTED FIELDS:", {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
    });

    // Validate required fields
    if (!order_id || !transaction_status) {
      console.error("❌ MISSING REQUIRED FIELDS");
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 PROCESSING: Order ${order_id}, Status: ${transaction_status}`
    );

    // STEP 1: Find order in Strapi
    console.log(`🔍 SEARCHING ORDER IN STRAPI: ${order_id}`);

    const searchUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[order_id][$eq]=${order_id}&populate[users_permissions_user][populate]=*`;
    console.log("🔍 STRAPI SEARCH URL:", searchUrl);

    const orderSearchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "🔍 STRAPI SEARCH RESPONSE STATUS:",
      orderSearchResponse.status
    );

    if (!orderSearchResponse.ok) {
      const errorText = await orderSearchResponse.text();
      console.error("❌ STRAPI SEARCH FAILED:", errorText);
      return NextResponse.json(
        {
          status: "error",
          message: "Strapi search failed",
        },
        { status: 500 }
      );
    }

    const orderSearchData = await orderSearchResponse.json();
    console.log(
      "🔍 STRAPI SEARCH RESULT:",
      JSON.stringify(orderSearchData, null, 2)
    );

    // Check if order exists
    if (!orderSearchData.data || orderSearchData.data.length === 0) {
      console.error("❌ ORDER NOT FOUND IN STRAPI");
      return NextResponse.json(
        {
          status: "error",
          message: "Order not found in Strapi",
        },
        { status: 404 }
      );
    }

    const order = orderSearchData.data[0];
    const orderDocumentId = order.documentId;

    console.log(`✅ ORDER FOUND:`, {
      documentId: orderDocumentId,
      current_status: order.order_status,
      customer_email: order.customer_email,
      user_relation: order.users_permissions_user,
    });

    // STEP 2: Prepare update data
    const updatePayload = {
      data: {
        order_status: transaction_status,
        midtrans_transaction_id: transaction_id || `midtrans-${Date.now()}`,
        payment_data: {
          transaction_status,
          fraud_status,
          payment_type,
          gross_amount,
          transaction_id,
          status_code,
          notification_received: new Date().toISOString(),
          raw_notification: notification,
        },
      },
    };

    console.log("📝 UPDATE PAYLOAD:", JSON.stringify(updatePayload, null, 2));

    // STEP 3: Update order in Strapi
    const updateUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders/${orderDocumentId}`;
    console.log("🔧 UPDATE URL:", updateUrl);

    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    console.log("🔧 UPDATE RESPONSE STATUS:", updateResponse.status);

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error("❌ STRAPI UPDATE FAILED:", updateError);
      return NextResponse.json(
        {
          status: "error",
          message: "Strapi update failed",
        },
        { status: 500 }
      );
    }

    const updateResult = await updateResponse.json();
    console.log(
      "✅ STRAPI UPDATE SUCCESS:",
      JSON.stringify(updateResult, null, 2)
    );

    // STEP 4: Handle successful payments - CLEAR CART
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      console.log("💰 PAYMENT SUCCESS - CLEARING USER CART");

      try {
        await clearUserCart(order);
        console.log("✅ CART CLEARING PROCESS INITIATED");
      } catch (postPaymentError) {
        console.error(
          "⚠️ CART CLEARING ERROR (non-critical):",
          postPaymentError
        );
        // Don't fail the whole process if cart clearing fails
      }
    }

    console.log("🎉 NOTIFICATION PROCESSING COMPLETED SUCCESSFULLY");

    return NextResponse.json({
      status: "success",
      message: "Notification processed successfully",
      order_id,
      transaction_status,
    });
  } catch (error) {
    console.error("❌ UNEXPECTED ERROR IN NOTIFICATION HANDLER:", error);

    // Still return 200 to Midtrans to prevent retries
    return NextResponse.json({
      status: "ok",
      message: "Notification received (with errors)",
    });
  }
}

// **PERBAIKAN: Gunakan documentId untuk semua operasi**
async function clearUserCart(order) {
  try {
    console.log("🛒 STARTING CART CLEARING PROCESS");

    // Extract user ID dari order dengan berbagai cara
    let userDocumentId = null;

    // Method 1: Dari users_permissions_user relation
    if (order.users_permissions_user) {
      if (
        order.users_permissions_user.data &&
        order.users_permissions_user.data.documentId
      ) {
        userDocumentId = order.users_permissions_user.data.documentId;
        console.log(
          "👤 USER DOCUMENT ID FROM users_permissions_user.data.documentId:",
          userDocumentId
        );
      } else if (order.users_permissions_user.documentId) {
        userDocumentId = order.users_permissions_user.documentId;
        console.log(
          "👤 USER DOCUMENT ID FROM users_permissions_user.documentId:",
          userDocumentId
        );
      }
    }

    // Method 2: Fallback - cari user by email
    if (!userDocumentId && order.customer_email) {
      console.log(
        "🔍 FALLBACK: Searching user by email:",
        order.customer_email
      );
      userDocumentId = await findUserByEmail(order.customer_email);
    }

    if (!userDocumentId) {
      console.error("❌ CANNOT CLEAR CART: User Document ID not found");
      console.log(
        "🔍 Order structure for debugging:",
        JSON.stringify(
          {
            users_permissions_user: order.users_permissions_user,
            customer_email: order.customer_email,
          },
          null,
          2
        )
      );
      return;
    }

    console.log(`🔍 CLEARING CART FOR USER DOCUMENT ID: ${userDocumentId}`);

    // Get cart items - GUNAKAN documentId UNTUK FILTER
    const cartResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts?filters[users_permissions_user][documentId][$eq]=${userDocumentId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!cartResponse.ok) {
      console.error(`❌ FAILED TO FETCH CART FOR USER ${userDocumentId}`);
      return;
    }

    const cartData = await cartResponse.json();
    const cartItems = cartData.data || [];

    console.log(`🗑️ FOUND ${cartItems.length} CART ITEMS TO DELETE`);

    if (cartItems.length === 0) {
      console.log("✅ CART ALREADY EMPTY");
      return;
    }

    // Delete all cart items - GUNAKAN documentId
    const deletePromises = cartItems.map(async (item) => {
      const itemDocumentId = item.documentId;

      try {
        const deleteResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts/${itemDocumentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
          }
        );

        if (deleteResponse.ok) {
          console.log(`✅ DELETED CART ITEM: ${itemDocumentId}`);
          return true;
        } else {
          console.error(`❌ FAILED TO DELETE CART ITEM: ${itemDocumentId}`);
          return false;
        }
      } catch (error) {
        console.error(`❌ ERROR DELETING CART ITEM ${itemDocumentId}:`, error);
        return false;
      }
    });

    await Promise.all(deletePromises);
    console.log(`✅ CART CLEARED SUCCESSFULLY FOR USER: ${userDocumentId}`);

    // Also update product stock for successful payments
    if (order.items && Array.isArray(order.items)) {
      console.log("📦 UPDATING PRODUCT STOCK");
      await updateProductStocks(order.items);
    }
  } catch (error) {
    console.error("❌ CART CLEARING ERROR:", error);
    throw error;
  }
}

// Helper function to find user by email - GUNAKAN documentId
async function findUserByEmail(email) {
  try {
    console.log(`🔍 SEARCHING USER BY EMAIL: ${email}`);

    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("❌ FAILED TO SEARCH USER BY EMAIL");
      return null;
    }

    const userData = await userResponse.json();

    if (userData && userData.length > 0) {
      const userDocumentId = userData[0].documentId;
      console.log(`✅ USER FOUND BY EMAIL: ${userDocumentId}`);
      return userDocumentId;
    }

    console.error("❌ USER NOT FOUND BY EMAIL");
    return null;
  } catch (error) {
    console.error("❌ ERROR FINDING USER BY EMAIL:", error);
    return null;
  }
}

// Helper function to update product stocks - GUNAKAN documentId
async function updateProductStocks(items) {
  try {
    const productItems = items.filter((item) => item.category !== "shipping");
    console.log(`📦 UPDATING STOCK FOR ${productItems.length} PRODUCTS`);

    for (const item of productItems) {
      if (!item.id) continue;

      console.log(
        `🔍 UPDATING STOCK FOR PRODUCT: ${item.id}, QUANTITY: ${item.quantity}`
      );

      // Get current product - GUNAKAN documentId
      const productResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products?filters[documentId][$eq]=${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );

      if (!productResponse.ok) {
        console.error(`❌ FAILED TO FETCH PRODUCT ${item.id}`);
        continue;
      }

      const productData = await productResponse.json();
      const product = productData.data?.[0];

      if (!product) {
        console.error(`❌ PRODUCT ${item.id} NOT FOUND`);
        continue;
      }

      const newStock = Math.max(0, product.stock - item.quantity);
      console.log(
        `📊 STOCK UPDATE: ${product.name} - ${product.stock} → ${newStock}`
      );

      // Update product stock - GUNAKAN documentId
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products/${product.documentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: { stock: newStock },
          }),
        }
      );

      if (updateResponse.ok) {
        console.log(`✅ STOCK UPDATED FOR: ${product.name}`);
      } else {
        console.error(`❌ FAILED TO UPDATE STOCK FOR: ${product.name}`);
      }
    }

    console.log("✅ ALL PRODUCT STOCKS UPDATED");
  } catch (error) {
    console.error("❌ ERROR UPDATING PRODUCT STOCKS:", error);
  }
}

// For testing
export async function GET() {
  return NextResponse.json({
    message: "Payment notification endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
