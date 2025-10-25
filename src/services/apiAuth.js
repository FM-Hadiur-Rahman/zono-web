// src/services/apiAuth.js
import { api } from "./api";

export const registerTenant = (payload) =>
  api.post("/api/auth/register-tenant", payload);

export const verifyEmail = (token) =>
  api.post("/api/auth/verify-email", { token });

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

export const createInvite = (email, role = "employee") =>
  api.post("/api/invitations", { email, role }); // protected
