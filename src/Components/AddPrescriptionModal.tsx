import { X, ChevronDown, Check, Plus, Trash2, Calendar, FileText, Loader2 } from "lucide-react"
import api from "../services/api"
import type { Patient } from "../types/PatientTypes"
import { useState, useEffect, useRef } from "react"
import type { PrescriptionNotes, Medicines } from "../types/PrescriptionTypes"
import toast from "react-hot-toast"
import useAuth from "../CustomHooks/useAuth"
function AddPrescriptionModal({ onClose, appointmentId, patientId }: { onClose: (isPrint: boolean, presId?: string) => void, appointmentId: string, patientId: string }) {
    const SYMPTOM_OPTIONS = [
        "Fever",
        "Sore Throat",
        "Headache",
        "Cough",
        "Fatigue",
        "Body Ache",
        "Cold / Runny Nose",
        "Nausea",
        "Dizziness",
        "Shortness of Breath"
    ];
    const initialFormData = {
        appointmentId: appointmentId,
        patientId: patientId,
        symptoms: [],
        diagnosis: "",
        doctorNotes: ""

    }

    const initialMedicineData: Medicines = {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""

    }

    console.log("appointmentId", appointmentId)
    const [patientData, setPatientData] = useState<Patient | null>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState<PrescriptionNotes>(initialFormData)
    const [medicineData, setMedicineData] = useState<Medicines[]>([])
    // const [prescriptionData, setPrescriptionData] = useState<PrescriptionMedicines>(initialPrescriptionData)
    const [medicineItem, setMedicineItem] = useState<Medicines>(initialMedicineData)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    // const [consId, setConsId] = useState<string>("")

    const { role } = useAuth()

    const dropdownRef = useRef<HTMLDivElement>(null);
    function handleMedicineItem(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setMedicineItem({ ...medicineItem, [name]: value })

    }
    function handleAdd() {
        if (!medicineItem.name.trim()) {
            toast.error("values are required");
            return;
        }

        const newItem = {
            name: medicineItem.name,
            dosage: medicineItem.dosage,
            frequency: medicineItem.frequency,
            duration: medicineItem.duration,
            instructions: medicineItem.instructions
        }
        setMedicineData([...medicineData, newItem])
        setMedicineItem(initialMedicineData)
    }
    function handleDelete(id: number) {
        const updatedFilterList = medicineData.filter((item, index) => index != id);
        setMedicineData(updatedFilterList);
    }
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleToggleSymptom = (symptom: string) => {
        const updated = selectedSymptoms.includes(symptom)
            ? selectedSymptoms.filter(s => s !== symptom)
            : [...selectedSymptoms, symptom];
        setSelectedSymptoms(updated);
        setFormData(prev => ({ ...prev, symptoms: updated }));
    };

    const handleRemoveSymptom = (symptom: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = selectedSymptoms.filter(s => s !== symptom);
        setSelectedSymptoms(updated);
        setFormData(prev => ({ ...prev, symptoms: updated }));
    };

    // Clear all selected tags
    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedSymptoms([]);
        setFormData(prev => ({ ...prev, symptoms: [] }));
    };
    useEffect(() => {
        async function getPatientData() {
            try {
                const response = await api.get(`/patients/${patientId}`);
                if (response && response.data && response.data.success) {
                    console.log(response.data.patient)
                    setPatientData(response.data.patient)
                }
            }
            catch (err) {
                console.log(err)
            }
        }
        getPatientData();
    }, [])

    const birthDate = patientData?.dateOfBirth ? new Date(patientData.dateOfBirth) : new Date();
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }
    async function handleSubmit() {
        let consId: string = "";
        const symptomsToSend = formData.symptoms.length > 0 ? formData.symptoms : selectedSymptoms;
        if (symptomsToSend.length === 0 || !formData.diagnosis?.trim() || !formData.doctorNotes?.trim()) {
            toast.error("Fill the required fields");
            return;
        }
        setIsSubmitting(true);
        try {
            try {
                const response = await api.post("/consultations", { ...formData, symptoms: symptomsToSend });
                if (response && response.data && response.data.success) {
                    consId = response.data.consultation.consultationId;
                    console.log("consultation Id ===", consId)
                }
                console.log(response.data?.consultation?.consultationId)
            }
            catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to save consultation")
            }
            const prescriptionNotes: any = {
                consultationId: consId,
                patientId: patientId,
                medicines: medicineData,
            }
            if (consId === "" && medicineData.length === 0) {
                return;
            }
            else if (medicineData.length === 0) {
                return;
            }
            else {
                let prescriptionId = null;
                try {
                    const response = await api.post("/prescriptions", prescriptionNotes);
                    if (response && response.data && response.data.success) {
                        prescriptionId = response.data.prescriptionId
                    }
                    console.log(response.data)
                }
                catch (err: any) {
                    toast.error(err?.response?.data?.message || "Failed to save prescription")
                }
                onClose(true, prescriptionId || "")
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const [followUpDate, setFollowUpDate] = useState<string>("");
    const [showAddForm, setShowAddForm] = useState<boolean>(true);

    function handleSaveDraft() {
        toast.success("Prescription draft saved successfully");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-[#183642] text-white">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight">
                        Write Prescription & Consultation Notes
                    </h3>
                    <button
                        type="button"
                        onClick={() => onClose(false, "")}
                        className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Patient Information Banner */}
                <div className="bg-[#e8f5f3] border-b border-[#cceae5] px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-medium text-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span>
                        <strong className="font-bold text-slate-900">{patientData ? `${patientData.firstName} ${patientData.lastName}` : "Aarav Sharma"}</strong> • <span className="text-slate-700 font-semibold">{patientData?.patientId || "PAT-1001"}</span> • Age: {age || 28} / {patientData?.gender || "Male"} • Blood Group: <span className="font-semibold text-slate-900">{patientData?.bloodGroup || "O+"}</span>
                    </span>
                </div>

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {/* Section 1: Clinical Diagnosis & Symptoms */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                            1. Clinical Diagnosis & Symptoms
                        </h4>

                        {/* Symptoms Multi-select Box */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Symptoms</label>
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="min-h-[44px] w-full p-2 border border-slate-200 rounded-xl bg-white flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition shadow-xs"
                                >
                                    <div className="flex flex-wrap gap-1.5 flex-1 items-center">
                                        {selectedSymptoms.length > 0 ? (
                                            selectedSymptoms.map((symptom) => (
                                                <span
                                                    key={symptom}
                                                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1 rounded-full border border-slate-200/80"
                                                >
                                                    {symptom}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRemoveSymptom(symptom, e)}
                                                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full p-0.5 cursor-pointer ml-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-xs sm:text-sm px-1">Select symptoms from list...</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-slate-400 pr-1 shrink-0">
                                        {selectedSymptoms.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleClearAll}
                                                className="hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                                                title="Clear all"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 divide-y divide-slate-50">
                                        {SYMPTOM_OPTIONS.map((option) => {
                                            const isSelected = selectedSymptoms.includes(option);
                                            return (
                                                <div
                                                    key={option}
                                                    onClick={() => handleToggleSymptom(option)}
                                                    className={`px-3 py-2 text-xs sm:text-sm flex items-center justify-between cursor-pointer hover:bg-teal-50 transition ${isSelected ? "bg-teal-50/80 text-teal-800 font-semibold" : "text-slate-700"
                                                        }`}
                                                >
                                                    <span>{option}</span>
                                                    {isSelected && <Check size={16} className="text-teal-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Clinical Diagnosis Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Clinical Diagnosis</label>
                            <input
                                type="text"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                placeholder="Acute Upper Respiratory Tract Infection"
                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-xs"
                            />
                        </div>

                        {/* Doctor Notes Textarea */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Clinical Doctor Notes</label>
                            <textarea
                                name="doctorNotes"
                                value={formData.doctorNotes}
                                onChange={handleChange}
                                placeholder="Patient advised warm fluids and voice rest for 3 days"
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Section 2: Prescribed Medications (Rx) */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                            2. Prescribed Medications (Rx)
                        </h4>

                        {/* Prescribed Items Table */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                        <th className="py-2.5 px-4">Medicine Name & Strength</th>
                                        <th className="py-2.5 px-3">Dosage</th>
                                        <th className="py-2.5 px-3">Frequency</th>
                                        <th className="py-2.5 px-3">Duration</th>
                                        <th className="py-2.5 px-3">Instructions</th>
                                        <th className="py-2.5 px-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {medicineData.length > 0 ? (
                                        medicineData.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/80 transition">
                                                <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item.dosage || "-"}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item.frequency || "-"}</td>
                                                <td className="py-2.5 px-3 text-slate-700">{item.duration || "-"}</td>
                                                <td className="py-2.5 px-3 text-slate-600">{item.instructions || "-"}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(index)}
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                                        title="Remove Medicine"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                                                No medications added yet. Use the inputs below to add prescribed drugs.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Medication Card / Row */}
                        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={14} /> Add Medication
                                </button>
                            </div>

                            {showAddForm && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                                        <div className="md:col-span-1">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Name & Strength (e.g. Paracetamol 650mg)"
                                                value={medicineItem.name}
                                                onChange={handleMedicineItem}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="dosage"
                                                placeholder="Dosage (e.g. 1 Tablet)"
                                                value={medicineItem.dosage ?? ""}
                                                onChange={handleMedicineItem}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="frequency"
                                                placeholder="Frequency (e.g. 1-0-1 (After Food))"
                                                value={medicineItem.frequency ?? ""}
                                                onChange={handleMedicineItem}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="duration"
                                                placeholder="Duration (e.g. 5 Days)"
                                                value={medicineItem.duration ?? ""}
                                                onChange={handleMedicineItem}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="instructions"
                                                placeholder="Instructions (e.g. Take after meals)"
                                                value={medicineItem.instructions ?? ""}
                                                onChange={handleMedicineItem}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleAdd}
                                            className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                                        >
                                            <Plus size={14} /> Add Medicine
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-4 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            Follow-up Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-xs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={() => onClose(false, "")}
                            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                        >
                            Cancel
                        </button>
                        {role == "doctor" &&
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                            >
                                Save Draft
                            </button>
                        }
                        {(role == "doctor" || role == "admin") &&
                            (<button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <span className="font-serif italic font-black text-sm">℞</span>
                                )}
                                {isSubmitting ? "Issuing..." : "Issue & Print Prescription"}
                            </button>)}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddPrescriptionModal;