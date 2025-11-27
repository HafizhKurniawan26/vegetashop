import { NextResponse } from "next/server";
import globalApi from "@/_utils/globalApi";

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    const strapiToken = process.env.STRAPI_API_TOKEN;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Debugging order: ${orderId}`);

    // Cek order di Strapi
    const orderResponse = await globalApi.getOrderByOrderId(
      strapiToken,
      orderId
    );
    const order = orderResponse.data?.[0];

    return NextResponse.json({
      orderExists: !!order,
      orderData: order || null,
      rawResponse: orderResponse,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  try {
    const strapiToken = process.env.STRAPI_API_TOKEN;
    const orderResponse = await globalApi.getOrderByOrderId(
      strapiToken,
      orderId
    );
    const order = orderResponse.data?.[0];

    return NextResponse.json({
      orderExists: !!order,
      orderData: order || null,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
