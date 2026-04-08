import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";

interface ParentUser {
  id: number;
  email: string;
  subscriptionStatus: string;
}

interface ChildUser {
  id: number;
  username: string;
  displayName: string;
  ageGroup: string;
}

interface AuthContextType {
  parent: ParentUser | null;
  child: ChildUser | null;
  loading: boolean;
  loginParent: (email: string, password: string) => Promise<void>;
  registerParent: (email: string, password: string) => Promise<void>;
  loginChild: (username: string, pin: string) => Promise<ChildUser>;
  logout: () => Promise<void>;
  setChild: (child: ChildUser | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children: childrenNodes }: { children: ReactNode }) {
  const [parent, setParent] = useState<ParentUser | null>(null);
  const [child, setChild] = useState<ChildUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then((data) => setParent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginParent = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setParent(data);
  };

  const registerParent = async (email: string, password: string) => {
    const data = await api.register(email, password);
    setParent(data);
  };

  const loginChild = async (username: string, pin: string) => {
    const data = await api.childLogin(username, pin);
    setChild(data);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setParent(null);
    setChild(null);
  };

  return (
    <AuthContext.Provider value={{ parent, child, loading, loginParent, registerParent, loginChild, logout, setChild }}>
      {childrenNodes}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
