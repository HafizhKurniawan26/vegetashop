import React from "react";
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OverviewTab = ({
  products,
  users,
  orders,
  orderStats, // SEKARANG VALUE, BUKAN FUNCTION
  getStatusBadge,
  settlementRevenue, // SEKARANG VALUE, BUKAN FUNCTION
}) => {
  // Gunakan orderStats langsung
  const stats = orderStats || {
    totalOrders: orders?.length || 0,
    successfulOrders:
      orders?.filter((order) => order.order_status === "settlement").length ||
      0,
    pendingOrders:
      orders?.filter((order) => order.order_status === "pending").length || 0,
    failedOrders:
      orders?.filter((order) =>
        ["cancel", "deny", "expire", "failure"].includes(order.order_status)
      ).length || 0,
    successRate:
      orders?.length > 0
        ? (
            (orders.filter((order) => order.order_status === "settlement")
              .length /
              orders.length) *
            100
          ).toFixed(1)
        : "0",
  };

  // Gunakan settlementRevenue langsung
  const revenue =
    settlementRevenue ||
    orders
      ?.filter((order) => order.order_status === "settlement")
      .reduce(
        (total, order) => total + (parseFloat(order.total_amount) || 0),
        0
      ) ||
    0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Produk
            </CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {products?.length || 0}
            </div>
            <p className="text-xs text-blue-600">
              {products?.filter((p) => p.stock > 0).length || 0} produk tersedia
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Total Users
            </CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {users?.length || 0}
            </div>
            <p className="text-xs text-purple-600">Pengguna terdaftar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Total Orders
            </CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {orders?.length || 0}
            </div>
            <p className="text-xs text-green-600">
              {stats.successfulOrders} berhasil ({stats.successRate}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Total Revenue
            </CardTitle>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              Rp {revenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-orange-600">Pendapatan bersih</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Order Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders?.slice(0, 5).map((order) => {
              const statusBadge = getStatusBadge
                ? getStatusBadge(order.order_status)
                : {
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    label: order.order_status,
                  };
              return (
                <div
                  key={order.documentId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.order_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer_name} • {order.customer_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp{" "}
                      {parseFloat(order.total_amount || 0).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    <Badge variant="outline" className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada order</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
