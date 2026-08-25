import type { User } from "@/Data/types";
import { apiRequest } from "./client";

export interface AuthResponse {
  token: string;
  user: User;
}

export function register(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string; resetToken?: string }>("/v1/auth/forgot-password", {
    method: "POST", body: JSON.stringify({ email }),
  });
}
export function resetPassword(token: string, password: string) {
  return apiRequest<void>("/v1/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}
export function getAccount() { return apiRequest<User>("/v1/account", { cache: "no-store" }); }
export function updateAccount(name: string, email: string) {
  return apiRequest<User>("/v1/account", { method: "PUT", body: JSON.stringify({ name, email }) });
}
export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<void>("/v1/account/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
}
