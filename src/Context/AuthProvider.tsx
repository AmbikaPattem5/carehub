import { useState } from "react"
import { AuthContextData } from "./AuthContext"
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"))
    const [role, setRole] = useState<string | null>(localStorage.getItem("role"))
    function login(token: string, user: string, role: string) {
        localStorage.setItem("token", token)
        localStorage.setItem("user", user)
        localStorage.setItem("role", role)
        setToken(token)
        setUser(user)
        setRole(role)
    }
    function logout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("role")
        setToken(null)
        setUser(null)
        setRole(null);
    }
    return (
        <AuthContextData.Provider value={{ token, user, login, logout, role }}>
            {children}
        </AuthContextData.Provider>
    )
}

export default AuthProvider;