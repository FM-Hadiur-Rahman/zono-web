import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Layout() {
  const { user, logout } = useAuth();

  const isStaff = user?.role === "employee" || user?.role === "rider";

  // Show a minimal menu for staff; full menu for managers/admins
  const menu = isStaff
    ? [{ to: "/me", label: "My Shifts" }]
    : [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/attendance", label: "Attendance" },
        { to: "/employees", label: "Employees" },
        { to: "/shifts", label: "Shifts" },
        { to: "/reports", label: "Reports" },
        // you can add { to: "/settings", label: "Settings" } for tenant_admin/manager only
      ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-white border-r relative">
        <div className="p-4 flex items-center gap-2">
          <img src="/zono-logo.png" alt="Zono" className="h-8 w-auto" />
          <span className="text-xl font-semibold">Zono</span>
        </div>

        {/* Quick role/tenant badge */}
        {user && (
          <div className="px-4 pb-2 text-xs text-slate-600">
            <div>
              Role: <span className="font-medium">{user.role}</span>
            </div>
            {user.tenantId && (
              <div>
                Tenant: <span className="font-medium">{user.tenantId}</span>
              </div>
            )}
          </div>
        )}

        {/* Admin Console link (only for zono_admin) */}
        {user?.role === "zono_admin" && (
          <div className="px-2 pb-2">
            <NavLink
              to="/admin"
              className="block px-3 py-2 rounded-md bg-purple-100 text-purple-700"
            >
              Admin Console
            </NavLink>
          </div>
        )}

        <nav className="px-2 space-y-1">
          {menu.map((i) => (
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

        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-sm text-slate-600 mb-2 truncate">
            {user?.email}
          </div>
          <button className="btn w-full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex flex-col min-h-screen bg-slate-50">
        {/* Top header bar inside main */}
        <div className="flex items-center justify-between bg-white border-b px-6 py-3 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-700">
            👋 Hi, {user?.name || user?.email || "User"}
          </h1>
          <div className="flex items-center gap-3">
            {/* Notification bell right side */}
            <NotificationBell />
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
