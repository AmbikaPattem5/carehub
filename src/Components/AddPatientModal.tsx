import type { CreatePatientRequest, Gender, PatientStatus, BloodGroup, PatientFormErrors } from "../types/PatientTypes"
import { useState } from "react"
import { X, UserPlus, Loader2 } from "lucide-react"
import api from '../services/api'
import toast from "react-hot-toast"
function AddPatientModal({ onClose, patient = null }: { onClose: () => void, patient?: CreatePatientRequest | null }) {
    const formInitialValues: CreatePatientRequest = {
        firstName: patient?.firstName ?? "",
        lastName: patient?.lastName ?? "",
        dateOfBirth: patient?.dateOfBirth ?? "",
        gender: patient?.gender ?? "",
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        address: patient?.address ?? "",
        bloodGroup: patient?.bloodGroup ?? "",
        emergencyContact: patient?.emergencyContact ?? "",
        status: patient?.status ?? "active"
    }
    const isEdit = patient?._id ? true : false
    const errorInitialValues: PatientFormErrors = {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        bloodGroup: "",
        emergencyContact: "",
        status: "",
    }
    const [formData, setFormData] = useState<CreatePatientRequest>(formInitialValues)
    const [errors, setErrors] = useState<PatientFormErrors>(errorInitialValues)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    enum Gender {
        Male = "male",
        Female = "female",
        Other = "other"
    }
    enum BloodGroup {
        Apositive = "A+",
        Anegative = "A-",
        Bpositive = "B+",
        Bnegative = "B-",
        ABpositive = "AB+",
        ABnegative = "AB-",
        Opositive = "O+",
        Onegative = "O-",
    }
    enum Status {
        Active = "active",
        Inactive = "inactive"
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }
    function validateForm() {
        const errors = errorInitialValues;
        if (formData.firstName.trim() === '') {
            errors.firstName = "First Name is required"
        }
        if (formData.lastName.trim() === '') {
            errors.lastName = "Last Name is required"
        }
        if (formData.dateOfBirth === '') {
            errors.dateOfBirth = "Date Of Birth is required"
        }
        if (formData.gender === '') {
            errors.gender = "Gender is required"
        }
        if (formData.phone.trim() === '') {
            errors.phone = "Phone is required"
        }
        else if (!(/^[0-9]*$/.test(formData.phone) && formData.phone.length <= 10)) {
            errors.phone = "Phone is invalid"
        }
        if ((formData.email || '').trim() === '') {
            errors.email = "Email is required"
        }
        if ((formData.address || '').trim() === '') {
            errors.address = "Address is required"
        }
        if (formData.bloodGroup === '') {
            errors.bloodGroup = "Blood Group is required"
        }
        if ((formData.emergencyContact || '').trim() === '') {
            errors.emergencyContact = "Emergency Contact is required"
        }
        else if (!(/^[0-9]*$/.test(formData.phone) && formData.phone.length <= 10)) {
            errors.emergencyContact = "Emergency Contact is Invalid"

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
        if (isEdit) {
            setIsSubmitting(true);
            try {
                if (!patient?._id) return;
                const response = await api.patch(`/patients/${patient._id}`, formData)
                if (response && response.data.success) {
                    console.log('updated data', response.data);
                    toast.success("Patient updated successfully");
                    onClose();
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to update patient")
            } finally {
                setIsSubmitting(false);
            }
        }
        else {
            setIsSubmitting(true);
            try {
                const response = await api.post('/patients', formData);
                if (response && response.data.success) {
                    toast.success("Patient registered successfully");
                    onClose();
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to add patient");
            } finally {
                setIsSubmitting(false);
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
                            <UserPlus size={20} />
                        </div>
                        <div>
                            {isEdit ? <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Update Patient Details</h4> :
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Register New Patient</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Fill in patient demographics and contact information to create a new record</p>
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
                                    <label className="block text-xs font-semibold text-slate-700">First Name <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="e.g. Siddharth"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.firstName ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.firstName && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.firstName}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Last Name <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="e.g. Menon"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.lastName ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.lastName && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.lastName}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Date of Birth <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.dateOfBirth ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.dateOfBirth && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.dateOfBirth}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Gender <span className="text-rose-500 font-bold">*</span></label>
                                    <div className={`flex rounded-xl border p-1 bg-slate-100/70 gap-1 ${errors.gender ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'}`}>
                                        {
                                            Object.entries(Gender).map(([key, value]) => {
                                                const isGenderSelected = formData.gender === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, gender: value })}
                                                        disabled={isEdit}
                                                        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer capitalize ${isGenderSelected ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`}
                                                    >
                                                        {key}
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                    {errors.gender && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.gender}
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
                                    <label className="block text-xs font-semibold text-slate-700">Phone Number <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+91 98450 12345"
                                        value={formData.phone}
                                        onChange={handleChange}
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
                                    <label className="block text-xs font-semibold text-slate-700">Blood Group <span className="text-rose-500 font-bold">*</span></label>
                                    <select
                                        name="bloodGroup"
                                        disabled={isEdit}
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none cursor-pointer ${errors.bloodGroup ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    >
                                        <option value="">Select Blood Group</option>
                                        {Object.entries(BloodGroup).map(([key, value]) => {
                                            return (
                                                <option key={value} value={value}>{value}</option>
                                            )
                                        })}
                                    </select>
                                    {errors.bloodGroup && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.bloodGroup}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Emergency Contact <span className="text-rose-500 font-bold">*</span></label>
                                    <input
                                        type="tel"
                                        name="emergencyContact"
                                        placeholder="98450 98765 (Sister)"
                                        value={formData.emergencyContact}
                                        onChange={handleChange}
                                        disabled={isEdit}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.emergencyContact ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    />
                                    {errors.emergencyContact && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.emergencyContact}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700">Residential Address <span className="text-rose-500 font-bold">*</span></label>
                                    <textarea
                                        name="address"
                                        placeholder="Flat / House No, Street, Area, City"
                                        value={formData.address}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none ${errors.address ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    ></textarea>
                                    {errors.address && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.address}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700">Status<span className="text-rose-500 font-bold">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={!isEdit}
                                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white transition-all outline-none cursor-pointer ${errors.bloodGroup ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'}`}
                                    >
                                        <option value="">Select Status</option>
                                        {Object.entries(Status).map(([key, value]) => {
                                            return (
                                                <option key={value} value={value}>{value}</option>
                                            )
                                        })}
                                    </select>
                                    {errors.status && (
                                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                            {errors.status}
                                        </span>
                                    )}
                                </div>
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
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update" : "Add Patient")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default AddPatientModal