import type { CommonType } from "./CommonTypes";
import type { User } from "./UserType";
export type LoginRequestType = {
    email: string,
    password: string,
}

export type LoginResponseType = CommonType & {
    token: string,
    user: User,
}