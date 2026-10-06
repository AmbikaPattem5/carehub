import type { CommonType } from "./CommonTypes"
import type { User } from "./UserType"
export type RegistrationRequestBodyType = {
    name: string,
    email: string,
    password: string,
    role: "admin" | "doctor" | "receptionist" | ""
}

export type RegistrationResponseType = CommonType & {
    token: string,
    user: User,
}
export type RegistrationFormErrorType = {
    name: string,
    email: string,
    password: string,
    role: string
}