import { User } from "lucide-react"
import type { Doctor } from "../types/DoctorTypes"
import AddDoctorModal from "../Components/AddDoctorModal"
import { useState } from "react";
function DoctorCard({ doctor, getDoctorList }: { doctor: Doctor, getDoctorList: () => void }) {
    const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
    function handleEditProfile() {
        setEditDoctor(doctor);
    }
    if (editDoctor) {
        return <AddDoctorModal doctor={doctor} onClose={() => { setEditDoctor(null); if (getDoctorList) getDoctorList(); }} />
    }
    return (
        <div className="g-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2 border border-gray-400 rounded-xl p-2 min-h-[200px]">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                            <User size={22} />
                        </div>

                        <div>
                            <h4 className="font-bold text-sm text-slate-900">{doctor.name}</h4>
                            <p className="text-xs font-medium text-teal-600">{doctor.specialization}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${doctor.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                        {doctor.status || 'Active'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        ⭐ {doctor.experience} yrs exp
                    </span>
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        ₹{doctor.consultationFee} fee
                    </span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50/60 p-2 rounded-xl mb-4">
                    📅 <span className="font-medium text-slate-700">{doctor.availableDays?.join(", ") || "Mon - Fri"}</span>
                    <span className="mx-1">•</span>
                    <span>{doctor.availableHours}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
                    <button disabled={doctor.status === 'inactive'} className={`flex-1 text-xs font-semibold py-2 px-3 rounded-xl transition ${doctor.status === 'inactive'
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        }`}>Book Slot</button>
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer" onClick={handleEditProfile}>Edit Profile</button>
                </div>

            </div>

        </div>
    )
}

export default DoctorCard;