"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Package,
  Home,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import Header from "@/_components/Header";
import Link from "next/link";

const getDisplayStatus = (orderStatus) => {
  const statusMap = {
    pending: {
      text: "Menunggu Pembayaran",
      color: "text-yellow-600",
      icon: Clock,
    },
    settlement: {
      text: "Pembayaran Berhasil",
      color: "text-green-600",
      icon: CheckCircle,
    },
    capture: {
      text: "Menunggu Verifikasi",
      color: "text-orange-600",
      icon: ShieldAlert,
    },
    authorize: {
      text: "Terverifikasi",
      color: "text-blue-600",
      icon: CheckCircle,
    },
    cancel: { text: "Dibatalkan", color: "text-red-600", icon: XCircle },
    deny: { text: "Pembayaran Ditolak", color: "text-red-600", icon: XCircle },
    refund: { text: "Dikembalikan", color: "text-purple-600", icon: Package },
    expire: { text: "Kadaluarsa", color: "text-red-600", icon: XCircle },
    failure: { text: "Gagal", color: "text-red-600", icon: XCircle },
  };

  return (
    statusMap[orderStatus] || {
      text: orderStatus,
      color: "text-gray-600",
      icon: AlertTriangle,
    }
  );
};

// Komponen loading fallback
function OrderFinishLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-50 rounded-full p-4 mb-4">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Memuat...
                </h1>
                <p className="text-blue-800">
                  Sedang memuat status pesanan Anda.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Komponen utama yang menggunakan useSearchParams
function OrderFinishContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState("loading");
  const [orderData, setOrderData] = useState(null);
  const [jwt, setJwt] = useState(null);

  const orderId = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status");

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (token) setJwt(token);
  }, []);

  useEffect(() => {
    if (!orderId || !jwt) return;

    const checkOrderStatus = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[order_id][$eq]=${orderId}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        const order = data.data?.[0];

        if (order) {
          setOrderData(order);
          setOrderStatus(order.order_status);
        } else {
          setOrderStatus("not_found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrderStatus("error");
      }
    };

    checkOrderStatus();

    // Polling untuk update status real-time
    const interval = setInterval(checkOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId, jwt]);

  const getStatusConfig = () => {
    const displayStatus = getDisplayStatus(orderStatus);
    const StatusIcon = displayStatus.icon;

    switch (orderStatus) {
      case "settlement":
      case "authorize":
        return {
          icon: <StatusIcon className="w-16 h-16 text-green-600" />,
          title: "Pembayaran Berhasil!",
          description: "Terima kasih! Pesanan Anda sedang diproses.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
        };
      case "pending":
        return {
          icon: <StatusIcon className="w-16 h-16 text-yellow-600" />,
          title: "Menunggu Pembayaran",
          description:
            "Silakan selesaikan pembayaran Anda. Pesanan akan diproses setelah pembayaran dikonfirmasi.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        };
      case "capture":
        return {
          icon: <StatusIcon className="w-16 h-16 text-orange-600" />,
          title: "Menunggu Verifikasi",
          description:
            "Pembayaran Anda sedang diverifikasi. Mohon tunggu konfirmasi dari pihak bank.",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-800",
        };
      case "cancel":
      case "deny":
      case "expire":
      case "failure":
        return {
          icon: <StatusIcon className="w-16 h-16 text-red-600" />,
          title: "Pembayaran Gagal",
          description:
            "Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      case "refund":
        return {
          icon: <StatusIcon className="w-16 h-16 text-purple-600" />,
          title: "Pembayaran Dikembalikan",
          description: "Pembayaran Anda telah dikembalikan.",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-800",
        };
      case "loading":
        return {
          icon: <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />,
          title: "Memproses...",
          description:
            "Mohon tunggu, kami sedang memverifikasi pembayaran Anda.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
        };
      case "not_found":
        return {
          icon: <XCircle className="w-16 h-16 text-gray-600" />,
          title: "Order Tidak Ditemukan",
          description: "Order ID tidak valid atau order tidak ditemukan.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
        };
      case "error":
        return {
          icon: <XCircle className="w-16 h-16 text-red-600" />,
          title: "Terjadi Kesalahan",
          description: "Terjadi kesalahan saat memuat data order.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-gray-600" />,
          title: "Status Tidak Diketahui",
          description: "Terjadi kesalahan. Silakan hubungi customer service.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const displayStatus = getDisplayStatus(orderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className={`${statusConfig.borderColor} border-2`}>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`${statusConfig.bgColor} rounded-full p-4 mb-4`}
                >
                  {statusConfig.icon}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {statusConfig.title}
                </h1>
                <p className={`${statusConfig.textColor} mb-2`}>
                  {statusConfig.description}
                </p>
                <p className={`text-sm font-medium ${displayStatus.color}`}>
                  Status: {displayStatus.text}
                </p>
              </div>

              {orderData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Detail Pesanan
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-green-600">
                        Rp{" "}
                        {orderData.total_amount?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium capitalize ${displayStatus.color}`}
                      >
                        {displayStatus.text}
                      </span>
                    </div>
                    {orderData.midtrans_transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-xs">
                          {orderData.midtrans_transaction_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/orders")}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Lihat Pesanan Saya
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>

              {orderStatus === "pending" && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Jika Anda sudah melakukan pembayaran,
                    status akan diperbarui secara otomatis dalam beberapa menit.
                    Anda dapat memeriksa status pesanan di halaman "Pesanan
                    Saya".
                  </p>
                </div>
              )}

              {orderStatus === "capture" && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Perhatian:</strong> Pembayaran Anda sedang
                    diverifikasi oleh pihak bank. Proses ini biasanya memakan
                    waktu 1-2 jam kerja. Anda akan menerima notifikasi ketika
                    status berubah.
                  </p>
                </div>
              )}

              {orderStatus === "settlement" && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Pesanan Diproses:</strong> Pembayaran Anda telah
                    dikonfirmasi. Pesanan sedang dipersiapkan untuk dikirim.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Export default dengan Suspense
export default function OrderFinishPage() {
  return (
    <Suspense fallback={<OrderFinishLoading />}>
      <OrderFinishContent />
    </Suspense>
  );
}
