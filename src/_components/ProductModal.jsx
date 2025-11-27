import React from "react";
import { ShoppingCart, Plus, Minus, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductModal = ({
  modalOpen,
  setModalOpen,
  selectedProduct,
  quantity,
  setQuantity,
  handleDecrement,
  handleIncrement,
  handleAddToCart,
  isAddingToCart,
  jwt,
}) => {
  if (!selectedProduct) return null;

  const availableStock = selectedProduct.stock || 0;
  const isOutOfStock = availableStock === 0;
  const isLimitedStock = quantity >= availableStock;
  const images = selectedProduct.images || [];
  const firstImage = images[0];
  const imageUrl = firstImage?.url;
  const totalPrice = selectedProduct.price * quantity;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            Tambah ke Keranjang
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-100">
              {imageUrl ? (
                <Image
                  src={
                    imageUrl.startsWith("http")
                      ? imageUrl
                      : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${imageUrl}`
                  }
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-green-600 font-semibold text-lg">
                    Rp {selectedProduct.price.toLocaleString("id-ID")} /{" "}
                    {selectedProduct.unit}
                  </p>
                </div>
                <Badge
                  variant={isOutOfStock ? "destructive" : "default"}
                  className={
                    isOutOfStock
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : "bg-green-100 text-green-800 hover:bg-green-100"
                  }
                >
                  {isOutOfStock ? "Stok Habis" : `Stok: ${availableStock}`}
                </Badge>
              </div>
              {isOutOfStock && (
                <p className="text-red-500 text-sm font-semibold mt-2">
                  Stok habis, tidak dapat ditambahkan ke keranjang
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="font-semibold text-gray-700">Jumlah:</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isAddingToCart || isOutOfStock}
                  className="rounded-full w-10 h-10 border-2 border-green-200 hover:border-green-300"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center text-gray-900">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={isAddingToCart || isOutOfStock || isLimitedStock}
                  className="rounded-full w-10 h-10 border-2 border-green-200 hover:border-green-300"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isLimitedStock && !isOutOfStock && (
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <Sparkles className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Mencapai batas stok tersedia
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">Total Harga:</span>
                <span className="text-2xl font-bold text-green-600 block">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Truck className="w-4 h-4" />
                <span>Gratis Ongkir</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setModalOpen(false);
              setQuantity(1);
            }}
            className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:border-gray-400"
            disabled={isAddingToCart}
          >
            Batal
          </Button>
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-lg"
            disabled={!jwt || isAddingToCart || selectedProduct?.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isAddingToCart ? "Menambahkan..." : "Tambah ke Keranjang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
