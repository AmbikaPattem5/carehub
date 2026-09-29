export interface Item {
    description: string;
    amount: number | null;
    quantity: number | null;
    unitPrice: number | null;
}
export interface BillingRequest {
    patientId: string;
    appointmentId: string;
    items: Array<Item>;
    discount: number;
    taxPercent: number;
    notes: string;
}

export interface BillingError {
    patientId: string;
    appointmentId: string;
    items: string;
    discount: string;
    taxPercent: string;
    notes: string;
}