import { useState, useEffect } from "react";
import ViewConsultationHistory from "../Components/ViewConsultationHistory"
import ViewPrescriptionHistory from "../Components/ViewPrescriptionHistory"
import ViewInvoiceHistory from "../Components/ViewInvoiceHistory"
import type { ConsultationType } from "../types/PrescriptionTypes"
import type { PrescriptionMedicines } from "../types/PrescriptionTypes"
import type { Billing, StatisticsResponse } from "../types/BillingTypes"
import { X, Calendar, FileText, Receipt, Printer } from "lucide-react"
import api from "../services/api"

function AddViewHistoryModal({ onClose, patientId }: { onClose: () => void, patientId: string }) {
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionMedicines[] | null>(null);
    const [patientData, setPatientData] = useState<any>(null);
    const [consultationData, setConsultationData] = useState<ConsultationType[] | null>(null);
    const [invoiceData, setInvoiceData] = useState<Billing[] | null>(null);
    const [invoiceStats, setInvoiceStats] = useState<StatisticsResponse | null>(null);
    const [historyValue, setHistoryValue] = useState<"consultation" | "prescription" | "invoice">("consultation");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadAllHistoryData() {
            setLoading(true);
            try {
                const [patientRes, prescRes, consRes, billsRes] = await Promise.allSettled([
                    api.get(`/patients/${patientId}`),
                    api.get(`/prescriptions/patient/${patientId}`),
                    api.get(`/consultations/patient/${patientId}`),
                    api.get(`/bills`, { params: { patientId } })
                ]);

                if (patientRes.status === "fulfilled" && patientRes.value?.data?.success) {
                    setPatientData(patientRes.value.data.patient);
                }
                if (prescRes.status === "fulfilled" && prescRes.value?.data?.prescriptions) {
                    setPrescriptionData(prescRes.value.data.prescriptions);
                }
                if (consRes.status === "fulfilled" && consRes.value?.data?.consultations) {
                    setConsultationData(consRes.value.data.consultations);
                }
                if (billsRes.status === "fulfilled" && billsRes.value?.data) {
                    setInvoiceData(billsRes.value.data.bills || []);
                    setInvoiceStats(billsRes.value.data.stats || null);
                }
            } catch (err) {
                console.error("Failed to load patient history:", err);
            } finally {
                setLoading(false);
            }
        }
        if (patientId) {
            loadAllHistoryData();
        }
    }, [patientId]);

    const birthDate = patientData?.dateOfBirth ? new Date(patientData.dateOfBirth) : null;
    const today = new Date();
    const age = birthDate ? today.getFullYear() - birthDate.getFullYear() : "";

    const initials = patientData?.firstName && patientData?.lastName
        ? `${patientData.firstName[0]}${patientData.lastName[0]}`.toUpperCase()
        : patientData?.firstName
            ? patientData.firstName.slice(0, 2).toUpperCase()
            : "PT";

    function handlePrintSummary() {
        window.print();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Patient Medical History</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Patient Profile Banner */}
                    <div className="flex items-center justify-between p-4 bg-[#183642] text-white rounded-2xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 pr-4 border-r border-slate-700/80">
                                <div className="w-8 h-8 rounded-xl bg-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                                    {initials}
                                </div>
                                <span className="font-bold text-base tracking-tight text-white hidden sm:inline">CareHub</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h3 className="font-bold text-lg text-white">
                                        {patientData ? `${patientData.firstName} ${patientData.lastName}` : ""}
                                    </h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-teal-200">
                                        {patientData?.patientId || patientId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                                    <span>Age: {age ? `${age} Yrs` : "28 Yrs"} / {patientData?.gender || "Male"}</span>
                                    <span>•</span>
                                    <span>Blood Group: <strong className="text-teal-300">{patientData?.bloodGroup || "O+"}</strong></span>
                                    {patientData?.phone && (
                                        <>
                                            <span>•</span>
                                            <span>Ph: {patientData.phone}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 shadow-xs">
                            Active
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2">
                    <button
                        onClick={() => setHistoryValue("consultation")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer ${historyValue === "consultation"
                                ? "border-teal-600 text-teal-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        <Calendar size={16} />
                        Consultations & Visits
                        <span className={`text-xs px-2 py-0.5 rounded-full ${historyValue === "consultation" ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                            {consultationData?.length ?? 0}
                        </span>
                    </button>

                    <button
                        onClick={() => setHistoryValue("prescription")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer ${historyValue === "prescription"
                                ? "border-teal-600 text-teal-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        <FileText size={16} />
                        Prescriptions
                        <span className={`text-xs px-2 py-0.5 rounded-full ${historyValue === "prescription" ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                            {prescriptionData?.length ?? 0}
                        </span>
                    </button>

                    <button
                        onClick={() => setHistoryValue("invoice")}
                        className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer ${historyValue === "invoice"
                                ? "border-teal-600 text-teal-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        <Receipt size={16} />
                        Billing & Invoices
                        <span className={`text-xs px-2 py-0.5 rounded-full ${historyValue === "invoice" ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                            {invoiceData?.length ?? 0}
                        </span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/60 min-h-[350px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-medium">Loading patient history...</p>
                        </div>
                    ) : (
                        <>
                            {historyValue === "consultation" && <ViewConsultationHistory consultationData={consultationData || []} />}
                            {historyValue === "prescription" && <ViewPrescriptionHistory prescriptionData={prescriptionData || []} patientId={patientId} />}
                            {historyValue === "invoice" && <ViewInvoiceHistory invoiceData={invoiceData || []} invoiceStats={invoiceStats} />}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handlePrintSummary}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
                    >
                        <Printer size={15} />
                        Print Summary
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
export default AddViewHistoryModal;