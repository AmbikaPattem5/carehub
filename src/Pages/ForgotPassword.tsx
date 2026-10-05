import logo from "../assets/logo.png"
import { Link } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
function ForgotPassword() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>('');
    const [isEmailValid, setEmailValid] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.type == "email") {
            setEmail(e.target.value);
        }
        if (e.target.type == "password") {
            setPassword(e.target.value);
        }
    }
    async function handleSubmit() {
        try {
            const response = await api.post("auth/forgot-password", { email })
            if (response && response.data && response.data.message) {
                toast.success(response.data.message);
                setEmailValid(true);

            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Something went wrong.Please try again")
        }

    }
    async function handleResetPassword() {
        try {
            const response = await api.post("auth/reset-password", { email, newPassword: password });
            if (response && response.data && response.data.success) {
                toast.success(response.data.message);
                navigate("/login")
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Something went wrong.Please try again")
        }
    }
    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 space-y-6">
                <div className="text-center space-y-2">
                    <img src={logo} alt="logo" className="h-16 w-auto mx-auto" />
                    <span className="font-semibold text-xl">CareHub</span>
                    <h1 className="text-2xl font-semibold">Forgot Password?</h1>
                    <form>
                        <div>
                            <p className="text-sm text-gray-500"> No worries! Enter your clinic email we will send you a password reset link</p>
                            <label>Email Address</label>
                            <input type="email" name="email" id="email" className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-2" value={email} onChange={handleChange} disabled={isEmailValid} />
                            {!isEmailValid && <button type="button" className="w-full mx-auto py-2 mt-2 rounded-xl border border-gray-300 bg-green-500 hover:bg-green-700 text-white cursor-pointer p-2" onClick={handleSubmit}>Send Reset Link</button>}
                        </div>
                        {isEmailValid &&
                            <div className="space-y-2">

                                <label>Enter a new password</label>
                                <input type="password" name="password" id="password" className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-2" value={password} onChange={handleChange} />
                                <button type="button" className="w-full mx-auto py-2 mt-2 rounded-xl border border-gray-300 bg-green-500 hover:bg-green-700 text-white cursor-pointer p-2" onClick={handleResetPassword}>Update Password</button>
                            </div>
                        }

                    </form>
                </div>
                <Link className="w-full text-center mt-2 px-10 mt-2 text-red-500 hover:underline py-2" to='/login'>Back to Login</Link>
            </div>
        </div>
    )
}
export default ForgotPassword