import { api } from "./api";

function redirectToLogin() {
  const isOnLogin = window.location.pathname.startsWith("/login");
  if (isOnLogin) return;

  const here =
    window.location.pathname + window.location.search + window.location.hash;

  // preserve where the user was, so Login can send them back
  const url = "/login?from=" + encodeURIComponent(here);
  window.location.replace(url); // avoids back button returning to a broken page
}

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("zono_token");
      localStorage.removeItem("zono_user");
      redirectToLogin();
    }
    return Promise.reject(err);
  }
);
