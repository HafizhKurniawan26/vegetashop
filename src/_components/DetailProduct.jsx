import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import React from "react";

const DetailProduct = ({
  modalOpen,
  setModalOpen,
  selectedProduct,
  quantity,
  handleDecrement,
  handleIncrement,
  handleAddToCart,
  totalPrice,
}) => {
  console.log("Selected Product in DetailProduct:", selectedProduct);
  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah ke Keranjang</DialogTitle>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={
                  selectedProduct?.images?.[0]?.url?.startsWith("http")
                    ? selectedProduct.images[0].url
                    : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${selectedProduct.images[0].url}`
                }
                alt={selectedProduct.name || "Product image"}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedProduct.name || "Nama Produk"}
                </h3>
                <p className="text-gray-600">
                  Rp{" "}
                  {(parseInt(selectedProduct.price) || 0).toLocaleString(
                    "id-ID"
                  )}{" "}
                  / {selectedProduct.unit || "unit"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Jumlah:</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total Harga:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {(totalPrice || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback jika selectedProduct null/undefined */}
        {!selectedProduct && (
          <div className="text-center py-8">
            <p className="text-gray-500">Produk tidak ditemukan</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            disabled={!selectedProduct} // Disable button jika tidak ada produk
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Tambah ke Keranjang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailProduct;
