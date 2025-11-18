import React from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Package,
  Loader2,
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

const ProductsTab = ({
  products,
  searchQuery,
  setSearchQuery,
  setIsProductModalOpen,
  getCategoryName,
  handleEditProduct,
  handleDeleteProduct,
  productsLoading,
  deleteDialogOpen,
  setDeleteDialogOpen,
  productToDelete,
  handleConfirmDelete,
  handleCancelDelete,
  deleteProductMutation,
}) => {
  if (productsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
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
              <h2 className="text-2xl">Manajemen Produk</h2>
            </CardTitle>
            <CardDescription>
              <h3 className="text-lg">Kelola produk dan inventori toko Anda</h3>
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsProductModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari produk atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 font-semibold text-left">Produk</th>
                  <th className="p-4 font-semibold text-left">Harga</th>
                  <th className="p-4 font-semibold text-center">Stok</th>
                  <th className="p-4 font-semibold text-center">Kategori</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.documentId}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={`${
                              process.env.NEXT_PUBLIC_STRAPI_API_URL +
                              product.images[0].url
                            }`}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Rp{" "}
                          {parseFloat(product.price || 0).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 10 && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {product.stock <= 10 && product.stock > 0 && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {product.stock === 0 && <X className="w-3 h-3 mr-1" />}
                        {product.stock} pcs
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {getCategoryName(product)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        className={`
                          ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        `}
                      >
                        {product.stock > 10
                          ? "Tersedia"
                          : product.stock > 0
                          ? "Terbatas"
                          : "Habis"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Produk</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialog
                                open={deleteDialogOpen}
                                onOpenChange={setDeleteDialogOpen}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteProduct(product.documentId)
                                    }
                                    className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500 transition-all duration-200"
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
                                      Hapus Produk?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-600 text-base">
                                      Tindakan ini tidak dapat dibatalkan.
                                      Produk akan dihapus secara permanen dari
                                      sistem.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <AlertDialogCancel
                                      onClick={handleCancelDelete}
                                      className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold order-2 sm:order-1"
                                      disabled={deleteProductMutation.isPending}
                                    >
                                      Batalkan
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleConfirmDelete}
                                      disabled={deleteProductMutation.isPending}
                                      className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold shadow-lg order-1 sm:order-2"
                                    >
                                      {deleteProductMutation.isPending ? (
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
                              <p>Hapus Produk</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada produk</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsTab;
