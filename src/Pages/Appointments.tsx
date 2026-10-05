import AddAppointmentModal from "../Components/AddAppointmentModal";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import { useState, useEffect } from "react";
import type { AppointmentResponse } from "../types/AppointmentTypes";
import api from "../services/api";
import toast from "react-hot-toast";
import type { Doctor } from "../types/DoctorTypes";
import { Status } from '../types/AppointmentTypes'
import { X, Trash2 } from "lucide-react"

function Appointments() {
    const [isAppointmentModal, setIsAppointmentModal] = useState<boolean>(false)
    const [appointmentList, setAppointmentList] = useState<AppointmentResponse[] | null>(null)
    const [initialAppointmentList, setinitialAppointmentList] = useState<AppointmentResponse[] | null>(null)
    const [rescheduleAppointment, setRescheduleAppointment] = useState<AppointmentResponse | null>(null)
    const [date, setDate] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [checkInStatus, setCheckInStatus] = useState<string | null>(null)
    const [cancelAppointment, setCancelAppointment] = useState<AppointmentResponse | null>(null)
    const [reshedule, setReshedule] = useState<string | null>("reshedule")
    const [deleteAppointmentTarget, setDeleteAppointmentTarget] = useState<AppointmentResponse | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    useEffect(() => {
        getDoctors()
    }, [])

    async function handleCheckIn(id: string) {
        try {
            const response = await api.patch(`/appointments/${id}/check-in`)
            if (response.data.success) {
                toast.success("Appointment checked in successfully")
                getAppointmentList()
                setCheckInStatus(response.data.appointment.status)
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to check in")
        }
    }

    async function getDoctors() {
        try {
            const response = await api.get('/doctors')
            if (response.data.success) {
                setDoctors(response.data.doctors)
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch doctors")
        }
    }

    async function handleCancelAppointment(id: string) {
        try {
            const response = await api.patch(`/appointments/${id}/cancel`)
            if (response.data.success) {
                toast.success("Appointment cancelled successfully");
                setCancelAppointment(response.data.appointment);
                getAppointmentList()
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to cancel appointment")
        }
    }

    async function handleDeleteAppointment() {
        if (!deleteAppointmentTarget) return;
        setIsDeleting(true);
        try {
            const targetId = deleteAppointmentTarget._id || deleteAppointmentTarget.appointmentId;
            const response = await api.delete(`/appointments/${targetId}`);
            if (response.data.success) {
                toast.success("Appointment deleted successfully");
                setDeleteAppointmentTarget(null);
                getAppointmentList();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete appointment");
        } finally {
            setIsDeleting(false);
        }
    }

    async function getAppointmentList() {
        try {
            const response = await api.get('/appointments',
                {
                    params: {
                        status, date
                    }
                }
            )
            if (response && response.data.success) {
                setAppointmentList(response.data.appointments)
                setinitialAppointmentList(response.data.appointments);
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch appointments")
        }
    }

    useEffect(() => {
        getAppointmentList()
    }, [status, date])

    function filterDoctorId(id: string) {
        if (!id || id === "all") {
            setAppointmentList(initialAppointmentList);
            return;
        }
        const updatedAppointmentList = initialAppointmentList?.filter((appointment) => (appointment.doctorId === id)) || [];
        setAppointmentList(updatedAppointmentList)
    }

    return (
        <div className="w-full h-full mx-auto bg-gray-200 border-b border-gray-300">
            <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                <div className="flex flex-row w-full justify-between items-center space-y-1">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold">Appointments</h2>
                        <p>Book, track and manage patient visits and consultation visits</p>
                    </div>
                    <div className="space-y-1 flex items-end">
                        <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl text-white font-bold py-2 px-4 rounded cursor-pointer transition shadow-xs" onClick={() => setIsAppointmentModal(true)}>Add Appointment</button>
                        {isAppointmentModal && <AddAppointmentModal onClose={() => setIsAppointmentModal(false)} appointment={null} />}
                    </div>
                </div>
                <div className="flex flex-row gap-6 border border-gray-300 rounded-xl p-2 bg-white">
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Date: </label>
                        <input type="date" name="date" value={date || ""} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 hover:bg-gray-100 cursor-pointer rounded-xl p-2 m-1 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Doctor: </label>
                        <select onChange={(e) => filterDoctorId(e.target.value)} className="border border-gray-300 rounded-xl hover:bg-gray-100 cursor-pointer p-2 m-1 text-sm">
                            <option value="all">All Doctors</option>
                            {doctors.map((doctor) => {
                                return (
                                    <option key={doctor.doctorId} value={doctor.doctorId}>{doctor.name}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                        {
                            Object.entries(Status).map(([key, value]) => {
                                return (
                                    <button
                                        type="button"
                                        key={key}
                                        value={value}
                                        onClick={() => setStatus(value === "all" ? null : value)}
                                        className={`border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer transition m-1 ${status === value || (value === "all" && !status) ? "bg-emerald-600 text-white" : "hover:bg-gray-100 text-slate-700"}`}
                                    >
                                        {key}
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
                <div>
                    <table className="border w-full border-gray-300 rounded-3xl bg-white shadow-xs">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center text-sm">
                                <th>Time & Token</th>
                                <th>Patient</th>
                                <th>Assigned Doctor</th>
                                <th>Reason for Visit</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                appointmentList && appointmentList.length > 0 ? (appointmentList.map((appointment) => {
                                    return (
                                        <tr key={appointment._id} className="border-b border-gray-200 hover:bg-slate-50 transition">
                                            <td className="text-center font-medium text-slate-700 py-3 text-sm">
                                                <div className="font-semibold text-slate-900">{appointment.time || (appointment as any).timeSlot}</div>
                                                <div className="text-xs text-teal-600 font-medium">{(appointment as any).token || appointment.appointmentId}</div>
                                            </td>
                                            <td className="text-center font-semibold text-slate-900 text-sm">{appointment.patientName}</td>
                                            <td className="text-center text-slate-700 text-sm">{appointment.doctorName}</td>
                                            <td className="text-center text-slate-600 text-sm max-w-xs truncate">{appointment.reason}</td>
                                            <td className="text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                    appointment.status === "confirmed" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                                    appointment.status === "checked-in" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                                    appointment.status === "completed" ? "bg-slate-100 text-slate-800 border border-slate-200" :
                                                    appointment.status === "cancelled" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                                                    "bg-amber-100 text-amber-800 border border-amber-200"
                                                }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1.5 justify-center items-center py-2">
                                                    {appointment.status !== 'checked-in' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                        <button className="border border-teal-200 bg-teal-50 text-teal-700 rounded-xl px-2.5 py-1 text-xs font-medium hover:bg-teal-100 cursor-pointer transition" onClick={() => handleCheckIn(appointment._id)}>Check In</button>
                                                    )}
                                                    <button className="border border-gray-300 rounded-xl px-2 py-1 text-xs font-medium hover:bg-gray-100 cursor-pointer transition" onClick={() => { setRescheduleAppointment(appointment); setReshedule("reschedule") }}>Reschedule</button>
                                                    <button className="border border-gray-300 rounded-xl px-2 py-1 text-xs font-medium hover:bg-gray-100 cursor-pointer transition" onClick={() => { setRescheduleAppointment(appointment); setReshedule("edit") }}>Edit</button>
                                                    {appointment.status !== 'cancelled' && (
                                                        <button className="border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl p-1 cursor-pointer transition" title="Cancel Appointment" onClick={() => handleCancelAppointment(appointment._id)}>
                                                            <X size={15} />
                                                        </button>
                                                    )}
                                                    <button className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl p-1 cursor-pointer transition" title="Delete Appointment" onClick={() => setDeleteAppointmentTarget(appointment)}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500 text-sm">No appointments found</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                    {rescheduleAppointment && (
                        <AddAppointmentModal
                            doctor={null}
                            onClose={() => { setRescheduleAppointment(null); getAppointmentList(); }}
                            appointment={rescheduleAppointment} reschedule={reshedule}
                        />
                    )}

                    {deleteAppointmentTarget && (
                        <DeleteConfirmModal
                            isOpen={!!deleteAppointmentTarget}
                            title="Delete Appointment"
                            itemName={`${deleteAppointmentTarget.patientName} with ${deleteAppointmentTarget.doctorName} (${deleteAppointmentTarget.appointmentId})`}
                            message={`Are you sure you want to permanently delete appointment ${deleteAppointmentTarget.appointmentId}?`}
                            isLoading={isDeleting}
                            onConfirm={handleDeleteAppointment}
                            onClose={() => setDeleteAppointmentTarget(null)}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
export default Appointments;