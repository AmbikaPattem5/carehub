import { AvailableDays, AvailableHours, type CreateDoctorRequest, type Doctor, Status, Specialization, type doctorFormErrors } from "../types/DoctorTypes"
import { useState } from "react"
import { X, Stethoscope } from "lucide-react"
import api from '../services/api'
import toast from "react-hot-toast"
function AddDoctorModal({ onClose, doctor }: { onClose: () => void, doctor?: Doctor | null }) {
    const formInitialValues: CreateDoctorRequest = {
        name: doctor?.name ?? "",
        email: doctor?.email ?? "",
        phone: doctor?.phone ?? "",
        specialization: doctor?.specialization ?? "",
        experience: doctor?.experience || null,
        consultationFee: doctor?.consultationFee || null,
        availableDays: doctor?.availableDays ?? [],
        availableHours: doctor?.availableHours ?? "",
        status: (doctor?.status as any) || Status.active
    }
    const isEdit = doctor?._id ? true : false
    const errorInitialValues: doctorFormErrors = {
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        consultationFee: "",
        availableDays: "",
        availableHours: "",
        status: "",
    }
    const [formData, setFormData] = useState<CreateDoctorRequest>(formInitialValues)
    const [errors, setErrors] = useState<doctorFormErrors>(errorInitialValues);
    //const [editDoctor, setEditDoctor] = useState<boolean>(isEdit);
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = e.target as HTMLInputElement;
        const { name, value, checked, type } = target;
        if (type === "checkbox") {
            if (checked) {
                setFormData((prev) => {
                    return {
                        ...prev,
                        availableDays: [...prev.availableDays, value]
                    }
                })
            } else {
                setFormData((prev) => {
                    return {
                        ...prev,
                        availableDays: prev.availableDays.filter((day) => day !== value)
                    }
                })
            }
        }
        else {
            setFormData((prev) => {
                return {
                    ...prev,
                    [name]: name === "experience" || name === "consultationFee" ? Number(value) : value
                }
            })
        }

    }
    function validateForm() {
        const errors: doctorFormErrors = { ...errorInitialValues };

        if (formData.name.trim() === '') {
            errors.name = "Name is required"
        }

        if (formData.phone.trim() === '') {
            errors.phone = "Phone is required"
        }
        if (!(/^[0-9]*$/.test(formData.phone) && formData.phone.length <= 10)) {
            errors.phone = "Phone is invalid"
        }
        if (formData.email.trim() === '') {
            errors.email = "Email is required"
        }
        if (formData.specialization.trim() === '') {
            errors.specialization = "Specialization is required"
        }
        if (formData.experience === 0 || Number(formData.experience) < 0) {
            errors.experience = "Experience is required"
        }
        if (formData.consultationFee === 0 || Number(formData.consultationFee) < 0) {
            errors.consultationFee = "Consultation Fee is required"
        }
        if (formData.availableDays.length === 0) {
            errors.availableDays = "Available Days is required"
        }
        if (formData.availableHours.trim() === '') {
            errors.availableHours = "Available Hours is required"
        }
        return errors;
    }
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const errors = validateForm();
        setErrors(errors);
        if (Object.values(errors).some((error) => error !== "")) {
            return;
        }
        if (isEdit && doctor?._id) {
            try {
                const response = await api.patch(`/doctors/${doctor._id}`, formData)
                if (response && response.data.success) {
                    console.log('updated data', response.data);
                    toast.success("Doctor updated successfully");
                    onClose();

                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to update doctor")
            }
        }
        else {
            try {
                const response = await api.post('/doctors', formData);
                if (response && response.data.success) {
                    const data = response.data.doctor;
                    console.log('Doctor created:', response.data);
                    toast.success("Doctor created successfully");
                    onClose();
                }

            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to create doctor");
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
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            {isEdit ? <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Update Doctor Details</h4> :
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Register New Doctor</h2>
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
                <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                        {/* Section 1: Demographics */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5">
                                <span className="w-1.5 h-3.5 rounded-full bg-teal-600"></span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Personal Demographics</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Full Name <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Siddharth"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.name ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.name}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Specialization<span className="text-rose-500 font-bold">*</span></label>
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none cursor-pointer ${errors.specialization ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    >
                                        <option value="">Select Specialization</option>
                                        {Object.entries(Specialization).map(([key, value]) => {
                                            return (
                                                <option key={value} value={value}>{value}</option>
                                            )
                                        })}
                                    </select>
                                    {errors.specialization && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.specialization}
                                        </span>
                                    )}

                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Experience <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="number"
                                        name="experience"
                                        placeholder="e.g. 5"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" ${errors.experience ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.experience && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.experience}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Consultation Fee <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"${errors.consultationFee ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.consultationFee && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.consultationFee}
                                        </span>
                                    )}
                                </div>


                            </div>
                        </div>

                        {/* Section 2: Contact & Clinical Details */}
                        <div>
                            <div className="flex items-center gap-2 mb-3.5">
                                <span className="w-1.5 h-3.5 rounded-full bg-teal-600"></span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Contact & Clinical Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Email Address <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        disabled={isEdit}
                                        placeholder="siddharth@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.email ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Phone Number <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+91 98450 12345"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.phone ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.phone && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.phone}
                                        </span>
                                    )}
                                </div>


                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700">Available Days<span className="text-rose-500 font-bold">*</span></label>
                                    <div className="flex flex-wrap gap-4 text-xs border border-slate-200 p-2 rounded-xl px-3.5 py-2.5 ">
                                        {Object.entries(AvailableDays).map(([key, value]) => {
                                            return (
                                                <label key={value}>
                                                    <input type="checkbox" name="availableDays" value={value} checked={formData.availableDays.includes(value)} onChange={handleChange} disabled={isEdit} className="text-xs cursor-pointer mr-2 " />
                                                    {value}
                                                </label>
                                            )
                                        })}
                                    </div>
                                    {errors.availableDays && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            {errors.availableDays}
                                        </span>
                                    )}

                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700">Shift Time Slots<span className="text-rose-500 font-bold">*</span></label>
                                    <select
                                        name="availableHours"
                                        value={formData.availableHours}
                                        onChange={handleChange}
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none cursor-pointer ${errors.availableHours ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    >
                                        <option value="">Select Shift Time Slots</option>
                                        {Object.entries(AvailableHours).map(([key, value]) => {
                                            return (
                                                <option key={value} value={value}>{value}</option>
                                            )
                                        })}
                                    </select>
                                    {errors.availableHours && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.availableHours}
                                        </span>
                                    )}

                                </div>
                                {isEdit &&
                                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded-xl m-2">
                                        <label>Status</label>
                                        <select name="status" id="status" value={formData.status} onChange={handleChange}>
                                            {Object.entries(Status).map(([key, value]) => {
                                                return (
                                                    <option key={value} value={value}>{value}</option>
                                                )
                                            })}
                                        </select>

                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end items-center gap-3 px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer"
                        >
                            {isEdit ? "Update" : "Add Doctor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default AddDoctorModal