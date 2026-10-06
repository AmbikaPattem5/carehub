import axios from "axios";

type LoadingSubscriber = (isLoading: boolean, activeCount: number) => void;
const subscribers = new Set<LoadingSubscriber>();
let activeRequestsCount = 0;

export const subscribeToLoading = (subscriber: LoadingSubscriber) => {
    subscribers.add(subscriber);
    subscriber(activeRequestsCount > 0, activeRequestsCount);
    return () => {
        subscribers.delete(subscriber);
    };
};

const notifySubscribers = () => {
    const isLoading = activeRequestsCount > 0;
    subscribers.forEach((subscriber) => subscriber(isLoading, activeRequestsCount));
};

const api = axios.create({
    baseURL: "https://carehub-backend-jhn2.onrender.com/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        activeRequestsCount++;
        notifySubscribers();
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        activeRequestsCount = Math.max(0, activeRequestsCount - 1);
        notifySubscribers();
        return Promise.reject(error);
    }
);

// Automatically handle session expiry (401)
api.interceptors.response.use(
    (response) => {
        activeRequestsCount = Math.max(0, activeRequestsCount - 1);
        notifySubscribers();
        return response;
    },
    (error) => {
        activeRequestsCount = Math.max(0, activeRequestsCount - 1);
        notifySubscribers();
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;