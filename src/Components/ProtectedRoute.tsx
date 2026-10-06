import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../CustomHooks/useAuth";
interface ProtectedRouteProps {
    allowedRoles?: Array<"admin" | "doctor" | "receptionist">;
}
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { token, role } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && role && !allowedRoles.includes(role as any)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
}
export default ProtectedRoute;