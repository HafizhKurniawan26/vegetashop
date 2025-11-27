import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const { orderId, grossAmount, items, customerDetails, userId, jwt } =
      await request.json();

    // Validasi input
    if (
      !orderId ||
      !grossAmount ||
      !items ||
      !customerDetails ||
      !userId ||
      !jwt
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting checkout process for order:", orderId);

    // Cek stok untuk semua items (kecuali shipping)
    const stockCheckPromises = items
      .filter((item) => item.category !== "shipping")
      .map(async (item) => {
        console.log(`🔍 Checking stock for documentId: ${item.id}`);

        const productResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/products?filters[documentId][$eq]=${item.id}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (!productResponse.ok) {
          throw new Error(`Failed to fetch product ${item.id}`);
        }

        const productData = await productResponse.json();
        const product = productData.data?.[0];

        if (!product) {
          throw new Error(`Produk dengan ID ${item.id} tidak ditemukan`);
        }

        console.log(
          `📊 Stock check - Product: ${product.name}, Available: ${product.stock}, Requested: ${item.quantity}`
        );

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok tidak mencukupi untuk ${item.name}. Stok tersedia: ${product.stock}`
          );
        }

        return {
          documentId: product.documentId,
          currentStock: product.stock,
          quantity: item.quantity,
        };
      });

    const stockCheckResults = await Promise.all(stockCheckPromises);
    console.log("✅ Stock check passed:", stockCheckResults);

    // **PERBAIKAN: Gunakan users_permissions_user bukan user**
    const orderPayload = {
      data: {
        order_id: orderId,
        order_status: "pending",
        total_amount: parseFloat(grossAmount),
        customer_name:
          `${customerDetails.first_name} ${customerDetails.last_name}`.trim(),
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        shipping_address: customerDetails.shipping_address,
        items: items,
        users_permissions_user: userId, // **INI YANG DIPERBAIKI**
        midtrans_transaction_id: null,
        payment_data: {
          payment_type: null,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      },
    };

    console.log(
      "📝 Creating order with payload:",
      JSON.stringify(orderPayload, null, 2)
    );

    const orderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("❌ Failed to create order:", errorData);
      throw new Error(
        "Gagal membuat order: " + (errorData.error?.message || "Unknown error")
      );
    }

    const orderData = await orderResponse.json();
    console.log("✅ Order created successfully:", orderData);

    // Initialize Snap client
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // Prepare transaction parameters
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
        category: item.category || "groceries",
      })),
      customer_details: {
        first_name: customerDetails.first_name,
        last_name: customerDetails.last_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: customerDetails.billing_address,
        shipping_address: customerDetails.shipping_address,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/order/finish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/order/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/order/pending`,
      },
      expiry: {
        unit: "hours",
        duration: 24,
      },
    };

    console.log("💳 Creating Midtrans transaction...");

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    console.log("✅ Midtrans transaction created:", {
      token: transaction.token,
      order_id: orderId,
    });

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
