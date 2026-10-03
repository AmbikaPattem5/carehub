import { X, ChevronDown, Check } from "lucide-react"
import api from "../services/api"
import type { Patient } from "../types/PatientTypes"
import { useState, useEffect, useRef } from "react"
import type { PrescriptionNotes, Medicines, PrescriptionMedicines } from "../types/PrescriptionTypes"
import toast from "react-hot-toast"
function AddPrescriptionModal({ onClose, appointmentId, patientId }: { onClose: (isPrint: boolean, presId: string) => void, appointmentId: string, patientId: string }) {
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
    // const [consId, setConsId] = useState<string>("")


    const dropdownRef = useRef<HTMLDivElement>(null);
    function validateSymptomsFormData() {
        if (formData.symptoms.length === 0 || formData.diagnosis === "" || formData.doctorNotes === "") {
            toast.error("Fill the required fields");
            return;
        }
    }
    function handleMedicineItem(e) {
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
    function handleDelete(id) {
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
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
            setFormData({ ...formData, symptoms: selectedSymptoms })

        } else {
            setSelectedSymptoms(prev => [...prev, symptom]);
            setFormData({ ...formData, symptoms: selectedSymptoms })

        }
    };
    const handleRemoveSymptom = (symptom: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
        setFormData({ ...formData, symptoms: selectedSymptoms })

    };
    // 5. Clear all selected tags
    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedSymptoms([]);
        setFormData({ ...formData, symptoms: selectedSymptoms })

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

    const birthDate = new Date(patientData?.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }
    async function handleSubmit() {
        let consId: string = "";
        validateSymptomsFormData()
        try {
            const response = await api.post("/consultations", formData);
            if (response && response.data && response.data.success) {
                consId = response.data.consultation.consultationId;
                console.log("consultation Id ===", consId)

            }
            console.log(response.data.consultation.consultationId)
        }
        catch (err) {
            toast.error(err?.response?.data?.message)
        }
        const prescriptionNotes: PrescriptionMedicines = {
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
            catch (err) {
                toast.error(err?.response?.data?.message)
            }
            onClose(true, prescriptionId)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-visible flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200" >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-blue-50/50">
                    <div className="flex items-center gap-3.5">

                        <div>
                            <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Write Prescription and Consultation notes</h4>

                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onClose(false, undefined)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} className="bg-white" onClick={() => onClose(false, undefined)} />
                    </button>
                </div>
                <div className="flex flex-row bg-blue-100">
                    <p>{patientData?.firstName} {patientData?.lastName} . {patientData?.patientId} . Age : {age}/{patientData?.gender} . {patientData?.bloodGroup}</p>
                </div>
                <div>
                    <form autoComplete="off" className="flex flex-col flex-1 p-6 min-h[450px]">
                        <label>1. Clinical Diagnosis and Symptoms</label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(prev => !prev)}
                                className="min-h-[44px] w-full p-1.5 border border-slate-300 rounded-xl bg-white flex items-center justify-between gap-2 cursor-pointer hover:border-slate-400 focus-within:ring-2 focus-within:ring-teal-500 transition"
                            >
                                {/* Chips Container */}
                                <div className="flex flex-wrap gap-1.5 flex-1 items-center">
                                    {selectedSymptoms.length > 0 ? (
                                        selectedSymptoms.map((symptom) => (
                                            <span
                                                key={symptom}
                                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200"
                                            >
                                                {symptom}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRemoveSymptom(symptom, e)}
                                                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm px-2">Select symptoms...</span>
                                    )}
                                </div>

                                {/* Action icons: Clear all & Chevron */}
                                <div className="flex items-center gap-1 text-slate-400 pr-1">
                                    {selectedSymptoms.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearAll}
                                            className="hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
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

                            {/* Dropdown Menu Options */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
                                    {SYMPTOM_OPTIONS.map((option) => {
                                        const isSelected = selectedSymptoms.includes(option);
                                        return (
                                            <div
                                                key={option}
                                                onClick={() => handleToggleSymptom(option)}
                                                className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-teal-50 transition ${isSelected ? "bg-teal-50/60 text-teal-800 font-medium" : "text-slate-700"
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
                        <div>
                            <label>Clinical Diagnosis</label>
                            <input type="text" onChange={handleChange} name="diagnosis" value={formData.diagnosis} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black" />
                        </div>
                        <div>
                            <label>Clinical Doctor Notes</label>
                            <textarea onChange={handleChange} name="doctorNotes" value={formData.doctorNotes} className="w-full border border-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-300 text-sm text-black">
                            </textarea>
                        </div>
                    </form>
                </div>
                <div>
                    <h2>Prescribed Medications</h2>
                    <table className="border border-gray-300 rounded-2xl">
                        <thead className="border-b border-gray-300">
                            <tr>
                                <th>Medicine Name & Strength</th>
                                <th>Dosage</th>
                                <th>Frequancy</th>
                                <th>Duration</th>
                                <th>Instructions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicineData.map((item, index) => {
                                return (
                                    <tr key={index} className="border-b border-gray-300">
                                        <td >{item.name}</td>
                                        <td>{item.dosage}</td>
                                        <td>{item.frequency}</td>
                                        <td>{item.duration}</td>
                                        <td>{item.instructions}</td>
                                        <td><button type="button" className="bg-gray-200 hover:bg-gray-400 " onClick={() => handleDelete(index)}><X size={20} /></button></td>
                                    </tr>
                                )

                            })}

                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-3 p-4">
                    <div>
                        <label>Medicine Name</label>

                        <input type="text" name="name" value={medicineItem.name} onChange={handleMedicineItem} className="border border-gray-300 rounded-2xl" />

                    </div>
                    <div>
                        <label>Dosage</label>
                        <input type="text" name="dosage" value={medicineItem.dosage ?? ""} onChange={handleMedicineItem} className="border border-gray-300 rounded-2xl " />
                    </div>
                    <div>
                        <label>Frequency</label>
                        <input type="text" name="frequency" value={medicineItem.frequency ?? ""} onChange={handleMedicineItem} className="border border-gray-300 rounded-2xl" />
                    </div>
                    <div>
                        <label>Duration</label>
                        <input type="text" name="duration" value={medicineItem.duration ?? ""} onChange={handleMedicineItem} className="border border-gray-300 rounded-2xl" />
                    </div>
                    <div>
                        <label>Instructions</label>
                        <input type="text" name="instructions" value={medicineItem.instructions ?? ""} onChange={handleMedicineItem} className="border border-gray-300 rounded-2xl" />
                    </div>

                </div>
                <div>
                    <button type="button" onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Add</button>
                </div>
                <div className="flex flex-row justify-between gap-3">
                    <div>Follow Up Date</div>
                    <div className="flex flex-row gap-2">
                        <button type="button" onClick={() => onClose(false, undefined)} className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-400 hover:bg-gray-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2 ">Issue and Print Prescription</button>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default AddPrescriptionModal;