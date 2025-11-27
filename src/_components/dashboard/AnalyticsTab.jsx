import React from "react";
import {
  TrendingUp,
  Tag,
  BarChart3,
  Users,
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  X,
  Calendar,
  ArrowUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Copyright from "../Copyright";

const AnalyticsTab = ({
  bestSellingProducts,
  categoryPerformance,
  orderStats,
  revenueTrends,
  userGrowth,
  categories,
  products,
  orders,
  users,
}) => {
  // Enhanced debug info
  console.log("📊 ANALYTICS TAB - Final Data:", {
    bestSellingProducts: bestSellingProducts?.map((p) => ({
      name: p.product?.name,
      sold: p.totalSold,
      revenue: p.totalRevenue,
    })),
    categoryPerformance: Object.entries(categoryPerformance || {}).map(
      ([key, value]) => ({
        category: value.category?.name,
        sold: value.totalSold,
        revenue: value.totalRevenue,
      })
    ),
    revenueTrends,
    userGrowth,
    settlementOrders: orders?.filter((o) => o.order_status === "settlement")
      .length,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Produk Terlaris ({bestSellingProducts?.length || 0})
            </CardTitle>
            <CardDescription>
              Berdasarkan{" "}
              {orders?.filter((o) => o.order_status === "settlement").length ||
                0}{" "}
              orders settlement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellingProducts?.map((item, index) => (
                <div
                  key={item.product?.documentId || index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Terjual: {item.totalSold || 0} unit •{" "}
                        {item.orderCount || 0} order
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Rp {item.totalRevenue?.toLocaleString("id-ID") || "0"}
                    </Badge>
                  </div>
                </div>
              ))}

              {(!bestSellingProducts || bestSellingProducts.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Belum ada data penjualan</p>
                  <div className="mt-3 text-sm space-y-1">
                    <p>Kemungkinan penyebab:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Tidak ada orders dengan status "settlement"</li>
                      <li>• Format data items tidak sesuai</li>
                      <li>• Product matching tidak berhasil</li>
                      <li>• Data items kosong atau tidak terbaca</li>
                    </ul>
                  </div>
                  {/* <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <p>
                      <strong>Debug Info:</strong>
                    </p>
                    <p>
                      Settlement Orders:{" "}
                      {orders?.filter((o) => o.order_status === "settlement")
                        .length || 0}
                    </p>
                    <p>Total Products: {products?.length || 0}</p>
                  </div> */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performa Kategori - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Performa Kategori (
              {
                Object.keys(categoryPerformance || {}).filter(
                  (key) => categoryPerformance[key]?.totalSold > 0
                ).length
              }
              )
            </CardTitle>
            <CardDescription>
              Berdasarkan penjualan produk per kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories
                ?.map((category) => {
                  const performance =
                    categoryPerformance?.[category.documentId];

                  if (!performance || performance.totalSold === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={category.documentId}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 block">
                            {category.name}
                          </span>
                          <p className="text-xs text-gray-500">
                            {performance.totalSold} unit terjual •{" "}
                            {performance.products?.length || 0} produk
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {performance.totalRevenue > 0 && (
                          <p className="font-semibold text-purple-600">
                            Rp{" "}
                            {performance.totalRevenue.toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}

              {Object.keys(categoryPerformance || {}).filter(
                (key) => categoryPerformance[key]?.totalSold > 0
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Belum ada performa kategori</p>
                  <div className="mt-3 text-sm space-y-1">
                    <p>Kemungkinan penyebab:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Tidak ada produk yang terjual</li>
                      <li>• Produk tidak memiliki kategori</li>
                      <li>• Kategori tidak match dengan produk</li>
                    </ul>
                  </div>
                  {/* <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <p>
                      <strong>Debug Info:</strong>
                    </p>
                    <p>Total Categories: {categories?.length || 0}</p>
                    <p>
                      Products with Categories:{" "}
                      {products?.filter((p) => p.categories?.length > 0)
                        .length || 0}
                    </p>
                  </div> */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Statistik lainnya tetap sama... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Statistik Pengguna ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {users?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {orders?.filter(
                      (order) => order.order_status === "settlement"
                    ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Customer Aktif
                  </div>
                </div>
              </div>

              {/* User Growth */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Pertumbuhan User ({userGrowth?.length || 0} Bulan)
                </h4>
                <div className="space-y-2">
                  {userGrowth?.map(([month, count]) => (
                    <div
                      key={month}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">
                        {new Date(month + "-01").toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count} user</span>
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                  {(!userGrowth || userGrowth.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Tidak ada data pertumbuhan user</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Trend Revenue ({revenueTrends?.length || 0} Bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueTrends?.map(([month, revenue]) => (
                <div
                  key={month}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <span className="text-sm text-gray-600">
                    {new Date(month + "-01").toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      Rp {revenue.toLocaleString("id-ID")}
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
              {(!revenueTrends || revenueTrends.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Tidak ada data revenue</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Order Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Statistik Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {orderStats?.totalOrders || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Orders</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {orderStats?.successfulOrders || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Berhasil</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {orderStats?.pendingOrders || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {orderStats?.failedOrders || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Gagal</div>
            </div>
          </div>
          {orderStats && (
            <div className="mt-4 text-center">
              <Badge
                variant={
                  parseFloat(orderStats.successRate) > 80
                    ? "default"
                    : parseFloat(orderStats.successRate) > 60
                    ? "secondary"
                    : "destructive"
                }
              >
                Success Rate: {orderStats.successRate}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      <Copyright />
    </div>
  );
};

export default AnalyticsTab;
