"use client";
import React from "react";

// Custom Hooks
import { useDashboard } from "@/_hooks/useDashboard";
import { useDashboardNavigation } from "@/_hooks/useDashboardNavigation";
import { useDashboardProducts } from "@/_hooks/useDashboardProducts";
import { useDashboardOrders } from "@/_hooks/useDashboardOrders";
import { useDashboardUsers } from "@/_hooks/useDashboardUsers";
import { useDashboardAnalytics } from "@/_hooks/useDashboardAnalytics";

// UI Components
import Sidebar from "@/_components/dashboard/Sidebar";
import OverviewTab from "@/_components/dashboard/OverviewTab";
import ProductsTab from "@/_components/dashboard/ProductsTab";
import OrdersTab from "@/_components/dashboard/OrdersTab";
import AnalyticsTab from "@/_components/dashboard/AnalyticsTab";
import ProductModal from "@/_components/dashboard/ProductModal";

// UI Components dari shadcn
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  // Custom Hooks
  const { user, jwt, isAdmin, isLoading: authLoading } = useDashboard();
  const {
    activeTab,
    sidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    navItems,
    handleLogout,
    handleNavigation,
  } = useDashboardNavigation();

  const productsHook = useDashboardProducts(jwt, isAdmin);
  const ordersHook = useDashboardOrders(jwt, isAdmin);
  const usersHook = useDashboardUsers(jwt, isAdmin);

  // Analytics functions - SEKARANG MENGGUNAKAN useMemo
  const analytics = useDashboardAnalytics(
    ordersHook.orders,
    productsHook.products,
    usersHook.users,
    productsHook.categories
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki akses ke halaman dashboard.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        navItems={navItems}
        activeTab={activeTab}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
        mobileSidebarOpen={mobileSidebarOpen}
        sidebarOpen={sidebarOpen}
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navItems.find((item) => item.id === activeTab)?.label ||
                    "Dashboard"}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={handleNavigation}
              className="space-y-6"
            >
              {/* Overview Tab */}
              <TabsContent value="overview">
                <OverviewTab
                  products={productsHook.products}
                  users={usersHook.users}
                  orders={ordersHook.orders}
                  orderStats={analytics.orderStats} // SEKARANG VALUE
                  getStatusBadge={ordersHook.getStatusBadge}
                  settlementRevenue={analytics.settlementRevenue} // SEKARANG VALUE
                />
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products">
                <ProductsTab
                  products={productsHook.products}
                  searchQuery={productsHook.searchQuery}
                  setSearchQuery={productsHook.setSearchQuery}
                  setIsProductModalOpen={productsHook.setIsProductModalOpen}
                  getCategoryName={productsHook.getCategoryName}
                  handleEditProduct={productsHook.handleEditProduct}
                  handleDeleteProduct={productsHook.handleDeleteProduct}
                  productsLoading={productsHook.productsLoading}
                  deleteDialogOpen={productsHook.deleteDialogOpen}
                  setDeleteDialogOpen={productsHook.setDeleteDialogOpen}
                  productToDelete={productsHook.productToDelete}
                  handleConfirmDelete={productsHook.handleConfirmDelete}
                  handleCancelDelete={productsHook.handleCancelDelete}
                  deleteProductMutation={productsHook.deleteProductMutation}
                />
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <OrdersTab
                  orders={ordersHook.orders}
                  orderStatusFilter={ordersHook.orderStatusFilter}
                  setOrderStatusFilter={ordersHook.setOrderStatusFilter}
                  getStatusBadge={ordersHook.getStatusBadge}
                  settlementRevenue={analytics.settlementRevenue} // SEKARANG VALUE
                  getOrdersByStatus={ordersHook.getOrdersByStatus}
                  handleViewOrder={ordersHook.handleViewOrder}
                  handleStatusChange={ordersHook.handleStatusChange}
                  ordersLoading={ordersHook.ordersLoading}
                  updateOrderStatusMutation={
                    ordersHook.updateOrderStatusMutation
                  }
                />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <AnalyticsTab
                  bestSellingProducts={analytics.bestSellingProducts} // SEKARANG VALUE
                  categoryPerformance={analytics.categoryPerformance} // SEKARANG VALUE
                  orderStats={analytics.orderStats} // SEKARANG VALUE
                  revenueTrends={analytics.revenueTrends} // SEKARANG VALUE
                  userGrowth={analytics.userGrowth} // SEKARANG VALUE
                  categories={productsHook.categories}
                  products={productsHook.products}
                  orders={ordersHook.orders}
                  users={usersHook.users}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isProductModalOpen={productsHook.isProductModalOpen}
        handleModalClose={productsHook.handleModalClose}
        editingProduct={productsHook.editingProduct}
        productForm={productsHook.productForm}
        setProductForm={productsHook.setProductForm}
        categories={productsHook.categories}
        handleImageChange={productsHook.handleImageChange}
        handleSubmitProduct={productsHook.handleSubmitProduct}
        createProductMutation={productsHook.createProductMutation}
        updateProductMutation={productsHook.updateProductMutation}
      />
    </div>
  );
}
