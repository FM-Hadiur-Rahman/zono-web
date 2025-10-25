// services/api.js
import axios from "axios";
import { getTenantId } from "../utils/tenant";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("zono_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  // 👇 add tenant header
  cfg.headers["X-Tenant"] = getTenantId();
  return cfg;
});
