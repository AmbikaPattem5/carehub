import { useState } from "react"
import type { PrescriptionMedicines } from "../types/PrescriptionTypes"
import { FileText, Pill, Calendar, User, Eye } from "lucide-react"
import PrescriptionPrint from "./PrescriptionPrint"

function ViewPrescriptionHistory({ prescriptionData, patientId }: { prescriptionData: PrescriptionMedicines[], patientId?: string }) {
    const [viewRxId, setViewRxId] = useState<string | null>(null);

    if (!prescriptionData || prescriptionData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Pill size={24} />
                </div>
                <h4 className="font-semibold text-slate-700 text-sm">No Prescriptions Issued</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    This patient has no recorded medications or prescription slips in their medical history.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {prescriptionData.map((prescription, index) => {
                const dateObj = prescription?.createdAt ? new Date(prescription.createdAt) : null;
                const formattedDate = dateObj
                    ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "Recent";

                const isRecent = index === 0;

                return (
                    <div key={prescription?.prescriptionId || index} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden hover:shadow-md transition">
                        {/* Prescription Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/70 border-b border-slate-200/80">
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                                    <FileText size={17} />
                                </div>

                                <div className="flex flex-wrap items-center gap-4 divide-x divide-slate-200">
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">Rx ID:</span>
                                        <span className="font-bold text-slate-900">{prescription.prescriptionId}</span>
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-[11px] text-slate-500 block">Prescribed By:</span>
                                        <span className="font-semibold text-slate-900">Dr. {prescription?.doctorName?.replace(/^Dr\.\s*/i, '') || "Priya Sharma"}</span>
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-[11px] text-slate-500 block">Date:</span>
                                        <span className="font-semibold text-slate-900">{formattedDate}</span>
                                    </div>
                                </div>

                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    isRecent ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-200 text-slate-700"
                                }`}>
                                    {isRecent ? "Active" : "Completed"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewRxId(prescription.prescriptionId)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition cursor-pointer shadow-xs"
                                >
                                    <Eye size={13} />
                                    View Rx Slip
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewRxId(prescription.prescriptionId)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition cursor-pointer shadow-xs"
                                >
                                    <FileText size={13} />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Medications Table */}
                        <div className="p-4">
                            <table className="w-full text-xs text-left border border-slate-200/80 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="bg-[#e6f4f2] text-slate-800 font-semibold border-b border-[#cceae5]">
                                        <th className="py-2.5 px-3.5">Medication Name</th>
                                        <th className="py-2.5 px-3.5">Dosage</th>
                                        <th className="py-2.5 px-3.5">Frequency</th>
                                        <th className="py-2.5 px-3.5">Duration / Instructions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {prescription?.medicines && prescription.medicines.length > 0 ? (
                                        prescription.medicines.map((item, mIdx) => (
                                            <tr key={mIdx} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3.5 font-semibold text-slate-800">{item?.name}</td>
                                                <td className="py-2.5 px-3.5 text-slate-700">{item?.dosage || "1 Tablet"}</td>
                                                <td className="py-2.5 px-3.5 text-slate-700">{item?.frequency || "Thrice daily"}</td>
                                                <td className="py-2.5 px-3.5 text-slate-600">{item?.instructions || item?.duration || "After meals"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-3 px-3.5 text-center text-slate-400">
                                                No specific medications recorded
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}

            {viewRxId && patientId && (
                <PrescriptionPrint
                    patientId={patientId}
                    prescriptionId={viewRxId}
                    onClose={() => setViewRxId(null)}
                />
            )}
        </div>
    )
}

export default ViewPrescriptionHistory;