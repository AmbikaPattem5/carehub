import api from './api';
import type {
  CreatePatientRequest,
  PatientsResponse,
  PatientResponse,
} from '../types/PatientTypes';

export interface PatientFilterParams {
  search?: string;
  gender?: string;
  status?: string;
}

export const patientService = {
  // Fetch patients list with optional search and filters
  getPatients: async (params?: PatientFilterParams): Promise<PatientsResponse> => {
    const response = await api.get<PatientsResponse>('/patients', { params });
    return response.data;
  },

  // Fetch single patient details
  getPatientById: async (id: string): Promise<PatientResponse> => {
    const response = await api.get<PatientResponse>(`/patients/${id}`);
    return response.data;
  },

  // Register a new patient
  createPatient: async (data: CreatePatientRequest): Promise<PatientResponse> => {
    const response = await api.post<PatientResponse>('/patients', data);
    return response.data;
  },

  // Update an existing patient
  updatePatient: async (
    id: string,
    updates: Partial<CreatePatientRequest>
  ): Promise<PatientResponse> => {
    const response = await api.patch<PatientResponse>(`/patients/${id}`, updates);
    return response.data;
  },

  // Delete / deactivate a patient
  deletePatient: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/patients/${id}`);
    return response.data;
  },
};

export default patientService;
