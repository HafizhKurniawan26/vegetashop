import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import globalApi from "@/_utils/globalApi";

export const useDashboardOrders = (jwt, isAdmin) => {
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Fetch orders (tetap sama)
  const {
    data: ordersData,
    refetch: refetchOrders,
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching orders...");
        const response = await globalApi.getAllOrders(jwt);
        console.log("📦 Raw orders response:", response);

        let orders = [];
        if (Array.isArray(response)) {
          orders = response;
        } else if (Array.isArray(response?.data)) {
          orders = response.data;
        } else if (response?.data?.data) {
          orders = response.data.data;
        }

        console.log("✅ Processed orders:", orders);
        return orders;
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
        toast.error("Gagal memuat orders");
        return [];
      }
    },
    enabled: !!isAdmin && !!jwt,
  });

  // Update orders ketika data berubah
  useEffect(() => {
    console.log("📥 Orders data changed:", ordersData);
    if (ordersData) {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    }
  }, [ordersData]);

  // Update order status mutation (tetap sama)
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ documentId, status }) =>
      globalApi.updateOrderStatus(jwt, documentId, status),
    onSuccess: () => {
      toast.success("Status order berhasil diperbarui");
      refetchOrders();
    },
    onError: (error) => {
      console.error("Update order status error:", error);
      toast.error(
        "Gagal memperbarui status order: " +
          (error.response?.data?.error?.message || error.message)
      );
    },
  });

  // Helper functions (tetap sama)
  const getStatusBadge = (status) => {
    const statusConfig = {
      settlement: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Settlement",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      capture: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Capture",
      },
      authorize: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Authorize",
      },
      cancel: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancel",
      },
      deny: { color: "bg-red-100 text-red-800 border-red-200", label: "Deny" },
      refund: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Refund",
      },
      expire: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Expire",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return {
      color: config.color,
      label: config.label,
    };
  };

  const getSettlementRevenue = () => {
    return orders
      .filter((order) => order.order_status === "settlement")
      .reduce(
        (total, order) => total + (parseFloat(order.total_amount) || 0),
        0
      );
  };

  const getOrdersByStatus = (status) => {
    if (status === "all") return orders;
    return orders.filter((order) => order.order_status === status);
  };

  const parseJSONField = (field) => {
    try {
      if (typeof field === "string") {
        return JSON.parse(field);
      }
      return field || {};
    } catch (error) {
      console.error("Error parsing JSON field:", error);
      return {};
    }
  };

  return {
    orders,
    orderStatusFilter,
    setOrderStatusFilter,
    ordersLoading,
    getStatusBadge,
    getSettlementRevenue,
    getOrdersByStatus,
    parseJSONField,
    updateOrderStatusMutation,
  };
};
