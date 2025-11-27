"use client";
import globalApi from "@/_utils/globalApi";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  AlertTriangle,
  CheckCircle,
  Truck,
  Shield,
  Sparkles,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function CartDetail({ variant = "default" }) {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Helper function untuk mendapatkan documentId dari cart item
  const getCartItemDocumentId = (cartItem) => {
    if (!cartItem) return null;
    if (cartItem.product?.data?.documentId)
      return cartItem.product.data.documentId;
    if (cartItem.product?.documentId) return cartItem.product.documentId;
    if (cartItem.product?.data?.id) return cartItem.product.data.id;
    if (cartItem.product?.id) return cartItem.product.id;
    if (cartItem.documentId) return cartItem.documentId;
    return cartItem.id || null;
  };

  // Helper function untuk mendapatkan cart item ID
  const getCartItemId = (cartItem) => {
    if (!cartItem) return null;
    return cartItem.documentId || cartItem.id;
  };

  // Helper function untuk mendapatkan product data
  const getProductData = (item) => {
    if (item.product?.data) return item.product.data;
    if (item.product) return item.product;
    return item.product || {};
  };

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const userData = sessionStorage.getItem("user");
    if (token) setJwt(token);
    if (userData) setUser(JSON.parse(userData));

    const handleStorageChange = () => {
      const token = sessionStorage.getItem("jwt");
      const userData = sessionStorage.getItem("user");
      if (token) setJwt(token);
      if (userData) setUser(JSON.parse(userData));
      else setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // PERBAIKAN: Tambahkan useEffect untuk listen event pembayaran berhasil
  useEffect(() => {
    const handlePaymentSuccess = () => {
      console.log("💰 Payment success event received - clearing cart");
      // Invalidate query untuk refresh cart data
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Pembayaran berhasil! Keranjang telah dikosongkan");
    };

    // Listen untuk custom event ketika pembayaran berhasil
    window.addEventListener("payment-success", handlePaymentSuccess);

    // Juga listen untuk storage changes (fallback)
    const handleStorageChange = (e) => {
      if (e.key === "payment_status" && e.newValue === "success") {
        handlePaymentSuccess();
        sessionStorage.removeItem("payment_status");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("payment-success", handlePaymentSuccess);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [queryClient, user?.id]);

  // Query untuk cart items
  const { data: rawCartData, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const response = await globalApi.getUserCart(jwt, user?.id);
      return response;
    },
    enabled: !!jwt && !!user,
  });

  // Extract cart items
  const cartItems = rawCartData?.data || [];

  // Mutation untuk update quantity
  const updateMutation = useMutation({
    mutationFn: async ({ itemId, data }) => {
      const result = await globalApi.updateCartItem(jwt, itemId, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Keranjang berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui keranjang");
    },
  });

  // Mutation untuk hapus item
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const result = await globalApi.deleteCartItem(jwt, itemId);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Item berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus item");
    },
  });

  // PERBAIKAN: Mutation untuk hapus semua item cart
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!cartItems || cartItems.length === 0) return;

      // Hapus semua item cart satu per satu
      const deletePromises = cartItems.map((item) =>
        globalApi.deleteCartItem(jwt, getCartItemId(item))
      );

      await Promise.all(deletePromises);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Semua item berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus semua item");
    },
  });

  const handleIncrement = (item) => {
    const product = getProductData(item);
    const currentQuantity = parseInt(item.quantity) || 0;
    const price = parseFloat(product?.price) || 0;
    const availableStock = product?.stock || 0;

    if (!price) {
      toast.error("Harga produk tidak valid");
      return;
    }

    if (currentQuantity >= availableStock) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }

    const newQuantity = currentQuantity + 1;
    const amount = newQuantity * price;

    updateMutation.mutate({
      itemId: getCartItemId(item),
      data: { quantity: newQuantity, amount: amount },
    });
  };

  const handleDecrement = (item) => {
    const currentQuantity = parseInt(item.quantity) || 0;

    if (currentQuantity <= 1) {
      handleRemove(getCartItemId(item));
      return;
    }

    const product = getProductData(item);
    const price = parseFloat(product?.price) || 0;
    const newQuantity = currentQuantity - 1;
    const amount = newQuantity * price;

    updateMutation.mutate({
      itemId: getCartItemId(item),
      data: { quantity: newQuantity, amount: amount },
    });
  };

  const handleRemove = (itemId) => {
    if (!itemId) {
      toast.error("ID item tidak valid");
      return;
    }
    deleteMutation.mutate(itemId);
  };

  // PERBAIKAN: Fungsi untuk hapus semua item cart
  const handleClearAll = () => {
    if (!cartItems || cartItems.length === 0) return;
    clearAllMutation.mutate();
  };

  // Calculate totals
  const totalPrice =
    cartItems?.reduce((total, item) => {
      const product = getProductData(item);
      const price = parseFloat(product?.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + quantity * price;
    }, 0) || 0;

  const totalItems =
    cartItems?.reduce((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0) || 0;

  const isMutating =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    clearAllMutation.isPending;

  const handleCheckout = () => {
    setSheetOpen(false);
    router.push("/checkout");
  };

  const hasOutOfStockItems = cartItems.some((item) => {
    const product = getProductData(item);
    return product?.stock === 0;
  });

  const freeShippingThreshold = 50000;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - totalPrice
  );
  const freeShippingProgress = Math.min(
    (totalPrice / freeShippingThreshold) * 100,
    100
  );

  // Cart Item Skeleton
  const CartItemSkeleton = () => (
    <div className="flex items-center gap-3 p-4 border rounded-2xl">
      <Skeleton className="w-16 h-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant={variant === "light" ? "ghost" : "outline"}
          className={`relative rounded-xl transition-all duration-300 ${
            variant === "light"
              ? "text-white hover:bg-white/20 border-white/30"
              : "border-gray-300 hover:border-green-500 hover:bg-green-50"
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Keranjang
          {totalItems > 0 && (
            <span
              className={`absolute -top-2 -right-2 rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold ${
                variant === "light"
                  ? "bg-white text-green-600 shadow-lg"
                  : "bg-green-600 text-white shadow-lg"
              }`}
            >
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md w-full rounded-l-xl border-l-0">
        <SheetHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              Keranjang Belanja
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSheetOpen(false)}
              className="rounded-xl hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                {totalItems} items
              </Badge>
              <span className="text-lg font-bold text-green-600">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            {totalItems > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                disabled={isMutating}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Hapus Semua
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Free Shipping Progress */}
        {totalPrice > 0 && totalPrice < freeShippingThreshold && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl mx-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Tambah Rp {remainingForFreeShipping.toLocaleString("id-ID")}{" "}
                untuk gratis ongkir!
              </span>
            </div>
            <Progress
              value={freeShippingProgress}
              className="h-2 bg-blue-200"
            />
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>0%</span>
              <span>{Math.round(freeShippingProgress)}%</span>
              <span>Gratis Ongkir!</span>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex-1 overflow-auto py-4 px-4 space-y-4 max-h-[60vh]">
          {!jwt || !user ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Keranjang Kosong
              </h3>
              <p className="text-gray-500 mb-6">
                Silakan login untuk melihat keranjang belanja Anda
              </p>
              <Button
                onClick={() => setSheetOpen(false)}
                className="bg-green-600 hover:bg-green-700 rounded-xl"
                asChild
              >
                <a href="/login">Login Sekarang</a>
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <CartItemSkeleton key={index} />
              ))}
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Keranjang Masih Kosong
              </h3>
              <p className="text-gray-500 mb-6">
                Yuk, mulai berbelanja produk segar favorit Anda!
              </p>
              <Button
                onClick={() => setSheetOpen(false)}
                className="bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Jelajahi Produk
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const product = getProductData(item);
                const images = product?.images || [];
                const firstImage = images[0];
                const imageUrl = firstImage?.url;
                const quantity = parseInt(item.quantity) || 0;
                const stock = product?.stock || 0;
                const isOutOfStock = stock === 0;
                const isLimitedStock = quantity >= stock;
                const itemTotal = (product?.price || 0) * quantity;

                return (
                  <div
                    key={getCartItemId(item) || index}
                    className="group relative bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-100">
                          {imageUrl ? (
                            <Image
                              src={
                                imageUrl.startsWith("http")
                                  ? imageUrl
                                  : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${imageUrl}`
                              }
                              alt={product?.name || "Product"}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Stock Badge */}
                        {isLimitedStock && !isOutOfStock && (
                          <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0">
                            {stock}
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                          {product?.name || "Unknown Product"}
                        </h4>
                        <p className="text-green-600 font-bold text-lg mb-2">
                          Rp {itemTotal.toLocaleString("id-ID")}
                        </p>

                        {/* Stock Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            variant={isOutOfStock ? "destructive" : "outline"}
                            className={`text-xs ${
                              isOutOfStock
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }`}
                          >
                            {isOutOfStock ? "Stok Habis" : `Stok: ${stock}`}
                          </Badge>
                          {!isOutOfStock && (
                            <span className="text-xs text-gray-500">
                              {product?.unit || "pcs"}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border-2 border-gray-300 hover:border-green-500"
                              onClick={() => handleDecrement(item)}
                              disabled={isMutating || isOutOfStock}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-bold w-8 text-center text-gray-900">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border-2 border-gray-300 hover:border-green-500"
                              onClick={() => handleIncrement(item)}
                              disabled={
                                isMutating || isOutOfStock || isLimitedStock
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            onClick={() => handleRemove(getCartItemId(item))}
                            disabled={isMutating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-gray-200 pt-4 px-4 space-y-4">
            {/* Total Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-900">
                  Total Belanja:
                </span>
                <span className="font-bold text-green-600 text-xl">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Benefits */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>Gratis Ongkir</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Garansi Segar</span>
                  </div>
                </div>
                {totalPrice >= freeShippingThreshold && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Gratis Ongkir!
                  </Badge>
                )}
              </div>
            </div>

            {/* Warning untuk out of stock items */}
            {hasOutOfStockItems && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Beberapa produk stok habis. Hapus untuk melanjutkan
                    checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSheetOpen(false)}
                className="flex-1 h-12 rounded-xl border-2 font-semibold"
                disabled={isMutating}
              >
                Lanjut Belanja
              </Button>
              <Button
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold shadow-lg"
                disabled={isMutating || totalItems === 0 || hasOutOfStockItems}
                onClick={handleCheckout}
              >
                {isMutating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Checkout
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
