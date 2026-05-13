import { createContext, useContext, useEffect, useState } from "react";
import { logoutApi } from "../utils/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" || e.key === "user") {
        const updatedUser = localStorage.getItem("user");
        setUser(updatedUser ? JSON.parse(updatedUser) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    setLoading(false);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) await logoutApi(refreshToken, true);
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.replace("/");
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUser, isLoggedIn: !!user, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);