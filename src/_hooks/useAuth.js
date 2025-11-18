import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const userData = sessionStorage.getItem("user");

    if (token) setJwt(token);
    if (userData) setUser(JSON.parse(userData));
    else setUser(null);

    const handleStorageChange = () => {
      const token = sessionStorage.getItem("jwt");
      const userData = sessionStorage.getItem("user");
      if (token) setJwt(token);
      if (userData) setUser(JSON.parse(userData));
      else setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { user, jwt, setUser, setJwt };
};
