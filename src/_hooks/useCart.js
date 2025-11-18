import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import globalApi from "@/_utils/globalApi";
import { toast } from "sonner";

export const useCart = (jwt, user) => {
  const queryClient = useQueryClient();

  // Query untuk cart items
  const { data: cartData } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const response = await globalApi.getUserCart(jwt, user?.id);
      return response;
    },
    enabled: !!jwt && !!user,
  });

  const cartItems = cartData?.data || [];

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

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: (data) => globalApi.addToCart(jwt, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Berhasil ditambahkan ke keranjang!");
    },
    onError: (error) => {
      if (error.message.includes("Stok tidak mencukupi")) {
        toast.error(error.message);
      } else {
        toast.error("Gagal menambahkan ke keranjang");
      }
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: ({ itemId, data }) =>
      globalApi.updateCartItem(jwt, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user?.id]);
      toast.success("Keranjang berhasil diperbarui");
    },
    onError: (error) => {
      if (error.message.includes("Stok tidak mencukupi")) {
        toast.error(error.message);
      } else {
        toast.error("Gagal memperbarui keranjang");
      }
    },
  });

  return {
    cartItems,
    addToCartMutation,
    updateCartMutation,
    getCartItemDocumentId,
    getCartItemId,
  };
};
