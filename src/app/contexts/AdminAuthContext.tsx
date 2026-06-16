import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

export type AdminRole = "super_admin" | "business_dev" | "learning_dev" | "ambassador";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Mock users database
const MOCK_ADMIN_USERS: Record<string, { password: string; user: AdminUser }> = {
  "super@tyka.com": {
    password: "super2026",
    user: {
      id: "1",
      email: "super@tyka.com",
      name: "Admin Général",
      role: "super_admin"
    }
  },
  "business@tyka.com": {
    password: "business2026",
    user: {
      id: "2",
      email: "business@tyka.com",
      name: "Business Developer",
      role: "business_dev"
    }
  },
  "learning@tyka.com": {
    password: "learning2026",
    user: {
      id: "3",
      email: "learning@tyka.com",
      name: "Learning Developer",
      role: "learning_dev"
    }
  },
  "ambassador@tyka.com": {
    password: "ambassador2026",
    user: {
      id: "4",
      email: "ambassador@tyka.com",
      name: "Ambassador Admin",
      role: "ambassador"
    }
  }
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("tykaAdminUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const adminAccount = MOCK_ADMIN_USERS[email];
    
    if (adminAccount && adminAccount.password === password) {
      setUser(adminAccount.user);
      localStorage.setItem("tykaAdminUser", JSON.stringify(adminAccount.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tykaAdminUser");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
