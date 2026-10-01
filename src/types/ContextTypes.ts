export type AuthContextType = {
    token: string | null,
    user: string | null,
    role: string | null,
    login: (token: string, user: string, role: string) => void,
    logout: () => void
}