import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
const params = new URLSearchParams(location.search);
const fromQuery = params.get("from");

const DEMO_EMAILS = [
  "admin@zonoapp.com", // zono_admin
  "rasan@burgerme.local", // tenant_admin
  "manager@burgerme.local", // manager
  "employee@burgerme.local", // employee
  "rider@burgerme.local", // rider
];

export default function Login() {
  const [email, setEmail] = useState("admin@zonoapp.com");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await login(email, password);

      // Preferred dest if you were redirected here
      let dest = fromQuery || location.state?.from?.pathname;

      // If no redirect target, choose based on role
      if (!dest || dest === "/login" || dest === "/") {
        if (u.role === "zono_admin") dest = "/admin/tenants";
        else if (u.role === "tenant_admin" || u.role === "manager")
          dest = "/dashboard";
        else dest = "/me"; // employee / rider
      }

      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Zono — Login</h1>

        <div>
          <label className="label">Quick choose a demo user</label>
          <select
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          >
            {DEMO_EMAILS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Or type email manually</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Password (anything for demo)</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
