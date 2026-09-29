import type { Patient } from "./PatientTypes"
import type { Doctor } from "./DoctorTypes"
export interface AppointmentRequest {
    appointmentId?: string
    patientId: string
    doctorId: string
    date: string
    time: string
    reason: string

}

export interface AppointmentResponse extends AppointmentRequest {
    _id: string;
    createdAt: string;
    updatedAt: string;
    patient: Patient;
    doctor: Doctor;
    status: string;
    appointmentNo: string;
    patientName?: string;
    doctorName?: string;

}

export interface AppointmentError {
    patientId: string
    doctorId: string
    date: string
    time: string
    reason: string

}
export enum Status {
    All = "all",
    Confirmed = "confirmed",
    Pending = "pending",
    Completed = "completed"

}
export interface EditData {
    status: Status;
    notes: string
}