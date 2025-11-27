import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// Handle GET request untuk finish redirect dari Midtrans
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get("order_id");
    const transaction_status = searchParams.get("transaction_status");
    const status_code = searchParams.get("status_code");

    console.log("🔄 GET callback received:", {
      order_id,
      transaction_status,
      status_code,
    });

    if (!order_id) {
      console.error("❌ No order_id in GET callback");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/error`
      );
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order/finish?order_id=${order_id}&transaction_status=${transaction_status}&status_code=${status_code}`;

    console.log(`🔀 Redirecting to: ${redirectUrl}`);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ GET callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/order/error`
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log(
      "📨 POST callback received (deprecated - use /notification):",
      body
    );

    // Redirect ke notification handler yang benar
    return NextResponse.json({
      message: "Please use /api/payment/notification for webhooks",
    });
  } catch (error) {
    console.error("❌ POST callback error:", error);
    return NextResponse.json(
      { error: error.message || "Callback processing failed" },
      { status: 500 }
    );
  }
}
