import { useState, useEffect } from "react";
import type { PrescriptionMedicines } from "../types/PrescriptionTypes"
import api from "../services/api"
import type { Patient } from "../types/PatientTypes"
import { Phone, Mail, Printer, Download, X, Loader2 } from "lucide-react"
import logo from "../assets/logo.png"

function PrescriptionPrint({ onClose, patientId, prescriptionId }: { onClose: () => void, patientId: string, prescriptionId: string }) {
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionMedicines | null>(null)
    const [patientData, setPatientData] = useState<Patient | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function loadPatientPrecriptionData() {
            setLoading(true);
            try {
                const [prescRes, patientRes] = await Promise.allSettled([
                    api.get(`/prescriptions/patient/${patientId}`),
                    api.get(`/patients/${patientId}`)
                ]);

                if (prescRes.status === "fulfilled" && prescRes.value?.data?.prescriptions) {
                    const filterPrescriptionData = prescRes.value.data.prescriptions;
                    const updatedData = filterPrescriptionData?.find((prescription: any) => prescription.prescriptionId === prescriptionId);
                    setPrescriptionData(updatedData);
                }

                if (patientRes.status === "fulfilled" && patientRes.value?.data?.patient) {
                    setPatientData(patientRes.value.data.patient);
                }
            } catch (err) {
                console.error("Failed to load prescription print data", err);
            } finally {
                setLoading(false);
            }
        }
        if (patientId) {
            loadPatientPrecriptionData();
        }
    }, [patientId, prescriptionId])
    const birthDate = patientData?.dateOfBirth ? new Date(patientData.dateOfBirth) : new Date();
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    // const createdDate = patientData?.createdAt;
    // const currentDate = createdDate.slice(0, 10)
    function handlePrint() {
        const receiptElement = document.getElementById("prescription-content");
        if (!receiptElement) return;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
      <html>
        <head>
          <title>Receipt_${prescriptionData?.prescriptionId}</title>
          <link rel="stylesheet" href="/src/index.css">
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
      </html>
    `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
    const rxDate = prescriptionData?.createdAt
        ? new Date(prescriptionData.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const doctorName = prescriptionData?.doctorName || "Priya Sharma";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[94vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        CareHub Clinic - Medical Prescription (Rx)
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Prescription Printable Paper Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                            <p className="text-sm font-medium">Loading prescription details...</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto text-slate-800 space-y-4" id="prescription-content">
                        {/* Clinic & Doctor Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200/90">
                            {/* Clinic Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <img src={logo} alt="CareHub Logo" className="w-8 h-8 object-contain" />
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 leading-tight">CareHub</h4>
                                        <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Medical Clinic</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                                    104 Healthcare Boulevard,<br />
                                    Indiranagar, Bengaluru, India
                                </p>
                            </div>

                            {/* Doctor Info */}
                            <div className="sm:text-right space-y-0.5 text-xs text-slate-600">
                                <h5 className="font-bold text-sm text-slate-900">Dr. {doctorName.replace(/^Dr\.\s*/i, '')}, MBBS</h5>
                                <p className="font-medium text-slate-700">MD (Internal Medicine) • Reg. No: 88412</p>
                                <p className="flex items-center sm:justify-end gap-1 text-slate-500 pt-1">
                                    <Phone size={12} className="text-teal-600" /> +91 (923) 456-4877
                                </p>
                                <p className="flex items-center sm:justify-end gap-1 text-slate-500">
                                    <Mail size={12} className="text-teal-600" /> clinic@carehub.com
                                </p>
                            </div>
                        </div>

                        {/* Patient Meta & Vitals Banner */}
                        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 text-xs space-y-1 text-slate-700">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span>
                                    <strong className="text-slate-900">Patient: </strong>
                                    {patientData?.firstName} {patientData?.lastName} ({patientData?.patientId || "PAT-1001"})
                                </span>
                                <span>
                                    <strong className="text-slate-900">Age: </strong>
                                    {age || 28} / {patientData?.gender || "Male"}
                                </span>
                                <span>
                                    <strong className="text-slate-900">Date: </strong>
                                    {rxDate}
                                </span>
                            </div>
                            <div className="pt-0.5 text-slate-500 flex items-center justify-between">
                                <span><strong className="text-slate-700">Vitals: </strong>BP 120/80 mmHg, Pulse 72 bpm</span>
                                <span><strong className="text-slate-700">Blood Group: </strong>{patientData?.bloodGroup || "O+"}</span>
                            </div>
                        </div>

                        {/* Medical Rx Symbol */}
                        <div className="pt-1">
                            <span className="text-2xl font-serif font-black text-slate-900 block select-none">
                                ℞
                            </span>
                        </div>

                        {/* Medications Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                                        <th className="py-2.5 px-3 w-12 text-center">S.No.</th>
                                        <th className="py-2.5 px-3">Medication Name</th>
                                        <th className="py-2.5 px-3">Dosage</th>
                                        <th className="py-2.5 px-3">Frequency</th>
                                        <th className="py-2.5 px-3">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {prescriptionData?.medicines && prescriptionData.medicines.length > 0 ? (
                                        prescriptionData.medicines.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}.</td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-900">Tab. {item?.name}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item?.dosage || "1 Tablet"}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item?.frequency || "1-0-1"}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item?.duration || "5 Days"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-4 text-center text-slate-400">
                                                No medicines listed on this prescription slip.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Special Advice Box */}
                        <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 text-xs text-teal-950 font-medium">
                            <strong className="text-teal-900 font-bold">Special advice: </strong>
                            Stay hydrated, warm salt water gargle twice daily, light diet.
                        </div>

                        {/* Review Timeline */}
                        <div className="text-xs font-semibold text-slate-700 pt-1">
                            Review in clinic after 5 days
                        </div>

                        {/* Digital Signature */}
                        <div className="flex flex-col items-end text-right pt-4">
                            <div className="font-serif italic font-bold text-base text-slate-800 tracking-wider">
                                Dr. {doctorName.replace(/^Dr\.\s*/i, '')}
                            </div>
                            <div className="w-36 border-b border-slate-300 my-1"></div>
                            <div className="text-xs font-semibold text-slate-800">
                                Dr. {doctorName.replace(/^Dr\.\s*/i, '')}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                Digital Signature
                            </div>
                        </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/90 bg-slate-50/70">
                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <Printer size={15} /> Print Prescription
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
export default PrescriptionPrint;