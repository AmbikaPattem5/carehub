export interface PrescriptionNotes {
    appointmentId: string,
    patientId: string,
    symptoms: string[],
    diagnosis: string,
    doctorNotes: string

}
export interface Medicines {
    name: string,
    dosage: string,
    frequency: string,
    duration: string,
    instructions: string

}

export interface PrescriptionMedicines {

    consultationId: string,
    patientId: string,
    medicines: Medicines[];
    doctorName: string;
    prescriptionId: string
    createdAt: string

}
export interface ConsultationType {
    _id: string,
    consultationId: string,
    appointment: string,
    appointmentId: string,
    patient: string,
    patientId: string,
    patientName: string,
    doctor: string,
    doctorId: string,
    doctorName: string,
    symptoms: [],
    diagnosis: string,
    doctorNotes: string,
    createdAt: string,
    updatedAt: string,
}