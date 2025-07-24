//update here also
import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// User type
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Player" | "Official";
};

type AuthContextType = {
  user: User | null;
  login: (userData: User | null) => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  setIsAuthLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const login = async (userData: User | null) => {
    if (userData) {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      await AsyncStorage.removeItem("user");
      setUser(null);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoading, setIsAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
