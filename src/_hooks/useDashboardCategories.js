import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import globalApi from "@/_utils/globalApi";

export const useDashboardCategories = (jwt, isAdmin) => {
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "", // Hanya name saja sesuai struktur
  });
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");

  const queryClient = useQueryClient();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching categories...");
        const response = await globalApi.getAllCategories();
        console.log("📦 Categories response:", response);

        let categories = [];
        if (Array.isArray(response)) {
          categories = response;
        } else if (Array.isArray(response?.data)) {
          categories = response.data;
        } else if (response?.data?.data) {
          categories = response.data.data;
        }

        console.log("✅ Processed categories:", categories);
        return categories;
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        toast.error("Gagal memuat kategori");
        return [];
      }
    },
    enabled: !!isAdmin && !!jwt,
  });

  // Fetch products untuk menghitung jumlah produk per kategori
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await globalApi.getAllProducts();
        let products = [];

        if (Array.isArray(response)) {
          products = response;
        } else if (Array.isArray(response?.data)) {
          products = response.data;
        } else if (response?.data?.data) {
          products = response.data.data;
        }

        return products;
      } catch (error) {
        console.error("Error fetching products for count:", error);
        return [];
      }
    },
    enabled: !!isAdmin && !!jwt,
  });

  // Update categories ketika data berubah
  useEffect(() => {
    console.log("📥 Categories data changed:", categoriesData);
    if (categoriesData) {
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }
  }, [categoriesData]);

  // Category CRUD Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => globalApi.createCategory(jwt, categoryData),
    onSuccess: () => {
      toast.success("Kategori berhasil dibuat");
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error("Create category error:", error);
      toast.error(
        "Gagal membuat kategori: " +
          (error.response?.data?.error?.message || error.message)
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ documentId, data }) =>
      globalApi.updateCategory(jwt, documentId, data),
    onSuccess: () => {
      toast.success("Kategori berhasil diperbarui");
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error("Update category error:", error);
      toast.error(
        "Gagal memperbarui kategori: " +
          (error.response?.data?.error?.message || error.message)
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (documentId) => globalApi.deleteCategory(jwt, documentId),
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus");
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error("Delete category error:", error);
      toast.error(
        "Gagal menghapus kategori: " + (error.message || "Unknown error")
      );
    },
  });

  // Category Helper functions
  const resetCategoryForm = () => {
    setCategoryForm({
      name: "", // Hanya name saja
    });
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      // Hapus description karena tidak ada di struktur
    });
    setIsCategoryModalOpen(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    // Validasi form
    if (!categoryForm.name.trim()) {
      toast.error("Nama kategori harus diisi");
      return;
    }

    try {
      const categoryData = {
        data: {
          name: categoryForm.name.trim(),
          // Hapus description dari payload
        },
      };

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          documentId: editingCategory.documentId,
          data: categoryData,
        });
      } else {
        await createCategoryMutation.mutateAsync(categoryData);
      }
    } catch (error) {
      console.error("Error in handleSubmitCategory:", error);
      toast.error("Terjadi kesalahan: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteCategory = (documentId) => {
    setCategoryToDelete(documentId);
    setDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete);
    }
  };

  const handleCancelDeleteCategory = () => {
    setDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleCategoryModalClose = () => {
    setIsCategoryModalOpen(false);
    resetCategoryForm();
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchCategoryQuery.toLowerCase())
  );

  // Get products count by category
  const getProductsCountByCategory = (categoryId) => {
    if (!productsData) return 0;

    return productsData.filter(
      (product) =>
        product.categories &&
        product.categories.some((cat) => cat.documentId === categoryId)
    ).length;
  };

  return {
    // Category states
    categories: filteredCategories,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    categoryForm,
    setCategoryForm,
    deleteCategoryDialogOpen,
    setDeleteCategoryDialogOpen,
    categoryToDelete,
    searchCategoryQuery,
    setSearchCategoryQuery,
    categoriesLoading,

    // Category functions
    handleEditCategory,
    handleSubmitCategory,
    handleDeleteCategory,
    handleConfirmDeleteCategory,
    handleCancelDeleteCategory,
    handleCategoryModalClose,
    getProductsCountByCategory,
    refetchCategories,

    // Category mutations
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
};
