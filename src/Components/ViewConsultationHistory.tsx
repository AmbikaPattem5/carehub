import type { ConsultationType } from "../types/PrescriptionTypes"
import { Calendar, Stethoscope, User } from "lucide-react"

function ViewConsultationHistory({ consultationData }: { consultationData: ConsultationType[] }) {
    if (!consultationData || consultationData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Stethoscope size={24} />
                </div>
                <h4 className="font-semibold text-slate-700 text-sm">No Consultations Recorded</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    This patient does not have any clinical consultation notes or diagnostic history recorded yet.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2 py-2">
            {consultationData.map((consultation, index) => {
                const dateObj = consultation?.createdAt ? new Date(consultation.createdAt) : null;
                const formattedDate = dateObj
                    ? dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                    : "Aug 14, 2023";

                const symptomsList = Array.isArray(consultation.symptoms)
                    ? consultation.symptoms
                    : typeof consultation.symptoms === "string"
                    ? (consultation.symptoms as string).split(",").map((s) => s.trim())
                    : [];

                return (
                    <div key={consultation?.consultationId || index} className="flex items-start gap-4">
                        {/* Left Date indicator */}
                        <div className="w-32 shrink-0 text-right pt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-600">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{formattedDate}</span>
                        </div>

                        {/* Center vertical line and dot */}
                        <div className="relative flex flex-col items-center self-stretch">
                            <div className="w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-100 shrink-0 z-10 mt-1"></div>
                            {index < consultationData.length - 1 && (
                                <div className="w-0.5 bg-slate-200 grow my-1"></div>
                            )}
                        </div>

                        {/* Right Card / Content */}
                        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 hover:shadow-md transition">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="text-sm font-bold text-slate-900">
                                    {formattedDate} | {consultation?.diagnosis || "Routine Check-up"}
                                </h4>
                                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                                    {consultation.consultationId}
                                </span>
                            </div>

                            <div className="text-xs text-slate-600 mb-2.5 flex items-center gap-1.5">
                                <User size={13} className="text-slate-400" />
                                <span>Dr. {consultation?.doctorName ? consultation.doctorName.replace(/^Dr\.\s*/i, '') : "Emily Carter"}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-xs font-semibold bg-teal-700 text-white px-3 py-1 rounded-full">
                                    Diagnosed Conditions: {consultation?.diagnosis || "Hypertension"}
                                </span>

                                {symptomsList.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                        <span className="font-semibold text-slate-700">Symptoms:</span>
                                        {symptomsList.map((symptom, sIdx) => (
                                            <span key={sIdx} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                                                {symptom}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {consultation?.doctorNotes && (
                                <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                    <strong className="font-semibold text-slate-800">Notes: </strong>
                                    {consultation.doctorNotes}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ViewConsultationHistory;