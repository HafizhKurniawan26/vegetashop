import { useQuery } from "@tanstack/react-query";
import globalApi from "@/_utils/globalApi";

export const useProductSearch = (searchQuery) => {
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["products", "search", searchQuery],
    queryFn: () => globalApi.searchProducts(searchQuery),
    enabled: !!searchQuery.trim(),
    select: (data) => {
      const products = data?.data || [];
      return products.map((product) => ({
        ...product,
        documentId: product.documentId || product.id,
      }));
    },
  });

  return {
    searchResults,
    isSearching,
  };
};
