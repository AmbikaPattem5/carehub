import { useState, useEffect } from "react";
import { subscribeToLoading } from "../services/api";
import { Loader2 } from "lucide-react";

export default function GlobalProgressBar() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToLoading((loading) => {
            setIsLoading(loading);
        });
        return unsubscribe;
    }, []);

    if (!isLoading) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in duration-150"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="bg-white/95 p-5 rounded-2xl shadow-2xl border border-slate-100/80 flex items-center justify-center animate-in zoom-in-95 duration-150">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}
