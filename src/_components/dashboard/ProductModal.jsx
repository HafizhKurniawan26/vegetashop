import React from "react";
import { Plus, Edit, DollarSign, Package, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductModal = ({
  isProductModalOpen,
  handleModalClose,
  editingProduct,
  productForm,
  setProductForm,
  categories,
  handleImageChange,
  handleSubmitProduct,
  createProductMutation,
  updateProductMutation,
}) => {
  return (
    <Dialog open={isProductModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingProduct ? (
              <>
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Produk
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-green-600" />
                Tambah Produk Baru
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitProduct}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nama Produk *
              </Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Masukkan nama produk"
                className="focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Harga *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="pl-10 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">
                  Stok *
                </Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="pl-10 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Kategori *
                </Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) =>
                    setProductForm((prev) => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger className="focus:border-blue-500">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.documentId}
                        value={category.documentId}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium">
                  Satuan *
                </Label>
                <Select
                  value={productForm.unit}
                  onValueChange={(value) =>
                    setProductForm((prev) => ({ ...prev, unit: value }))
                  }
                  required
                >
                  <SelectTrigger className="focus:border-blue-500">
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pcs</SelectItem>
                    <SelectItem value="ikat">Ikat</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Gambar Produk
              </Label>
              <div className="space-y-3">
                {productForm.imagePreview && (
                  <div className="mt-2 flex justify-center">
                    <div className="relative">
                      <img
                        src={productForm.imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() =>
                          setProductForm((prev) => ({
                            ...prev,
                            image: null,
                            imagePreview: "",
                          }))
                        }
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label htmlFor="image" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, JPG (max. 5MB)
                    </p>
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createProductMutation.isPending ||
              updateProductMutation.isPending
                ? "Menyimpan..."
                : editingProduct
                ? "Update Produk"
                : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
