import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { API_BASE } from "@/config";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;

  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<boolean>;

  googleLogin: () => Promise<boolean>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children
}: {
  children: ReactNode;
}) => {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("be_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ================= LOGIN =================

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {

      const res = await fetch(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      if (!res.ok) return false;

      const data = await res.json();

      setUser(data.user);

      localStorage.setItem(
        "be_user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "be_token",
        data.token
      );

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ================= REGISTER (SEND OTP) =================

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {

    try {

      const res = await fetch(
        `${API_BASE}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      return res.ok;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ================= VERIFY OTP =================

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<boolean> => {

    try {

      const res = await fetch(
        `${API_BASE}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            otp
          })
        }
      );

      if (!res.ok) return false;

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ================= GOOGLE LOGIN =================

  const googleLogin = async (): Promise<boolean> => {

    try {

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const firebaseToken =
        await result.user.getIdToken();

      const res = await fetch(
        `${API_BASE}/api/auth/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: firebaseToken
          })
        }
      );

      if (!res.ok) return false;

      const data = await res.json();

      setUser(data.user);

      localStorage.setItem(
        "be_user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "be_token",
        data.token
      );

      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ================= LOGOUT =================

  const logout = () => {

    setUser(null);

    // remove auth
    localStorage.removeItem("be_user");
    localStorage.removeItem("be_token");

    // clear cart
    localStorage.removeItem("cart");
    localStorage.removeItem("be_cart");

    // redirect
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",

        login,
        register,
        verifyOtp,
        googleLogin,

        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
};