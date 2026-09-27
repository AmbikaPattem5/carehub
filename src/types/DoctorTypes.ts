export enum Status {
    active = "active",
    inactive = "inactive"
}

export enum Specialization {
    Cardiologist = "Cardiologist",
    Dermatologist = "Dermatologist",
    Gynecologist = "Gynecologist",
    Pediatrician = "Pediatrician",
    GeneralPhysician = "General Physician",
    Orthopedic = "Orthopedic",
    Ophthalmologist = "Ophthalmologist",
    Neurologist = "Neurologist",
    Psychiatrist = "Psychiatrist",
}
export enum AvailableDays {
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
    Sunday = "Sunday"
}

export enum AvailableHours {
    "09:00-12:00" = "09:00-12:00",
    "12:00-15:00" = "12:00-15:00",
    "15:00-18:00" = "15:00-18:00",
    "18:00-21:00" = "18:00-21:00",
}

export interface Doctor {
    _id: string;
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: number;
    consultationFee: number;
    availableDays: string[];
    availableHours: string;
    status: Status;
}

export interface CreateDoctorRequest {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: number;
    consultationFee: number;
    availableDays: string[];
    availableHours: string;
    status?: Status;
}

export interface UpdateDoctorRequest {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: "";
    experience?: number | null;
    consultationFee: number | null;
    availableDays?: string[];
    availableHours: string;
    status: Status;
}

export interface doctorFormErrors {
    name: string,
    email: string,
    phone: string,
    specialization: string,
    experience: string,
    consultationFee: string,
    availableDays: string,
    availableHours: string,
    status?: string
}
