// src/utils/tenant.js
export function getTenantId() {
  // priority: explicit param in URL, then local storage, then dev default
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("tenant");
  const fromStorage = localStorage.getItem("zono_tenant");
  return fromQuery || fromStorage || "t_burgerme";
}
