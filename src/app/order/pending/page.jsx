"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrderPending() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const order_id = searchParams.get("order_id");

    if (order_id) {
      setOrderData({
        orderId: order_id,
        status: "pending",
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Menunggu Pembayaran
              </h1>
              <p className="text-gray-600">
                Silakan selesaikan pembayaran Anda. Pesanan akan diproses
                setelah pembayaran berhasil.
              </p>
            </div>

            {orderData && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-semibold text-gray-900">
                  {orderData.orderId}
                </p>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {orderData.status.toUpperCase()}
                </Badge>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/orders">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Lihat Pesanan Saya
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
