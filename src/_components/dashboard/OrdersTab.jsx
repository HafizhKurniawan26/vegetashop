"use client";
import React, { useState } from "react";
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Eye,
  FileDown,
  ArrowLeft,
  Download,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  User,
  Mail,
  Package,
  CreditCard,
  BarChart3,
  FileText,
  TrendingUp,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import OrderDetailView from "./OrderDetailView";
import { jsPDF } from "jspdf";
import Copyright from "../Copyright";

const OrdersTab = ({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  getStatusBadge,
  settlementRevenue,
  getOrdersByStatus,
  handleViewOrder,
  handleStatusChange,
  ordersLoading,
  updateOrderStatusMutation,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setViewMode("list");
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders berdasarkan search term
  const filteredOrders = getOrdersByStatus(orderStatusFilter).filter(
    (order) =>
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistik data
  const totalOrders = orders?.length || 0;
  const settlementOrders =
    orders?.filter((o) => o.order_status === "settlement").length || 0;
  const pendingOrders =
    orders?.filter((o) => o.order_status === "pending").length || 0;
  const settlementRate =
    totalOrders > 0 ? (settlementOrders / totalOrders) * 100 : 0;

  // Fungsi untuk mengimpor autoTable secara dinamis
  const loadAutoTable = async () => {
    try {
      const { autoTable } = await import("jspdf-autotable");
      return autoTable;
    } catch (error) {
      console.error("Error loading autoTable:", error);
      throw new Error("AutoTable module not available");
    }
  };

  // Fungsi untuk download PDF seluruh orders
  const handleDownloadAllOrdersPDF = async () => {
    try {
      const autoTable = await loadAutoTable();
      const filteredOrders = getOrdersByStatus(orderStatusFilter);
      const currentDate = new Date().toLocaleDateString("id-ID");
      const currentDateTime = new Date().toLocaleString("id-ID");

      const doc = new jsPDF();

      // Header dengan gradient
      doc.setFillColor(44, 90, 160);
      doc.rect(0, 0, 210, 40, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("ORDER REPORT", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text("BUSINESS INTELLIGENCE DASHBOARD", 105, 28, { align: "center" });

      // Informasi laporan
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${currentDateTime}`, 14, 50);
      doc.text(`Vegetashop - Professional Report`, 105, 50, {
        align: "center",
      });
      doc.text(
        `Status: ${
          orderStatusFilter === "all" ? "All Status" : orderStatusFilter
        }`,
        180,
        50,
        { align: "right" }
      );

      // Tabel orders
      const tableColumn = [
        "Order ID",
        "Customer",
        "Email",
        "Amount",
        "Status",
        "Date",
        "Items",
      ];
      const tableRows = filteredOrders.map((order) => {
        const items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
        const itemsCount = Array.isArray(items) ? items.length : 0;

        return [
          order.order_id,
          order.customer_name || "-",
          order.customer_email || "-",
          `Rp ${parseFloat(order.total_amount || 0).toLocaleString("id-ID")}`,
          order.order_status.toUpperCase(),
          new Date(order.createdAt).toLocaleDateString("id-ID"),
          `${itemsCount} items`,
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [44, 90, 160],
          textColor: 255,
          fontStyle: "bold",
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: { top: 100 },
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Confidential Business Document - For Internal Use Only",
        105,
        finalY,
        { align: "center" }
      );
      doc.text(
        `Page 1 of 1 | Total Records: ${filteredOrders.length} | Generated by Automated System`,
        105,
        finalY + 5,
        { align: "center" }
      );

      doc.save(`order-report-${currentDate.replace(/\//g, "-")}.pdf`);

      setTimeout(() => {
        alert(
          `Laporan PDF berhasil diunduh!\nTotal Orders: ${filteredOrders.length}`
        );
      }, 500);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert("Gagal mengunduh laporan PDF. Silakan coba lagi.");
    }
  };

  if (ordersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-gray-50 to-gray-100"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "detail" && selectedOrder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-gray-600">
                Order ID: {selectedOrder.order_id}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${
              getStatusBadge(selectedOrder.order_status).color
            } text-sm font-medium px-3 py-1`}
          >
            {getStatusBadge(selectedOrder.order_status).label}
          </Badge>
        </div>

        <OrderDetailView
          order={selectedOrder}
          getStatusBadge={getStatusBadge}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manajemen Pesanan
          </h2>
          <p className="text-gray-600 mt-2">
            Kelola dan lacak semua pesanan pelanggan secara efisien
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleDownloadAllOrdersPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={orders.length === 0}
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Orders
            </CardTitle>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {totalOrders}
            </div>
            <p className="text-xs text-blue-700 mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Settlement
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {settlementOrders}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={settlementRate} className="h-2 flex-1" />
              <span className="text-xs text-green-700 font-medium">
                {settlementRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              Pending
            </CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {pendingOrders}
            </div>
            <p className="text-xs text-yellow-700 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Revenue
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              Rp {settlementRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-purple-700 mt-1">From settled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Order List</CardTitle>
              <CardDescription>
                {filteredOrders.length} orders found
                {searchTerm && ` for "${searchTerm}"`}
                {orderStatusFilter !== "all" &&
                  ` with status "${orderStatusFilter}"`}
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 border-gray-300 focus:border-blue-500"
                />
                {searchTerm && (
                  <X
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>

              <Select
                value={orderStatusFilter}
                onValueChange={setOrderStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="capture">Capture</SelectItem>
                  <SelectItem value="authorize">Authorize</SelectItem>
                  <SelectItem value="cancel">Cancel</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="expire">Expire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm || orderStatusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No orders have been placed yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-6 pt-0">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.order_status);
                const items =
                  typeof order.items === "string"
                    ? JSON.parse(order.items)
                    : order.items;
                const itemsCount = Array.isArray(items) ? items.length : 0;
                const isExpanded = expandedOrder === order.documentId;

                return (
                  <Card
                    key={order.documentId}
                    className="border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                  >
                    <CardContent className="px-6">
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`p-3 rounded-lg ${
                              order.order_status === "settlement"
                                ? "bg-green-100 text-green-600"
                                : order.order_status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-md">
                                {order.order_id}
                              </h3>
                              <Badge
                                variant="outline"
                                className={statusBadge.color}
                              >
                                {statusBadge.label}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>
                                  {order.customer_name || "Unknown Customer"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>
                                  {order.customer_email || "No email"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>{itemsCount} items</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              Rp{" "}
                              {parseFloat(
                                order.total_amount || 0
                              ).toLocaleString("id-ID")}
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Amount
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleOrderExpand(order.documentId)
                              }
                              className="flex items-center gap-1 border-gray-300"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              Details
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewOrderDetail(order)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={handleDownloadAllOrdersPDF}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Export PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Order Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Order ID:
                                  </span>
                                  <span className="font-medium">
                                    {order.order_id}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Payment Type:
                                  </span>
                                  <span className="font-medium">
                                    {order.payment_data?.payment_type || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Transaction Time:
                                  </span>
                                  <span className="font-medium">
                                    {new Date(
                                      order.transaction_time || order.createdAt
                                    ).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Status Management
                              </h4>
                              <div className="space-y-3">
                                <Select
                                  value={order.order_status}
                                  onValueChange={(value) =>
                                    handleStatusChange(order.documentId, value)
                                  }
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="settlement">
                                      Settlement
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="capture">
                                      Capture
                                    </SelectItem>
                                    <SelectItem value="authorize">
                                      Authorize
                                    </SelectItem>
                                    <SelectItem value="cancel">
                                      Cancel
                                    </SelectItem>
                                    <SelectItem value="deny">Deny</SelectItem>
                                    <SelectItem value="refund">
                                      Refund
                                    </SelectItem>
                                    <SelectItem value="expire">
                                      Expire
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={() => handleViewOrderDetail(order)}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Full Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Copyright />
    </div>
  );
};

export default OrdersTab;
