import React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Copyright from "../Copyright";

const CategoriesTab = ({
  categories,
  searchCategoryQuery,
  setSearchCategoryQuery,
  setIsCategoryModalOpen,
  handleEditCategory,
  handleDeleteCategory,
  categoriesLoading,
  deleteCategoryDialogOpen,
  setDeleteCategoryDialogOpen,
  categoryToDelete,
  handleConfirmDeleteCategory,
  handleCancelDeleteCategory,
  deleteCategoryMutation,
  getProductsCountByCategory,
}) => {
  if (categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>
              <h2 className="text-2xl">Manajemen Kategori</h2>
            </CardTitle>
            <CardDescription>
              <h3 className="text-lg">Kelola kategori produk toko Anda</h3>
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchCategoryQuery}
              onChange={(e) => setSearchCategoryQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const productsCount = getProductsCountByCategory(
              category.documentId
            );
            const canDelete = productsCount === 0;

            return (
              <div
                key={category.documentId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    {/* HAPUS TAMPILAN DESCRIPTION */}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge
                    variant={productsCount > 0 ? "default" : "outline"}
                    className={
                      productsCount > 0
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {productsCount} produk
                  </Badge>

                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Kategori</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog
                            open={
                              deleteCategoryDialogOpen &&
                              categoryToDelete === category.documentId
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setDeleteCategoryDialogOpen(false);
                                handleCancelDeleteCategory();
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category.documentId)
                                }
                                className={`hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
                                  canDelete
                                    ? "border-red-200 text-red-500"
                                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                disabled={!canDelete}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md rounded-2xl border-0 shadow-xl">
                              <AlertDialogHeader className="text-center">
                                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                  <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <AlertDialogTitle className="text-xl font-bold text-gray-900">
                                  Hapus Kategori?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 text-base">
                                  Tindakan ini tidak dapat dibatalkan. Kategori
                                  akan dihapus secara permanen dari sistem.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                                <AlertDialogCancel
                                  onClick={handleCancelDeleteCategory}
                                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold order-2 sm:order-1"
                                  disabled={deleteCategoryMutation.isPending}
                                >
                                  Batalkan
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleConfirmDeleteCategory}
                                  disabled={deleteCategoryMutation.isPending}
                                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold shadow-lg order-1 sm:order-2"
                                >
                                  {deleteCategoryMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Menghapus...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Ya, Hapus
                                    </>
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {canDelete
                              ? "Hapus Kategori"
                              : "Tidak dapat menghapus kategori yang memiliki produk"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Tidak ada kategori</p>
              <p className="text-sm text-gray-600 mb-4">
                Mulai dengan menambahkan kategori pertama Anda
              </p>
              <Button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori Pertama
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesTab;
