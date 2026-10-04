import { useState, useEffect } from "react";
import type { LoginRequestType } from "../types/LoginType";
import api from "../services/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"
import toast from "react-hot-toast"
import useAuth from "../CustomHooks/useAuth";
function Login() {
    const [formData, setFormData] = useState<LoginRequestType>({ email: '', password: '' })
    const navigate = useNavigate()
    const { login } = useAuth();
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, [])

    const defaultCredentials = {
        "admin": { email: "admin@carehub.com", password: "password123" },
        "doctor": { email: "doctor@carehub.com", password: "password123" },
        "receptionist": { email: "reception@carehub.com", password: "password123" }
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })

    }
    async function executeLogin(form: LoginRequestType) {
        try {
            const response = await api.post("auth/login", form)
            console.log(response.data)
            if (response && response.data.success) {
                login(response.data.token, response.data.user.name, response.data.user.role)
                toast.success("Login successful")
                navigate('/')
            }
            console.log(response)
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Something went wrong.Please try again")
            console.log(err)
        }

    }
    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        executeLogin(formData);
    }
    function handleDefaultFormData(role: "admin" | "doctor" | "receptionist") {
        const credentials: LoginRequestType = defaultCredentials[role]
        executeLogin(credentials);
    }
    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 space-y-6">
                <div className="text-center space-y-2">
                    <img src={logo} alt="logo" className="h-16 w-auto mx-auto" />
                    <span className="font-semibold text-xl">CareHub</span>
                    <h1 className="text-2xl font-semibold">Login to your account</h1>
                    <p className="text-sm text-gray-500">Welcome back, please enter your details</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
                    </div>
                    <div className="space-y-1.5">
                        <label>Password</label>
                        <div className="relative">
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
                            <span className="absolute top-2 right-2 text-sm text-green-600 hover:underline hover:text-green-700"><Link to="/forgot-password">Forgot Password?</Link></span>
                        </div>
                    </div>
                    <button type="submit" disabled={formData.email == "" || formData.password == "" ? true : false} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer mt-2">Login</button>
                    <p className="text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-red-600 hover:underline hover:text-red-700">Register here</Link></p>
                </form>
                <div className="flex items-center justify-center gap-4 ">
                    <button className="bg-gray-600 px-4 py-2 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer" onClick={() => handleDefaultFormData("admin")}>Admin</button>
                    <button className="bg-gray-600 px-4 py-2 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer" onClick={() => handleDefaultFormData("doctor")}>Doctor</button>
                    <button className="bg-gray-600 px-4 py-2 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer" onClick={() => handleDefaultFormData("receptionist")}>Receptionist</button>
                </div>
            </div>
        </div>
    )
}
export default Login;