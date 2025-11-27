"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/_components/Header";
import Link from "next/link";

export default function OrdersPage() {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const userData = sessionStorage.getItem("user");
    if (token) setJwt(token);
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
  }, []);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", user?.id, jwt],
    queryFn: async () => {
      if (!jwt || !user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("🔍 Fetching orders for user:", user.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/orders?filters[users_permissions_user][id][$eq]=${user.id}&sort=createdAt:desc`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Failed to fetch orders:", errorData);
        throw new Error(
          `Failed to fetch orders: ${
            errorData.error?.message || response.status
          }`
        );
      }

      const data = await response.json();
      console.log("✅ Orders data received:", data);
      return data;
    },
    enabled: !!jwt && !!user?.id,
  });

  const orders = ordersData?.data || [];

  // Filter orders berdasarkan search dan status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_id
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case "settlement":
      case "authorize":
        return "default"; // Green/primary untuk success
      case "pending":
        return "secondary"; // Gray untuk pending
      case "capture":
        return "secondary"; // Orange untuk verifikasi
      case "deny":
      case "expire":
      case "cancel":
      case "failure":
        return "destructive"; // Red untuk failed
      case "refund":
      case "chargeback":
        return "outline"; // Outline untuk refund/chargeback
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "settlement":
      case "authorize":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "capture":
        return <ShieldAlert className="w-4 h-4" />;
      case "deny":
      case "expire":
      case "cancel":
      case "failure":
        return <XCircle className="w-4 h-4" />;
      case "refund":
      case "chargeback":
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "Format tanggal tidak valid";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "settlement":
        return "Pembayaran Berhasil";
      case "authorize":
        return "Terverifikasi";
      case "pending":
        return "Menunggu Pembayaran";
      case "capture":
        return "Menunggu Verifikasi";
      case "deny":
        return "Pembayaran Ditolak";
      case "expire":
        return "Kadaluarsa";
      case "cancel":
        return "Dibatalkan";
      case "refund":
        return "Dikembalikan";
      case "chargeback":
        return "Chargeback";
      case "failure":
        return "Gagal";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
              <p className="text-gray-600">
                Lihat riwayat dan status pesanan Anda
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredOrders.length} pesanan
          </Badge>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Gagal memuat pesanan</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-red-600">
                <p>Field yang digunakan: users_permissions_user</p>
                <p>User ID: {user?.id}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className="whitespace-nowrap"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Semua
                </Button>
                <Button
                  variant={statusFilter === "paid" ? "default" : "outline"}
                  onClick={() => setStatusFilter("paid")}
                  className="whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Berhasil
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "secondary" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  className="whitespace-nowrap"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
                <Button
                  variant={
                    ["failed", "expired", "canceled"].includes(statusFilter)
                      ? "destructive"
                      : "outline"
                  }
                  onClick={() => setStatusFilter("failed")}
                  className="whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Gagal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat pesanan...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "Tidak ada pesanan yang sesuai"
                  : "Belum ada pesanan"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Coba ubah pencarian atau filter Anda"
                  : "Yuk, mulai berbelanja produk segar favorit Anda!"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/">Mulai Belanja</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                getStatusVariant={getStatusVariant}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  getStatusVariant,
  getStatusIcon,
  getStatusText,
  formatDate,
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total items
  const totalItems =
    order.items
      ?.filter((item) => item && item.category !== "shipping")
      ?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {order.order_id || `Order-${order.id}`}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant={getStatusVariant(order.order_status)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(order.order_status)}
              {getStatusText(order.order_status)}
            </Badge>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                Rp {order.total_amount?.toLocaleString("id-ID") || "0"}
              </p>
              <p className="text-sm text-gray-500">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Pelanggan:</span>
              <span>{order.customer_name || "Tidak tersedia"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Email:</span>
              <span>{order.customer_email || "Tidak tersedia"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Telepon:</span>
              <span>{order.customer_phone || "Tidak tersedia"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium">Alamat:</span>
                <p className="text-gray-600">
                  {order.shipping_address ? (
                    <>
                      {order.shipping_address.address},{" "}
                      {order.shipping_address.city}
                      {order.shipping_address.postal_code &&
                        `, ${order.shipping_address.postal_code}`}
                    </>
                  ) : (
                    "Alamat tidak tersedia"
                  )}
                </p>
                {order.shipping_address?.notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Catatan: {order.shipping_address.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? "Sembunyikan" : "Lihat"} Detail Pesanan
        </Button>

        {/* Order Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Items Pesanan:</h4>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map(
                  (item, index) =>
                    item && (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-lg">
                              {item.category === "shipping" ? "🚚" : "🥦"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name || "Item"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.category === "shipping"
                                ? "Biaya pengiriman"
                                : `${item.quantity || 0} x Rp ${(
                                    item.price || 0
                                  )?.toLocaleString("id-ID")}`}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">
                          Rp{" "}
                          {(
                            (item.price || 0) * (item.quantity || 0)
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    )
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Tidak ada items dalam pesanan ini
              </p>
            )}

            {/* Payment Info */}
            {order.payment_data && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Info Pembayaran:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Metode Pembayaran:</p>
                    <p className="text-gray-600 capitalize">
                      {order.payment_data.payment_type || "Midtrans"}
                    </p>
                  </div>
                  {order.midtrans_transaction_id && (
                    <div>
                      <p className="font-medium">ID Transaksi:</p>
                      <p className="text-gray-600 font-mono text-xs">
                        {order.midtrans_transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
