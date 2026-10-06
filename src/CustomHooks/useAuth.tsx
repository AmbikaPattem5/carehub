import { useContext } from "react";
import { AuthContextData } from "../Context/AuthContext";
function useAuth() {
    const context = useContext(AuthContextData)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
export default useAuth;