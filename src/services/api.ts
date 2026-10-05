import axios from "axios";
import useAuth from "../CustomHooks/useAuth";
const api = axios.create({
    baseURL: "https://carehub-backend-jhn2.onrender.com/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000,
})
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatically handle session expiry (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if needed
        }
        return Promise.reject(error);
    }
);


export default api;