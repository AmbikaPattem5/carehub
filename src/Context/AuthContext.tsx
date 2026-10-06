import { createContext } from "react";
import type { AuthContextType } from "../types/ContextTypes";

export const AuthContextData = createContext<AuthContextType | null>(null)