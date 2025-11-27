import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api`,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
    "User-Agent": "custom",
  },
});

const getAllCategories = async () => {
  try {
    const response = await axiosClient.get(`/categories?populate=*`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

const getAllProducts = async () => {
  try {
    const response = await axiosClient.get(`/products?populate=*`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const getProductsByCategory = async (category) => {
  try {
    const response = await axiosClient.get(
      `/products?filters[categories][name][$eq]=${category}&populate=*`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Upload image untuk Strapi v5
const uploadImage = async (jwt, formData) => {
  try {
    console.log("📸 UPLOAD IMAGE API CALL");

    const response = await axiosClient.post(`/upload`, formData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ UPLOAD IMAGE SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ UPLOAD IMAGE ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      throw new Error(
        error.response.data.error?.message || "Image upload failed"
      );
    }
    throw error;
  }
};

// Create product - Strapi v5
const createProduct = async (jwt, productData) => {
  try {
    console.log("🆕 CREATE PRODUCT API CALL");
    console.log("Product Data:", JSON.stringify(productData, null, 2));

    const response = await axiosClient.post(`/products`, productData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ CREATE PRODUCT SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ CREATE PRODUCT ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      throw new Error(
        error.response.data.error?.message || "Create product failed"
      );
    }
    throw error;
  }
};

// Update product menggunakan documentId
const updateProduct = async (jwt, documentId, productData) => {
  try {
    console.log("🔄 UPDATE PRODUCT API CALL");
    console.log("Document ID:", documentId);
    console.log("Product Data:", JSON.stringify(productData, null, 2));

    const response = await axiosClient.put(
      `/products/${documentId}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ UPDATE PRODUCT SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ UPDATE PRODUCT ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("Error details:", error.response.data.error);

      const errorMessage =
        error.response.data.error?.message ||
        error.response.data.error?.details?.message ||
        "Update product failed";
      throw new Error(errorMessage);
    }
    throw error;
  }
};

const addToCart = async (jwt, payload) => {
  try {
    console.log("=== ADD TO CART DEBUG ===");
    console.log("JWT:", jwt ? "EXISTS" : "MISSING");
    console.log("Full payload:", JSON.stringify(payload, null, 2));

    const data = payload.data || payload;
    const productId = data.product;
    const quantity = data.quantity;
    const userId = data.users_permissions_user;

    console.log("Product ID (documentId):", productId);
    console.log("Quantity:", quantity);
    console.log("User ID:", userId);

    if (!productId) {
      throw new Error("Product ID tidak valid");
    }

    if (!userId) {
      throw new Error("User ID tidak valid");
    }

    if (!quantity || quantity < 1) {
      throw new Error("Quantity tidak valid");
    }

    // Cek stok produk menggunakan documentId
    const productResponse = await axiosClient.get(
      `/products?filters[documentId][$eq]=${productId}&populate=*`
    );
    console.log("Product response:", productResponse.data);

    const product = productResponse.data.data?.[0];

    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }

    const availableStock = product.stock || 0;
    console.log("Available stock:", availableStock);

    if (availableStock < quantity) {
      throw new Error(`Stok tidak mencukupi. Stok tersedia: ${availableStock}`);
    }

    // Struktur payload untuk User Cart collection
    const cartPayload = {
      data: {
        quantity: quantity,
        amount: data.amount,
        product: productId,
        users_permissions_user: userId,
      },
    };

    console.log("Cart payload to send:", JSON.stringify(cartPayload, null, 2));

    const response = await axiosClient.post(`/user-carts`, cartPayload, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Cart created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding to cart:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    throw error;
  }
};

const searchProducts = async (query) => {
  try {
    const response = await axiosClient.get(
      `/products?filters[name][$contains]=${query}&populate=*`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const registerUser = async (username, email, password) => {
  try {
    const response = await axiosClient.post("/auth/local/register", {
      username,
      email,
      password,
    });

    console.log("Account created");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || "Registration failed";
  }
};

const loginUser = async (identifier, password) => {
  try {
    const response = await axiosClient.post("/auth/local", {
      identifier,
      password,
    });

    console.log("Login successful");
    return response.data;
  } catch (error) {
    throw error.response?.data?.error?.message || "Login failed";
  }
};

const getUserCart = async (jwt, userId) => {
  try {
    const response = await axiosClient.get(
      `/user-carts?filters[users_permissions_user][id][$eq]=${userId}&populate[product][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    console.log("Cart API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Update cart item menggunakan documentId
const updateCartItem = async (jwt, documentId, payload) => {
  try {
    console.log("=== UPDATE CART ITEM ===");
    console.log("Document ID:", documentId);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await axiosClient.put(
      `/user-carts/${documentId}`,
      {
        data: {
          quantity: payload.quantity,
          amount: payload.amount,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Cart item updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating cart item:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// Delete cart item menggunakan documentId
const deleteCartItem = async (jwt, documentId) => {
  try {
    console.log("=== DELETE CART ITEM ===");
    console.log("Document ID:", documentId);

    const response = await axiosClient.delete(`/user-carts/${documentId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log("✅ Cart item deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting cart item:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// Get product detail menggunakan documentId
const getProductDetail = async (documentId) => {
  try {
    const response = await axiosClient.get(
      `/products/${documentId}?populate=*`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

// Delete product menggunakan documentId
const deleteProduct = async (jwt, documentId) => {
  try {
    const response = await axiosClient.delete(`/products/${documentId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const getUserOrders = async (jwt, userId) => {
  try {
    const response = await axiosClient.get(
      `/orders?filters[user][id][$eq]=${userId}&sort=createdAt:desc&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

const clearUserCart = async (jwt, userId) => {
  try {
    console.log("🗑️ Clearing cart for user:", userId);

    // Get cart items first
    const cartResponse = await axiosClient.get(
      `/user-carts?filters[users_permissions_user][id][$eq]=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const cartData = cartResponse.data;
    const cartItems = cartData.data || [];

    console.log(`🗑️ Found ${cartItems.length} cart items to delete`);

    // Delete all cart items
    const deletePromises = cartItems.map((item) =>
      axiosClient.delete(`/user-carts/${item.documentId || item.id}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })
    );

    await Promise.all(deletePromises);
    console.log("✅ Cart cleared successfully");

    // Trigger event untuk frontend
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("payment-success"));
    }

    return { success: true, deletedCount: cartItems.length };
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    throw error;
  }
};

// Get all orders
const getAllOrders = async (jwt) => {
  try {
    const response = await axiosClient.get(
      `/orders?populate=*&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    console.log("All orders fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Update order status
const updateOrderStatus = async (jwt, documentId, status) => {
  try {
    const response = await axiosClient.put(
      `/orders/${documentId}`,
      {
        data: {
          order_status: status,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Get all users
const getAllUsers = async (jwt) => {
  try {
    const response = await axiosClient.get(`/users`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log("All users fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Category CRUD operations
const createCategory = async (jwt, categoryData) => {
  try {
    console.log("🆕 CREATE CATEGORY API CALL");
    console.log("Category Data:", JSON.stringify(categoryData, null, 2));

    const response = await axiosClient.post(`/categories`, categoryData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ CREATE CATEGORY SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ CREATE CATEGORY ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      throw new Error(
        error.response.data.error?.message || "Create category failed"
      );
    }
    throw error;
  }
};

const updateCategory = async (jwt, documentId, categoryData) => {
  try {
    console.log("🔄 UPDATE CATEGORY API CALL");
    console.log("Document ID:", documentId);
    console.log("Category Data:", JSON.stringify(categoryData, null, 2));

    const response = await axiosClient.put(
      `/categories/${documentId}`,
      categoryData,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ UPDATE CATEGORY SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ UPDATE CATEGORY ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      throw new Error(
        error.response.data.error?.message || "Update category failed"
      );
    }
    throw error;
  }
};

const deleteCategory = async (jwt, documentId) => {
  try {
    console.log("🗑️ DELETE CATEGORY API CALL");
    console.log("Document ID:", documentId);

    const response = await axiosClient.delete(`/categories/${documentId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    console.log("✅ DELETE CATEGORY SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ DELETE CATEGORY ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);

      if (error.response.status === 400) {
        throw new Error(
          "Tidak dapat menghapus kategori yang masih memiliki produk"
        );
      }
    }
    throw error;
  }
};

// ========== FUNGSI BARU UNTUK HANDLE ORDER ==========

// Get order by order_id
const getOrderByOrderId = async (jwt, orderId) => {
  try {
    console.log(`🔍 Searching order with order_id: ${orderId}`);
    const response = await axiosClient.get(
      `/orders?filters[order_id][$eq]=${orderId}&populate=*`
    );
    console.log(`✅ Order search result for ${orderId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching order by order_id:", error);
    throw error;
  }
};

// Update order dengan documentId
const updateOrder = async (jwt, documentId, orderData) => {
  try {
    console.log("🔄 UPDATE ORDER API CALL");
    console.log("Document ID:", documentId);
    console.log("Order Data:", JSON.stringify(orderData, null, 2));

    const response = await axiosClient.put(`/orders/${documentId}`, orderData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ UPDATE ORDER SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ UPDATE ORDER ERROR:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      throw new Error(
        error.response.data.error?.message || "Update order failed"
      );
    }
    throw error;
  }
};

const createOrder = async (jwt, orderData) => {
  try {
    const response = await axiosClient.post(`/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export default {
  getAllCategories,
  getProductsByCategory,
  registerUser,
  loginUser,
  searchProducts,
  getAllProducts,
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getUserOrders,
  clearUserCart,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createCategory,
  updateCategory,
  deleteCategory,
  // New functions
  getOrderByOrderId,
  updateOrder,
  createOrder,
};
