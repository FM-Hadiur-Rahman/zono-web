// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import AcceptInvite from "./pages/AcceptInvite.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Shifts from "./pages/Shifts.jsx";
import Attendance from "./pages/Attendance.jsx";
import Reports from "./pages/Reports.jsx";
import TenantSettings from "./pages/TenantSettings.jsx";
import Tenants from "./admin/Tenants.jsx";
import TenantDetail from "./admin/TenantDetail.jsx";
import MyShifts from "./pages/MyShifts.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/invite/:token" element={<AcceptInvite />} />

      {/* Tenant app */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/me" element={<MyShifts />} />

        <Route
          path="/settings"
          element={
            <RoleProtectedRoute allow={["tenant_admin", "manager"]}>
              <TenantSettings />
            </RoleProtectedRoute>
          }
        />
      </Route>

      {/* Zono admin */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allow={["zono_admin"]}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tenants" replace />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
