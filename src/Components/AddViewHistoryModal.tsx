import { useState, useEffect } from "react";
import ViewConsultationHistory from "../Components/ViewConsultationHistory"
import ViewPrescriptionHistory from "../Components/ViewPrescriptionHistory"
import ViewInvoiceHistory from "../Components/ViewInvoiceHistory"
import type { ConsultationType } from "../types/PrescriptionTypes"
import type { PrescriptionMedicines } from "../types/PrescriptionTypes"



import type { Billing } from "../types/BillingTypes"
import type { StatisticsResponse } from "../types/BillingTypes"
import { X, User } from "lucide-react"

import api from "../services/api"
function AddViewHistoryModal({ onClose, patientId }: { onClose: () => void, patientId: string }) {
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionMedicines[] | null>(null);
    const [patientData, setPatientData] = useState(null);
    const [consultationData, setConsultationData] = useState<ConsultationType[] | null>(null);
    const [invoiceData, setInvoiceData] = useState<Billing[] | null>(null);
    const [invoiceStats, setInvoiceStats] = useState<StatisticsResponse | null>(null);
    const [historyValue, setHistoryValue] = useState<string>("consultation");
    useEffect(() => {
        async function loadPatientPrecriptionData() {
            try {
                const response = await api.get(`/prescriptions/patient/${patientId}`)

                setPrescriptionData(response.data.prescriptions)

            }
            catch (error) {
                console.log(error);
            }
            try {
                const response = await api.get(`/patients/${patientId}`);
                if (response && response.data && response.data.success) {
                    setPatientData(response.data.patient)
                }
            }
            catch (err) {
                console.log(err)
            }
            try {
                const response = await api.get(`/consultations/patient/${patientId}`)
                setConsultationData(response.data.consultations)
            }
            catch (error) {
                console.log(error);
            }
            try {
                const response = await api.get(`/bills`, {
                    params: {
                        patientId: patientId
                    }
                })

                setInvoiceData(response.data.bills)
                setInvoiceStats(response.data.stats)

            }
            catch (error) {
                console.log(error);
            }
        }
        loadPatientPrecriptionData();
    }, [])
    const birthDate = new Date(patientData?.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-visible flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200" >
                <div >
                    <div className="flex justify-between m-2">
                        <h1 className="font-bold text-xl m-2">Patient Medical History</h1>
                        <button onClick={onClose} className="hover:bg-gray-300 m-2">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex flex-row m-2 border border-gray-200 bg-blue-200 ">
                        <div>
                            <User size={20} />
                        </div>
                        <div className="flex flex-col">
                            <p>{patientData?.firstName} {patientData?.lastName}</p>
                            <p>{patientData?.patientId} | Age :{age}/{patientData?.gender} | Blood Group : {patientData?.bloodGroup}</p>
                        </div>
                    </div>
                    <div className="border-b border-gray-300">
                        <div className="flex flex-row ">
                            <button onClick={() => setHistoryValue("consultation")} className={`hover:bg-blue-500 text-white ${historyValue === "consultation" ? "bg-blue-500 text-white" : "bg-gray-400"} border border-gray-200 rounded m-2 p-2`}>Consultations & Visits</button>
                            <button onClick={() => setHistoryValue("prescription")} className={`hover:bg-blue-500 text-white ${historyValue === "prescription" ? "bg-blue-500 text-white" : "bg-gray-400"} border border-gray-200 rounded m-2 p-2`}>Prescriptions</button>
                            <button onClick={() => setHistoryValue("invoice")} className={`hover:bg-blue-500 text-white ${historyValue === "invoice" ? "bg-blue-500 text-white" : "bg-gray-400"} border border-gray-200 rounded m-2 p-2`}>Billing & Invoices</button>
                        </div>
                    </div>
                </div>
                {historyValue === "consultation" && <ViewConsultationHistory consultationData={consultationData} />}
                {historyValue === "invoice" && <ViewInvoiceHistory invoiceData={invoiceData} invoiceStats={invoiceStats} />}
                {historyValue === "prescription" && <ViewPrescriptionHistory prescriptionData={prescriptionData} />}



            </div>
        </div>

    )
}
export default AddViewHistoryModal;