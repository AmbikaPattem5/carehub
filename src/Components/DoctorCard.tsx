import { User, Trash2 } from "lucide-react"
import type { Doctor } from "../types/DoctorTypes"
import AddDoctorModal from "../Components/AddDoctorModal"
import AddAppointmentModal from "../Components/AddAppointmentModal"
import DeleteConfirmModal from "../Components/DeleteConfirmModal"
import { useState } from "react";
import api from "../services/api"
import toast from "react-hot-toast"
import useAuth from "../CustomHooks/useAuth"

function DoctorCard({ doctor, getDoctorList }: { doctor: Doctor, getDoctorList: () => void }) {
    const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
    const [isAppointmentModal, setIsAppointmentModal] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { role } = useAuth()

    function handleEditProfile() {
        setEditDoctor(doctor);
    }
    function handleBookSlot() {
        setIsAppointmentModal(true);
    }

    async function handleDeleteDoctor() {
        setIsDeleting(true);
        try {
            const targetId = doctor._id || doctor.doctorId;
            const response = await api.delete(`/doctors/${targetId}`);
            if (response.data.success) {
                toast.success("Doctor deleted successfully");
                setIsDeleteModalOpen(false);
                getDoctorList();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete doctor");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex flex-col gap-2 min-h-[200px]">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                            <User size={22} />
                        </div>

                        <div>
                            <h4 className="font-bold text-sm text-slate-900">{doctor.name}</h4>
                            <p className="text-xs font-medium text-teal-600">{doctor.specialization}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${doctor.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                            {doctor.status || 'Active'}
                        </span>
                        {role == "admin" && <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            title="Delete Doctor"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                            <Trash2 size={15} />
                        </button>}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-medium">
                        ⭐ {doctor.experience} yrs exp
                    </span>
                    <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-medium text-slate-900">
                        ₹{doctor.consultationFee} fee
                    </span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50/70 p-2.5 rounded-xl mb-3 border border-slate-100/60">
                    📅 <span className="font-medium text-slate-700">{doctor.availableDays?.join(", ") || "Mon - Fri"}</span>
                    <span className="mx-1">•</span>
                    <span>{doctor.availableHours}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
                    <button onClick={handleBookSlot} disabled={doctor.status === 'inactive'} className={`flex-1 text-xs font-semibold py-2 px-3 rounded-xl transition ${doctor.status === 'inactive'
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                        }`}>Book Slot</button>
                    {role == "admin" && <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer" onClick={handleEditProfile}>Edit Profile</button>}
                </div>

            </div>
            {editDoctor && <AddDoctorModal doctor={editDoctor} onClose={() => { setEditDoctor(null); getDoctorList(); }} />}
            {isAppointmentModal && <AddAppointmentModal doctor={doctor} onClose={() => setIsAppointmentModal(false)} />}
            {isDeleteModalOpen && (
                <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Doctor Profile"
                    itemName={`${doctor.name} (${doctor.specialization})`}
                    message={`Are you sure you want to permanently delete Dr. ${doctor.name}? This will remove them from scheduling and available slots.`}
                    isLoading={isDeleting}
                    onConfirm={handleDeleteDoctor}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    )
}

export default DoctorCard;