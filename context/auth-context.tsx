import React, { createContext, useContext, useState } from 'react';

// Step 1: Define User type with role
export type User = {
  name: string;
  email: string;
  role: 'player' | 'official'; // add role here
};

// Step 2: Update context type to use full User object
type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};

// Step 3: Create context with updated type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Step 4: AuthProvider that manages user state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData); // now includes name, email, role
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 5: Custom hook for accessing context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
