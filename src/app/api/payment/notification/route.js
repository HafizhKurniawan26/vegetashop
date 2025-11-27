import { NextResponse } from "next/server";

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
      signature_key,
    } = notification;

    // Log important fields
    console.log("🔍 EXTRACTED FIELDS:", {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      gross_amount,
      status_code,
    });

    // Validate required fields
    if (!order_id) {
      console.error("❌ MISSING ORDER_ID");
      return NextResponse.json(
        { status: "error", message: "Missing order_id" },
        { status: 400 }
      );
    }

    if (!transaction_status) {
      console.error("❌ MISSING TRANSACTION_STATUS");
      return NextResponse.json(
        { status: "error", message: "Missing transaction_status" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 PROCESSING: Order ${order_id}, Status: ${transaction_status}`
    );

    // STEP 1: Find order in Strapi
    console.log(`🔍 SEARCHING ORDER IN STRAPI: ${order_id}`);

    const searchUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[order_id][$eq]=${order_id}`;
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
          details: errorText,
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
    const orderDocumentId = order.documentId || order.id;

    console.log(`✅ ORDER FOUND:`, {
      documentId: orderDocumentId,
      current_status: order.order_status,
      customer_email: order.customer_email,
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
          raw_notification: notification, // Store full notification for debugging
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
          details: updateError,
        },
        { status: 500 }
      );
    }

    const updateResult = await updateResponse.json();
    console.log(
      "✅ STRAPI UPDATE SUCCESS:",
      JSON.stringify(updateResult, null, 2)
    );

    // STEP 4: Handle successful payments
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      console.log("💰 PAYMENT SUCCESS - PROCESSING POST-PAYMENT TASKS");

      try {
        await handleSuccessfulPayment(order, notification);
      } catch (postPaymentError) {
        console.error(
          "⚠️ POST-PAYMENT ERROR (non-critical):",
          postPaymentError
        );
      }
    }

    console.log("🎉 NOTIFICATION PROCESSING COMPLETED SUCCESSFULLY");

    // Always return success to Midtrans
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

// Post-payment handling
async function handleSuccessfulPayment(order, notification) {
  console.log("🔄 STARTING POST-PAYMENT PROCESSING");

  // 1. Update product stock
  if (order.items && Array.isArray(order.items)) {
    console.log(`📦 UPDATING STOCK FOR ${order.items.length} ITEMS`);

    for (const item of order.items) {
      if (item.category !== "shipping" && item.id) {
        await updateProductStock(item.id, item.quantity);
      }
    }
  }

  // 2. Clear user cart
  if (order.users_permissions_user) {
    const userId =
      order.users_permissions_user.id || order.users_permissions_user;
    console.log(`🛒 CLEARING CART FOR USER: ${userId}`);
    await clearUserCart(userId);
  }

  console.log("✅ POST-PAYMENT PROCESSING COMPLETED");
}

async function updateProductStock(productId, quantity) {
  try {
    console.log(
      `🔍 UPDATING STOCK: Product ${productId}, Quantity ${quantity}`
    );

    // Get current product
    const productResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products?filters[documentId][$eq]=${productId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!productResponse.ok) {
      console.error(`❌ FAILED TO FETCH PRODUCT ${productId}`);
      return;
    }

    const productData = await productResponse.json();
    const product = productData.data?.[0];

    if (!product) {
      console.error(`❌ PRODUCT ${productId} NOT FOUND`);
      return;
    }

    const newStock = Math.max(0, product.stock - quantity);
    console.log(
      `📊 STOCK UPDATE: ${product.name} - ${product.stock} → ${newStock}`
    );

    // Update product stock
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

    if (!updateResponse.ok) {
      console.error(`❌ FAILED TO UPDATE STOCK FOR ${productId}`);
      return;
    }

    console.log(`✅ STOCK UPDATED FOR: ${product.name}`);
  } catch (error) {
    console.error(`❌ STOCK UPDATE ERROR FOR ${productId}:`, error);
  }
}

async function clearUserCart(userId) {
  try {
    console.log(`🛒 CLEARING CART FOR USER: ${userId}`);

    // Get cart items
    const cartResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts?filters[users_permissions_user][id][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!cartResponse.ok) {
      console.error(`❌ FAILED TO FETCH CART FOR USER ${userId}`);
      return;
    }

    const cartData = await cartResponse.json();
    const cartItems = cartData.data || [];

    console.log(`🗑️ FOUND ${cartItems.length} CART ITEMS TO DELETE`);

    // Delete all cart items
    for (const item of cartItems) {
      const itemId = item.documentId || item.id;

      await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/user-carts/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );

      console.log(`✅ DELETED CART ITEM: ${itemId}`);
    }

    console.log(`✅ CART CLEARED FOR USER: ${userId}`);
  } catch (error) {
    console.error(`❌ CART CLEARING ERROR FOR USER ${userId}:`, error);
  }
}

// For testing
export async function GET() {
  return NextResponse.json({
    message: "Payment notification endpoint is running",
    timestamp: new Date().toISOString(),
    environment: {
      strapi_url: process.env.NEXT_PUBLIC_STRAPI_API_URL ? "SET" : "MISSING",
      has_api_token: !!process.env.STRAPI_API_TOKEN,
    },
  });
}
