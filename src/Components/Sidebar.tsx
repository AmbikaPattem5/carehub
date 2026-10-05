import logo from "../assets/logo.png"
import { Link, NavLink } from "react-router-dom"
import { LayoutDashboard, Users, User, CalendarDays, Receipt } from 'lucide-react';
import useAuth from '../CustomHooks/useAuth';
function Sidebar() {
    const { logout } = useAuth();
    return (
        <div className="hidden md:flex flex-col w-64 bg-slate-700 border-r border-gray-100 h-full">
            <div className="flex px-4 h-16 border-b border-gray-100 gap-3">
                <img src={logo} alt="logo" height={50} width={50} className="bg-gradient-to-br from-blue-500 to-cyan-400 text-transparent bg-clip-text" />
                <div className="flex flex-col">
                    <span className="font-semibold text-xl text-white">CareHub</span>
                    <p className="text-white ml-1">Clinic System</p>
                </div>
            </div>
            <div className="h-full">
                <div className="flex flex-col justify-between space-y-2 p-4 h-full">
                    <div>
                        <NavLink to="/" end className={({ isActive }) =>
                            `w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-teal-600 text-white font-medium" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                            }`}>
                            <LayoutDashboard className="h-5 w-5 mr-2" />
                            Dashboard
                        </NavLink>
                        <NavLink to="/patients" className={({ isActive }) =>
                            `w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-teal-600 text-white font-medium" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                            }`}>
                            <Users className="h-5 w-5 mr-2" />
                            Patients
                        </NavLink>
                        <NavLink to="/doctors" className={({ isActive }) =>
                            `w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-teal-600 text-white font-medium" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                            }`}>
                            <User className="h-5 w-5 mr-2" />
                            Doctors
                        </NavLink>
                        <NavLink to="/appointments" className={({ isActive }) =>
                            `w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-teal-600 text-white font-medium" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                            }`}>
                            <CalendarDays className="h-5 w-5 mr-2" />
                            Appointments
                        </NavLink>
                        <NavLink to="/billing" className={({ isActive }) =>
                            `w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${isActive ? "bg-teal-600 text-white font-medium" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                            }`}>
                            <Receipt className="h-5 w-5 mr-2" />
                            Billing
                        </NavLink>
                    </div>
                    <div className="px-4">
                        <button className="w-full flex items-center px-4 py-2.5 rounded-lg transition-colors bg-slate-600 text-white font-medium cursor-pointer" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default Sidebar;