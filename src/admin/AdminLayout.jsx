import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/admin/tenants", label: "Tenants" },
  // later: /admin/usage, /admin/billing, /admin/support
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r relative">
        <div className="p-4 text-xl font-semibold">Zono Admin</div>

        <nav className="px-2 space-y-1">
          {nav.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                "block px-3 py-2 rounded-md " +
                (isActive ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100")
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>

        {/* 👇 Add this section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-sm text-slate-600 mb-2">{user?.email}</div>
          <button
            onClick={logout}
            className="btn w-full bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
