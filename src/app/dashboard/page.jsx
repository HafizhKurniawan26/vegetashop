"use client";
import React from "react";

// Custom Hooks
import { useDashboard } from "@/_hooks/useDashboard";
import { useDashboardNavigation } from "@/_hooks/useDashboardNavigation";
import { useDashboardProducts } from "@/_hooks/useDashboardProducts";
import { useDashboardCategories } from "@/_hooks/useDashboardCategories";
import { useDashboardOrders } from "@/_hooks/useDashboardOrders";
import { useDashboardUsers } from "@/_hooks/useDashboardUsers";
import { useDashboardAnalytics } from "@/_hooks/useDashboardAnalytics";

// UI Components
import Sidebar from "@/_components/dashboard/Sidebar";
import OverviewTab from "@/_components/dashboard/OverviewTab";
import ProductsTab from "@/_components/dashboard/ProductsTab";
import CategoriesTab from "@/_components/dashboard/CategoriesTab";
import OrdersTab from "@/_components/dashboard/OrdersTab";
import AnalyticsTab from "@/_components/dashboard/AnalyticsTab";
import ProductModal from "@/_components/dashboard/ProductModal";
import CategoryModal from "@/_components/dashboard/CategoryModal";

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
  const categoriesHook = useDashboardCategories(jwt, isAdmin);
  const ordersHook = useDashboardOrders(jwt, isAdmin);
  const usersHook = useDashboardUsers(jwt, isAdmin);

  // Analytics functions
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
    <div className="min-h-dvh bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        navItems={navItems}
        activeTab={activeTab}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
        mobileSidebarOpen={mobileSidebarOpen}
        sidebarOpen={sidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        {/* Top Header - Fixed */}
        <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navItems.find((item) => item.id === activeTab)?.label ||
                    "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">
                  Kelola toko Anda dengan mudah
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user?.username}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="h-full p-6">
            <div className="max-w-7xl mx-auto h-full">
              <Tabs
                value={activeTab}
                onValueChange={handleNavigation}
                className="h-full space-y-6"
              >
                {/* Overview Tab */}
                <TabsContent value="overview" className="h-full mt-0">
                  <div className="h-full">
                    <OverviewTab
                      products={productsHook.products}
                      users={usersHook.users}
                      orders={ordersHook.orders}
                      orderStats={analytics.orderStats}
                      getStatusBadge={ordersHook.getStatusBadge}
                      settlementRevenue={analytics.settlementRevenue}
                    />
                  </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="h-full mt-0">
                  <div className="h-full">
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
                  </div>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="h-full mt-0">
                  <div className="h-full">
                    <CategoriesTab
                      categories={categoriesHook.categories}
                      searchCategoryQuery={categoriesHook.searchCategoryQuery}
                      setSearchCategoryQuery={
                        categoriesHook.setSearchCategoryQuery
                      }
                      setIsCategoryModalOpen={
                        categoriesHook.setIsCategoryModalOpen
                      }
                      handleEditCategory={categoriesHook.handleEditCategory}
                      handleDeleteCategory={categoriesHook.handleDeleteCategory}
                      categoriesLoading={categoriesHook.categoriesLoading}
                      deleteCategoryDialogOpen={
                        categoriesHook.deleteCategoryDialogOpen
                      }
                      setDeleteCategoryDialogOpen={
                        categoriesHook.setDeleteCategoryDialogOpen
                      }
                      categoryToDelete={categoriesHook.categoryToDelete}
                      handleConfirmDeleteCategory={
                        categoriesHook.handleConfirmDeleteCategory
                      }
                      handleCancelDeleteCategory={
                        categoriesHook.handleCancelDeleteCategory
                      }
                      deleteCategoryMutation={
                        categoriesHook.deleteCategoryMutation
                      }
                      getProductsCountByCategory={
                        categoriesHook.getProductsCountByCategory
                      }
                    />
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="h-full mt-0">
                  <div className="h-full">
                    <OrdersTab
                      orders={ordersHook.orders}
                      orderStatusFilter={ordersHook.orderStatusFilter}
                      setOrderStatusFilter={ordersHook.setOrderStatusFilter}
                      getStatusBadge={ordersHook.getStatusBadge}
                      settlementRevenue={analytics.settlementRevenue}
                      getOrdersByStatus={ordersHook.getOrdersByStatus}
                      handleViewOrder={ordersHook.handleViewOrder}
                      handleStatusChange={ordersHook.handleStatusChange}
                      ordersLoading={ordersHook.ordersLoading}
                      updateOrderStatusMutation={
                        ordersHook.updateOrderStatusMutation
                      }
                    />
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="h-full mt-0">
                  <div className="h-full">
                    <AnalyticsTab
                      bestSellingProducts={analytics.bestSellingProducts}
                      categoryPerformance={analytics.categoryPerformance}
                      orderStats={analytics.orderStats}
                      revenueTrends={analytics.revenueTrends}
                      userGrowth={analytics.userGrowth}
                      categories={productsHook.categories}
                      products={productsHook.products}
                      orders={ordersHook.orders}
                      users={usersHook.users}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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
        categories={categoriesHook.categories}
        handleImageChange={productsHook.handleImageChange}
        handleSubmitProduct={productsHook.handleSubmitProduct}
        createProductMutation={productsHook.createProductMutation}
        updateProductMutation={productsHook.updateProductMutation}
      />

      <CategoryModal
        isCategoryModalOpen={categoriesHook.isCategoryModalOpen}
        handleCategoryModalClose={categoriesHook.handleCategoryModalClose}
        editingCategory={categoriesHook.editingCategory}
        categoryForm={categoriesHook.categoryForm}
        setCategoryForm={categoriesHook.setCategoryForm}
        handleSubmitCategory={categoriesHook.handleSubmitCategory}
        createCategoryMutation={categoriesHook.createCategoryMutation}
        updateCategoryMutation={categoriesHook.updateCategoryMutation}
      />
    </div>
  );
}
