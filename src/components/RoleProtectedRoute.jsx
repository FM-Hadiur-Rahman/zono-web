import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * RoleProtectedRoute: blocks access unless the user's role is in `allow`
 * Example: <RoleProtectedRoute allow={["zono_admin"]}> ... </RoleProtectedRoute>
 */
export default function RoleProtectedRoute({ allow = [], children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />; // or a 403 page
  return children;
}
