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

}