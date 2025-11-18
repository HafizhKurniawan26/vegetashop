import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import globalApi from "@/_utils/globalApi";

export const useDashboardProducts = (jwt, isAdmin) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: null,
    imagePreview: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Get category name untuk Strapi v5 dengan documentId
  const getCategoryName = (product) => {
    if (!product || !product.categories || product.categories.length === 0) {
      return "Uncategorized";
    }
    return product.categories[0]?.name || "Uncategorized";
  };

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
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

  // Fetch products
  const {
    data: productsData,
    refetch: refetchProducts,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching products...");
        const response = await globalApi.getAllProducts();
        console.log("📦 Products response:", response);

        let products = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (Array.isArray(response?.data)) {
          products = response.data;
        } else if (response?.data?.data) {
          products = response.data.data;
        }

        console.log("✅ Processed products:", products);
        return products;
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        toast.error("Gagal memuat produk");
        return [];
      }
    },
    enabled: !!isAdmin && !!jwt,
  });

  // Update products and categories ketika data berubah
  useEffect(() => {
    console.log("📥 Categories data changed:", categoriesData);
    if (categoriesData) {
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }
  }, [categoriesData]);

  useEffect(() => {
    console.log("📥 Products data changed:", productsData);
    if (productsData) {
      setProducts(Array.isArray(productsData) ? productsData : []);
    }
  }, [productsData]);

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(product)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // CRUD Mutations
  const createProductMutation = useMutation({
    mutationFn: (productData) => globalApi.createProduct(jwt, productData),
    onSuccess: () => {
      toast.success("Produk berhasil dibuat");
      setIsProductModalOpen(false);
      resetProductForm();
      refetchProducts();
    },
    onError: (error) => {
      console.error("Create product error:", error);
      toast.error(
        "Gagal membuat produk: " +
          (error.response?.data?.error?.message || error.message)
      );
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ documentId, data }) =>
      globalApi.updateProduct(jwt, documentId, data),
    onSuccess: () => {
      toast.success("Produk berhasil diperbarui");
      setIsProductModalOpen(false);
      resetProductForm();
      refetchProducts();
    },
    onError: (error) => {
      console.error("Update product error:", error);
      toast.error(
        "Gagal memperbarui produk: " +
          (error.response?.data?.error?.message || error.message)
      );
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (documentId) => globalApi.deleteProduct(jwt, documentId),
    onSuccess: () => {
      toast.success("Produk berhasil dihapus");
      refetchProducts();
    },
    onError: (error) => {
      console.error("Delete product error:", error);
      toast.error(
        "Gagal menghapus produk: " + (error.message || "Unknown error")
      );
    },
  });

  // Helper functions
  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      image: null,
      imagePreview: "",
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    let categoryDocumentId = "";
    if (product.categories && product.categories.length > 0) {
      categoryDocumentId = product.categories[0].documentId;
    }

    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || "",
      category: categoryDocumentId,
      image: null,
      imagePreview:
        product.images && product.images.length > 0
          ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${product.images[0].url}`
          : "",
    });
    setIsProductModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        data: {
          name: productForm.name,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
        },
      };

      // Handle images
      if (productForm.image) {
        const formData = new FormData();
        formData.append("files", productForm.image);
        const imageResponse = await globalApi.uploadImage(jwt, formData);

        if (imageResponse && imageResponse.length > 0) {
          productData.data.images = [imageResponse[0].id];
        }
      } else if (
        editingProduct &&
        editingProduct.images &&
        editingProduct.images.length > 0
      ) {
        productData.data.images = [editingProduct.images[0].id];
      }

      // Handle categories
      if (productForm.category) {
        productData.data.categories = [productForm.category];
      } else if (
        editingProduct &&
        editingProduct.categories &&
        editingProduct.categories.length > 0
      ) {
        productData.data.categories = [editingProduct.categories[0].documentId];
      }

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          documentId: editingProduct.documentId,
          data: productData,
        });
      } else {
        await createProductMutation.mutateAsync(productData);
      }
    } catch (error) {
      console.error("Error in handleSubmitProduct:", error);
      toast.error("Terjadi kesalahan: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteProduct = (documentId) => {
    setProductToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete, {
        onSettled: () => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleModalClose = () => {
    setIsProductModalOpen(false);
    resetProductForm();
  };

  return {
    products: filteredProducts,
    categories,
    searchQuery,
    setSearchQuery,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    productForm,
    setProductForm,
    deleteDialogOpen,
    setDeleteDialogOpen,
    productToDelete,
    categoriesLoading,
    productsLoading,
    getCategoryName,
    handleEditProduct,
    handleImageChange,
    handleSubmitProduct,
    handleDeleteProduct,
    handleConfirmDelete,
    handleCancelDelete,
    handleModalClose,
    resetProductForm,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
};
