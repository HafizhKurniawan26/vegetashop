import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem("jwt");
        const userData = sessionStorage.getItem("user");

        console.log("🔐 Checking auth - Token:", !!token, "User:", !!userData);

        if (!token || !userData) {
          toast.error("Harap login terlebih dahulu");
          router.push("/");
          setIsLoading(false);
          return;
        }

        setJwt(token);
        const userObj = JSON.parse(userData);
        setUser(userObj);

        console.log("👤 User role:", userObj.user_role);

        if (userObj.user_role !== "admin") {
          setIsAdmin(false);
          toast.error(
            "Akses ditolak: Hanya admin yang dapat mengakses halaman ini"
          );
          router.push("/");
          setIsLoading(false);
          return;
        }

        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Terjadi kesalahan saat memeriksa autentikasi");
        router.push("/");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return {
    user,
    jwt,
    isAdmin,
    isLoading,
  };
};
