// import { api } from "../services/api";
// import React, { createContext, useContext, useMemo, useState } from "react";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const raw = localStorage.getItem("zono_user");
//     return raw ? JSON.parse(raw) : null;
//   });

//   // src/context/AuthContext.jsx (replace your login fn)

//   const login = async (email, password) => {
//     try {
//       const { data } = await api.post("/api/auth/login", { email, password });
//       localStorage.setItem("zono_token", data.token);
//       localStorage.setItem("zono_user", JSON.stringify(data.user));
//       setUser(data.user);
//       return data.user;
//     } catch (err) {
//       const msg = err?.response?.data?.error || "Login failed";
//       throw new Error(msg);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("zono_token");
//     localStorage.removeItem("zono_user");
//     setUser(null);
//   };

//   const value = useMemo(() => ({ user, login, logout }), [user]);
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

// never crash on bad localStorage values
function safeGetUser() {
  try {
    const raw = localStorage.getItem("zono_user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("zono_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(safeGetUser);

  const login = async (email, password) => {
    // 1) get token
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("zono_token", data.token);

    // 2) fetch profile
    const me = await api.get("/api/auth/me");
    localStorage.setItem("zono_user", JSON.stringify(me.data));
    setUser(me.data);

    return me.data; // so caller can redirect based on role
  };

  const logout = () => {
    localStorage.removeItem("zono_token");
    localStorage.removeItem("zono_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
