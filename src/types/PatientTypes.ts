export type Gender = 'male' | 'female' | 'other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
export type PatientStatus = 'active' | 'inactive';

export interface Patient {
  _id?: string;
  id?: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup | string;
  emergencyContact?: string;
  status: PatientStatus | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  _id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup | string;
  emergencyContact?: string;
  status: PatientStatus | string;

}

export interface PatientsResponse {
  success: boolean;
  count: number;
  patients: Patient[];
  message?: string;
}

export interface PatientResponse {
  success: boolean;
  patient: Patient;
  message?: string;
}

export interface PatientFormErrors {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  status?: string;
}