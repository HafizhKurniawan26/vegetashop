import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import crypto from "crypto";

// Mapping status Midtrans ke order_status yang sesuai dengan enum Strapi
const mapMidtransToOrderStatus = (transactionStatus, fraudStatus = null) => {
  console.log(
    `🔄 Mapping Midtrans status: ${transactionStatus}, fraud: ${fraudStatus}`
  );

  switch (transactionStatus) {
    case "capture":
      if (fraudStatus === "challenge") {
        return "capture"; // Menunggu verifikasi
      } else if (fraudStatus === "accept") {
        return "settlement"; // Pembayaran berhasil
      }
      return "capture"; // Default untuk capture tanpa fraud status
    case "settlement":
      return "settlement"; // Pembayaran berhasil
    case "pending":
      return "pending"; // Menunggu pembayaran
    case "deny":
      return "deny"; // Pembayaran ditolak
    case "expire":
      return "expire"; // Kadaluarsa
    case "cancel":
      return "cancel"; // Dibatalkan
    case "refund":
    case "partial_refund":
      return "refund"; // Dikembalikan
    case "chargeback":
    case "partial_chargeback":
      return "chargeback"; // Chargeback
    case "failure":
      return "failure"; // Gagal
    case "authorize":
      return "authorize"; // Terauthorisasi
    default:
      console.warn(
        `⚠️ Unknown transaction status: ${transactionStatus}, defaulting to pending`
      );
      return "pending";
  }
};

// Fungsi untuk mencari user by email (fallback)
async function findUserByEmailAndClearCart(email, jwt) {
  try {
    console.log(`🔍 Searching for user by email: ${email}`);

    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users?filters[email][$eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("❌ Failed to search user by email");
      return false;
    }

    const userData = await userResponse.json();
    const user = userData[0];

    if (user && user.id) {
      console.log(`✅ User found by email, ID: ${user.id}`);
      const cartCleared = await clearUserCart(user.id, jwt);
      return cartCleared;
    } else {
      console.error("❌ User not found by email");
      return false;
    }
  } catch (error) {
    console.error("❌ Error finding user by email:", error);
    return false;
  }
}

// Fungsi untuk clear cart yang lebih robust
async function clearUserCart(userId, jwt) {
  try {
    console.log(`🛒 Starting to clear cart for user: ${userId}`);

    // Step 1: Get all cart items
    const cartResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts?filters[users_permissions_user][id][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.error("❌ Failed to fetch cart items:", errorText);
      return false;
    }

    const cartData = await cartResponse.json();
    const cartItems = cartData.data || [];

    console.log(`🗑️ Found ${cartItems.length} cart items to delete`);

    if (cartItems.length === 0) {
      console.log("✅ Cart is already empty");
      return true;
    }

    // Step 2: Delete all cart items
    const deletePromises = cartItems.map(async (item) => {
      const itemId = item.documentId || item.id;
      console.log(`🗑️ Deleting cart item: ${itemId}`);

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
        const errorText = await deleteResponse.text();
        console.error(`❌ Failed to delete cart item ${itemId}:`, errorText);
        throw new Error(`Failed to delete cart item ${itemId}`);
      }

      console.log(`✅ Successfully deleted cart item: ${itemId}`);
      return true;
    });

    // Step 3: Wait for all deletions to complete
    await Promise.all(deletePromises);
    console.log(`✅ All ${cartItems.length} cart items deleted successfully`);

    return true;
  } catch (error) {
    console.error("❌ Error clearing user cart:", error);
    return false;
  }
}

// Fungsi untuk update stok produk
async function updateProductStock(items, jwt) {
  const productItems = items.filter((item) => item.category !== "shipping");

  console.log(`🔄 Processing ${productItems.length} products for stock update`);

  for (const item of productItems) {
    try {
      console.log(
        `🔍 Updating stock for product ID: ${item.id}, Quantity: ${item.quantity}`
      );

      // Cari product menggunakan documentId
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
        console.error(`❌ Product not found with documentId: ${item.id}`);
        continue;
      }

      const newStock = Math.max(0, product.stock - item.quantity);

      console.log(`📊 Stock update - Product: ${product.name}`);
      console.log(`   Current stock: ${product.stock}`);
      console.log(`   Quantity sold: ${item.quantity}`);
      console.log(`   New stock: ${newStock}`);

      // Gunakan documentId untuk update
      const productDocumentId = product.documentId || product.id;
      const updatePayload = {
        data: {
          stock: newStock,
        },
      };

      const updateProductResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products/${productDocumentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateProductResponse.ok) {
        const errorText = await updateProductResponse.text();
        console.error(`❌ Failed to update product ${item.id}:`, errorText);
        continue;
      }

      console.log(`✅ Stock updated successfully for ${product.name}`);
    } catch (error) {
      console.error(`❌ Error updating stock for product ${item.id}:`, error);
    }
  }

  console.log("✅ All stock updates completed");
}

async function processNotificationBackground(notificationBody) {
  try {
    console.log("🔄 Starting background processing...");
    console.log(
      "📦 Full notification body:",
      JSON.stringify(notificationBody, null, 2)
    );

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      status_message,
      payment_type,
      status_code,
    } = notificationBody;

    // Debug logging untuk status mapping
    console.log("🔍 Status mapping debug:", {
      transaction_status,
      fraud_status,
      status_code,
      status_message,
    });

    // Initialize Midtrans client
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Verifikasi transaction status dari Midtrans API
    console.log(`🔍 Verifying transaction status for: ${order_id}`);
    const statusResponse = await snap.transaction.status(order_id);
    console.log("💳 Payment status verified from API:", {
      transaction_status: statusResponse.transaction_status,
      fraud_status: statusResponse.fraud_status,
      status_code: statusResponse.status_code,
      status_message: statusResponse.status_message,
    });

    // Map status Midtrans ke order_status
    const orderStatus = mapMidtransToOrderStatus(
      statusResponse.transaction_status,
      statusResponse.fraud_status
    );

    console.log(
      `🔄 Final status mapping: ${statusResponse.transaction_status} + ${statusResponse.fraud_status} -> ${orderStatus}`
    );

    // Cari order di Strapi v5 dengan populate
    const orderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[order_id][$eq]=${order_id}&populate=*`,
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

    console.log("📦 Order found");
    console.log("📦 Order documentId:", order.documentId);

    // Debug: Log struktur order untuk melihat field user
    console.log("🔍 Order structure debug:", {
      has_users_permissions_user: !!order.users_permissions_user,
      users_permissions_user_type: typeof order.users_permissions_user,
      users_permissions_user_value: order.users_permissions_user,
      has_user: !!order.user,
      user_type: typeof order.user,
      user_value: order.user,
      customer_email: order.customer_email,
    });

    // Gunakan documentId untuk update
    const orderDocumentId = order.documentId || order.id;

    if (!orderDocumentId) {
      console.error("❌ No documentId found for order");
      return;
    }

    // Update order status dan transaction ID
    const updatePayload = {
      data: {
        order_status: orderStatus,
        midtrans_transaction_id:
          transaction_id || statusResponse.transaction_id,
        payment_data: {
          ...statusResponse,
          notification_received: new Date().toISOString(),
          payment_type: payment_type,
          status_message: status_message,
          fraud_status: fraud_status,
          original_transaction_status: transaction_status,
          verified_transaction_status: statusResponse.transaction_status,
        },
      },
    };

    console.log(
      `🔄 Updating order status to: ${orderStatus}, Transaction ID: ${transaction_id}`
    );
    console.log(`🔄 Using documentId: ${orderDocumentId}`);

    // Update order
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
      console.error(
        "❌ Update URL:",
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders/${orderDocumentId}`
      );
      return;
    }

    const updateResult = await updateResponse.json();
    console.log("✅ Order status updated successfully");

    // Process post-payment tasks untuk settlement
    if (orderStatus === "settlement" && order.items) {
      console.log("💰 Payment successful, processing post-payment tasks...");

      try {
        // Update stok produk
        console.log("📦 Starting stock update...");
        await updateProductStock(order.items, process.env.STRAPI_API_TOKEN);

        // Kosongkan cart user - dengan multiple fallback methods
        let userId = null;

        // Method 1: Standard Strapi v5 structure dengan data object
        if (order.users_permissions_user?.data?.id) {
          userId = order.users_permissions_user.data.id;
          console.log(
            "👤 User ID found from users_permissions_user.data.id:",
            userId
          );
        }
        // Method 2: Direct ID
        else if (order.users_permissions_user?.id) {
          userId = order.users_permissions_user.id;
          console.log(
            "👤 User ID found from users_permissions_user.id:",
            userId
          );
        }
        // Method 3: Alternative user field dengan data object
        else if (order.user?.data?.id) {
          userId = order.user.data.id;
          console.log("👤 User ID found from user.data.id:", userId);
        }
        // Method 4: Direct user ID
        else if (order.user?.id) {
          userId = order.user.id;
          console.log("👤 User ID found from user.id:", userId);
        }
        // Method 5: Cek jika users_permissions_user adalah number langsung
        else if (typeof order.users_permissions_user === "number") {
          userId = order.users_permissions_user;
          console.log(
            "👤 User ID found from users_permissions_user (direct number):",
            userId
          );
        }
        // Method 6: Cek jika user adalah number langsung
        else if (typeof order.user === "number") {
          userId = order.user;
          console.log("👤 User ID found from user (direct number):", userId);
        }

        if (userId) {
          console.log(`🛒 Clearing cart for user ID: ${userId}`);
          const cartCleared = await clearUserCart(
            userId,
            process.env.STRAPI_API_TOKEN
          );

          if (cartCleared) {
            console.log("✅ Cart cleared successfully");
          } else {
            console.error("❌ Failed to clear cart");
          }
        } else {
          console.error("❌ No user ID found in order structure");
          console.log(
            "🔍 Full users_permissions_user structure:",
            JSON.stringify(order.users_permissions_user, null, 2)
          );
          console.log(
            "🔍 Full user structure:",
            JSON.stringify(order.user, null, 2)
          );

          // Fallback: Try to find user by email
          if (order.customer_email) {
            console.log(
              `🔍 Attempting fallback: find user by email: ${order.customer_email}`
            );
            const found = await findUserByEmailAndClearCart(
              order.customer_email,
              process.env.STRAPI_API_TOKEN
            );
            if (found) {
              console.log("✅ Cart cleared using email fallback");
            } else {
              console.error("❌ Fallback method also failed");
            }
          } else {
            console.error("❌ No customer email available for fallback");
          }
        }
      } catch (error) {
        console.error("❌ Error in post-payment processing:", error);
      }
    }

    console.log("✅ Background processing completed");
  } catch (error) {
    console.error("❌ Error in background processing:", error);
  }
}

export async function POST(request) {
  try {
    console.log("🔔 ========== NOTIFICATION WEBHOOK CALLED ==========");

    const body = await request.json();
    console.log("📦 Notification received for order:", body.order_id);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
    } = body;

    // Validasi signature (hanya di production)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    if (isProduction) {
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      const generatedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (generatedSignature !== signature_key) {
        console.error("❌ Invalid signature");
        console.log("Expected:", generatedSignature);
        console.log("Received:", signature_key);
        return NextResponse.json({ status: "OK" });
      }
      console.log("✅ Signature valid");
    } else {
      console.log("🟡 Development mode: Skipping signature validation");
    }

    // Kirim response cepat ke Midtrans
    const response = NextResponse.json({
      status: "OK",
      message: "Notification received",
    });

    // Process business logic di background
    processNotificationBackground(body).catch((error) => {
      console.error("Background processing error:", error);
    });

    console.log("✅ Response sent to Midtrans, background processing started");
    return response;
  } catch (error) {
    console.error("❌ Error in notification handler:", error);
    return NextResponse.json({ status: "OK" });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
