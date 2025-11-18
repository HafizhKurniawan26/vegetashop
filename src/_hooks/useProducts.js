import { useQuery } from "@tanstack/react-query";
import globalApi from "@/_utils/globalApi";

export const useProducts = () => {
  const getProductDocumentId = (product) => {
    if (!product) return null;
    return product.documentId || product.id;
  };

  // Query untuk semua produk
  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => globalApi.getAllProducts(),
    select: (data) => {
      const products = data?.data || [];
      return {
        ...data,
        data: products.map((product) => ({
          ...product,
          documentId: getProductDocumentId(product),
        })),
      };
    },
  });

  // Query untuk sayuran
  const { data: vegetables, isLoading: vegetablesLoading } = useQuery({
    queryKey: ["products", "sayuran"],
    queryFn: () => globalApi.getProductsByCategory("sayuran"),
    select: (data) => {
      const products = data?.data || [];
      return {
        ...data,
        data: products.map((product) => ({
          ...product,
          documentId: getProductDocumentId(product),
        })),
      };
    },
  });

  // Query untuk buah-buahan
  const { data: fruits, isLoading: fruitsLoading } = useQuery({
    queryKey: ["products", "buah"],
    queryFn: () => globalApi.getProductsByCategory("buah"),
    select: (data) => {
      const products = data?.data || [];
      return {
        ...data,
        data: products.map((product) => ({
          ...product,
          documentId: getProductDocumentId(product),
        })),
      };
    },
  });

  return {
    allProducts: allProducts?.data,
    vegetables: vegetables?.data,
    fruits: fruits?.data,
    productsLoading,
    vegetablesLoading,
    fruitsLoading,
    getProductDocumentId,
  };
};
