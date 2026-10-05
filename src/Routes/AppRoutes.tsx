import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import Registration from "../Pages/Registration";
import ForgotPassword from "../Pages/ForgotPassword";
import Home from "../Pages/Home";
import Patients from "../Pages/Patients";
import Doctors from "../Pages/Doctors";
import Appointments from "../Pages/Appointments";
import Billing from "../Pages/Billing";
import Dashboard from "../Pages/Dashboard";
import useAuth from "../CustomHooks/useAuth";

function AppRoutes() {
    const { token } = useAuth();

    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/" replace /> : <Registration />} />
            <Route path="/forgot-password" element={token ? <Navigate to="/" replace /> : <ForgotPassword />} />

            {/* Protected App Routes */}
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="patients" element={<Patients />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="billing" element={<Billing />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
    );
}

export default AppRoutes;