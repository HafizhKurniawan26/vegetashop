import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import globalApi from "@/_utils/globalApi";

export const useDashboardUsers = (jwt, isAdmin) => {
  const [users, setUsers] = useState([]);

  // Fetch users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        console.log("🔄 Fetching users...");
        const response = await globalApi.getAllUsers(jwt);
        console.log("📦 Raw users response:", response);

        let users = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (Array.isArray(response?.data)) {
          users = response.data;
        } else if (response?.data?.data) {
          users = response.data.data;
        } else if (response?.data) {
          users = [response.data];
        }

        console.log("✅ Processed users:", users);
        return users;
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        console.error("Error details:", error.response?.data || error.message);
        return [];
      }
    },
    enabled: !!isAdmin && !!jwt,
    retry: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Update users ketika data berubah
  useEffect(() => {
    console.log("📥 Users data changed:", usersData);
    console.log("❌ Users error:", usersError);

    if (usersData) {
      setUsers(Array.isArray(usersData) ? usersData : []);
    }
  }, [usersData, usersError]);

  return {
    users,
    usersLoading,
    usersError,
  };
};
