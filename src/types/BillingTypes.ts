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
    doctorName?: string
}
export type PaymentStatus = 'pending' | 'paid' | 'partially-paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'insurance' | 'other' | '';
export interface Billing extends BillingRequest {
    _id?: string;
    billId: string;
    patientName: string;
    patientPhone?: string;
    doctorId?: string;
    doctorName?: string;
    itemsSummary: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    amountPaid: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    transactionRef?: string;
    paidAt?: string;
    cancelReason?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BillingError {
    patientId: string;
    appointmentId: string;
    items: string;
    discount: string;
    taxPercent: string;
    notes: string;
}
export interface ItemsError {
    description: string;
    quantity: string;
    unitPrice: string;
}

export interface paymentRequest {
    transactionRef: string;
    notes: string;
    totalAmount?: number;
    amountPaid?: number;
    paymentMethod: string;
}
export enum PaymentStatus {
    all = "All Invoices",
    paid = "Paid",
    pending = "Pending",
    cancelled = "Cancelled"
}
export interface BillingSearch {
    statusData: PaymentStatus | "";
    search: string;
    date: string;
}

export interface StatisticsResponse {
    totalRevenue: number,
    pendingAmount: number,
    pendingCount: number,
    todayCollections: number,
    todayInvoicesCount: number,
    totalInvoicesCount: number,
    statusCounts: {
        all: number,
        paid: number,
        pending: number,
        cancelled: number
    }
}