"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Custom Hooks
import { useAuth } from "@/_hooks/useAuth";
import { useProducts } from "@/_hooks/useProducts";
import { useCart } from "@/_hooks/useCart";
import { useProductSearch } from "@/_hooks/useProductSearch";

// UI Components
import Header from "@/_components/Header";
import Footer from "@/_components/Footer";
import HeroSection from "@/_components/HeroSection";
import CategoryTabs from "@/_components/CategoryTabs";
import ProductModal from "@/_components/ProductModal";
import ProductList from "@/_components/ProductList";
import { Badge } from "@/components/ui/badge";

export default function GroceryStore() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const queryClient = useQueryClient();

  // Custom Hooks
  const { user, jwt } = useAuth();
  const {
    allProducts,
    vegetables,
    fruits,
    productsLoading,
    vegetablesLoading,
    fruitsLoading,
    getProductDocumentId,
  } = useProducts();
  const {
    cartItems,
    addToCartMutation,
    updateCartMutation,
    getCartItemDocumentId,
    getCartItemId,
  } = useCart(jwt, user);
  const { searchResults, isSearching } = useProductSearch(searchQuery);

  const isAddingToCart =
    addToCartMutation.isPending || updateCartMutation.isPending;

  // Event Handlers
  const handleBuy = (product) => {
    if (!jwt) {
      toast.error("Harap login terlebih dahulu");
      return;
    }

    if (product.stock === 0) {
      toast.error("Maaf, stok produk ini habis");
      return;
    }

    const productWithDocumentId = {
      ...product,
      documentId: getProductDocumentId(product),
    };

    setSelectedProduct(productWithDocumentId);
    setQuantity(1);
    setModalOpen(true);
  };

  const handleIncrement = () => {
    if (!selectedProduct) return;
    const availableStock = selectedProduct.stock || 0;
    if (quantity >= availableStock) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!jwt) {
      toast.error("Harap login terlebih dahulu");
      setModalOpen(false);
      return;
    }

    if (!user || !user.id) {
      toast.error("User tidak ditemukan");
      setModalOpen(false);
      return;
    }

    if (!selectedProduct) {
      toast.error("Produk tidak valid");
      return;
    }

    const availableStock = selectedProduct.stock || 0;
    if (availableStock === 0) {
      toast.error("Maaf, stok produk ini habis");
      return;
    }

    if (availableStock < quantity) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
      return;
    }

    const productDocumentId = getProductDocumentId(selectedProduct);
    if (!productDocumentId) {
      toast.error("ID produk tidak valid");
      return;
    }

    const existingCartItem = cartItems?.find((item) => {
      const cartProductDocumentId = getCartItemDocumentId(item);
      return cartProductDocumentId == productDocumentId;
    });

    if (existingCartItem) {
      const currentQuantity = parseInt(existingCartItem.quantity) || 0;
      const newQuantity = currentQuantity + quantity;

      if (availableStock < newQuantity) {
        toast.error(
          `Stok tidak mencukupi. Stok tersedia: ${availableStock}, jumlah di keranjang: ${currentQuantity}`
        );
        return;
      }

      const updateData = {
        quantity: newQuantity,
        amount: newQuantity * selectedProduct.price,
      };

      const cartItemId = getCartItemId(existingCartItem);
      updateCartMutation.mutate({ itemId: cartItemId, data: updateData });
    } else {
      const addData = {
        data: {
          quantity: quantity,
          amount: quantity * selectedProduct.price,
          product: productDocumentId,
          users_permissions_user: user.id,
        },
      };
      addToCartMutation.mutate(addData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="container mx-auto px-4 py-6">
        <HeroSection />

        {searchQuery.trim() ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Hasil Pencarian untuk "{searchQuery}"
              </h2>
              <Badge variant="secondary" className="text-sm">
                {searchResults?.length || 0} produk ditemukan
              </Badge>
            </div>
            <ProductList
              products={searchResults}
              handleBuy={handleBuy}
              loading={isSearching}
              gridLayout="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            />
          </div>
        ) : (
          <CategoryTabs
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            allProducts={allProducts}
            vegetables={vegetables}
            fruits={fruits}
            productsLoading={productsLoading}
            vegetablesLoading={vegetablesLoading}
            fruitsLoading={fruitsLoading}
            handleBuy={handleBuy}
          />
        )}

        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          selectedProduct={selectedProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          handleAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          jwt={jwt}
        />
      </div>
      <Footer />
    </div>
  );
}
