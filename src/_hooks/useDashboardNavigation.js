import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  LogOut,
} from "lucide-react";

export const useDashboardNavigation = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigation items
  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Produk", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "analytics", label: "Analitik", icon: TrendingUp },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("user");
    router.push("/");
  };

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    navItems,
    handleLogout,
    handleNavigation,
  };
};
