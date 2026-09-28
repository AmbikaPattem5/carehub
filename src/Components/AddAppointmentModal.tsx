import type { Patient } from "../types/PatientTypes";
import type { Doctor } from "../types/DoctorTypes";
import { AvailableHours } from "../types/DoctorTypes";
import { Calendar, X } from "lucide-react";
import { useState, useEffect } from "react"
import type { AppointmentRequest, AppointmentError, AppointmentResponse } from "../types/AppointmentTypes";
import api from "../services/api";
import toast from "react-hot-toast";

function AddAppointmentModal({ onClose, appointment, doctor }: { onClose: () => void, appointment: AppointmentResponse | null, doctor: Doctor | null }) {
    const formInitialValues: AppointmentRequest = {
        patientId: appointment?.patientId,
        doctorId: appointment?.doctorId || doctor?.doctorId || "",
        date: appointment?.date || "",
        time: appointment?.time || "",
        reason: appointment?.reason || ""

    }
    const isEdit = appointment?._id ? true : false
    const errorInitialValues: AppointmentError = {
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        reason: "",
    }
    const [formData, setFormData] = useState<AppointmentRequest>(formInitialValues)
    const [errors, setErrors] = useState<AppointmentError>(errorInitialValues)
    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get('/patients')
                if (response && response.data.success) {
                    setPatients(response.data.patients)
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch patients")
            }
            try {
                const response = await api.get('/doctors')
                if (response && response.data.success) {
                    setDoctors(response.data.doctors)
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch doctors")
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        async function getSlotData() {
            try {
                const response = await api.get('/appointments/available-slots', {
                    params: {
                        doctorId: formData.doctorId,
                        date: formData.date,
                    }
                })
                if (response && response.data.success) {
                    setAvailableSlots(response.data.availableSlots)
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch patients")
            }
        }
        if (formData.date && formData.doctorId) {
            getSlotData()
        }

    }, [formData.date, formData.doctorId])
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>) {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }
    function handleSlotChange(value: string) {
        setFormData({
            ...formData,
            time: value
        })
    }
    function validateForm() {
        const errors = errorInitialValues;
        if (formData.patientId.trim() === "") {
            errors.patientId = "Patient ID is required"
        }
        if (formData.doctorId.trim() === "") {
            errors.doctorId = "Doctor ID is required"
        }
        if (formData.date.trim() === "") {
            errors.date = "Date is required"
        }
        if (formData.time.trim() === "") {
            errors.time = "Time is required"
        }
        if (formData.reason.trim() === "") {
            errors.reason = "Reason is required"
        }
        return errors;
    }

    async function handleSubmit() {
        const errors = validateForm();
        setErrors(errors);
        if (Object.values(errors).some((error) => error !== "")) {
            return;
        }
        if (isEdit) {
            const payLoad = {
                date: formData.date,
                time: formData.time
            }
            try {
                const response = await api.patch(`/appointments/${appointment._id}/reschedule`, payLoad)
                if (response && response.data.success) {
                    console.log('updated data', response.data);
                    toast.success("Appointment updated successfully");
                    onClose();

                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to update appointment")
            }
        }
        else {
            try {
                const response = await api.post('/appointments', formData);
                console.log('Appointment created:', response.data);
                onClose();

            }
            catch (error) {
                console.log(error);
            }
        }
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shadow-xs shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            {isEdit ? <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Update Appointment</h4> :
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Book new Appointment</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Fill in the details to book a new appointment</p>
                                </div>
                            }
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={(e) => e.preventDefault()} autoComplete="off" className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                        {/* Section 1: Demographics */}
                        <div className="flex flex-col">
                            <label>Patient</label>
                            <select name="patientId" value={formData.patientId} onChange={handleChange} disabled={isEdit} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black " >
                                <option value="">Select Patient</option>
                                {Object.keys(patients).length > 0 && patients.map((patient) => (
                                    <option key={patient._id} value={patient.patientId}>{patient.patientId} - {patient.firstName} {patient.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label>Doctor</label>
                            <select name="doctorId" value={formData.doctorId} disabled={isEdit} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black" >
                                <option value="">Select Doctor</option>
                                {Object.keys(doctors).length > 0 && doctors.map((doctor) => (
                                    <option key={doctor._id} value={doctor.doctorId}>{doctor.doctorId} - {doctor.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label>Date</label>
                            <input type="date" name="date" placeholder="Date" value={formData.date} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black" />
                        </div>
                        <div className="flex flex-col">
                            <label>Add Slot</label>
                            <div className="flex flex-row flex-wrap gap-2">

                                {availableSlots.map((availableSlot) => (
                                    <button type="button" value={availableSlot} onClick={() => (handleSlotChange(availableSlot))}
                                        className={`border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-bl" ${formData.time === availableSlot ? 'bg-green-500 text-white' : 'grey'}`}  >{availableSlot}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <label>Reason</label>
                            <input type="text" name="reason" disabled={isEdit} placeholder="Reason" value={formData.reason} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black" />
                        </div>

                    </div>
                    <div className="flex justify-end items-center gap-3 px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center"
                        >{isEdit ? "Update" : "Add"} Appointment</button>
                    </div>
                </form>
            </div >
        </div >
    )
}


export default AddAppointmentModal