import { useState } from "react"
import type { RegistrationRequestBodyType } from "../types/RegistrationType"
import api from "../services/api"
import type { RegistrationFormErrorType } from "../types/RegistrationType"
import logo from "../assets/logo.png"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
function Registration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegistrationRequestBodyType>({
        name: "",
        email: "",
        password: "",
        role: ""
    })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [formErrors, setFormErrors] = useState<RegistrationFormErrorType>({
        name: "",
        email: "",
        password: "",
        role: ""
    })
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }
    function validateForm() {
        const errors: RegistrationFormErrorType = {
            name: "",
            email: "",
            password: "",
            role: ""
        }
        if (!formData.name) {
            errors.name = "Name is required"
        }
        if (!formData.email) {
            errors.email = "Email is required"
        }
        if (!formData.password) {
            errors.password = "Password is required"
        }
        if (!formData.role) {
            errors.role = "Role is required"
        }
        return errors
    }
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.values(errors).some((error) => error !== "")) {
            return
        }
        setIsLoading(true);
        try {
            const response = await api.post("auth/register", formData)
            if (response && response.data.success) {
                toast.success("User registered successfully");
                navigate('/login')
            }
            console.log(response);
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Something went wrong.Please try again")
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 space-y-6">
                <div className="text-center space-y-2">
                    <img src={logo} alt="logo" className="h-16 w-auto mx-auto" />
                    <span className="font-semibold text-xl">CareHub</span>
                    <h1 className="text-2xl font-semibold">Register Staff Account</h1>
                    <p className="text-sm text-gray-500">Join carehub clinic management platform</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label>Full Name </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
                        {formErrors.name && <p className="text-red-500 text-xs">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
                        {formErrors.email && <p className="text-red-500 text-xs">{formErrors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label>Password </label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" />
                        {formErrors.password && <p className="text-red-500 text-xs">{formErrors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 outline-hidden focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 transition" >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
                        {formErrors.role && <p className="text-red-500 text-xs">{formErrors.role}</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer mt-2 disabled:opacity-60">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>
                </form>
                <div className="space-y-1.5 text-center">
                    <p className="text-sm text-gray-500">Already have an Account? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 hover:underline">SignIn</Link></p>
                </div>
            </div>
        </div>
    )
}
export default Registration