import { useEffect, useState } from "react"
import api from "../services/api"
import AddPatientModal from "../Components/AddPatientModal"
import AddViewHistoryModal from "../Components/AddViewHistoryModal"
import DeleteConfirmModal from "../Components/DeleteConfirmModal"
import toast from "react-hot-toast"
import { Trash2, Search, ChevronDown } from "lucide-react"
import type { Patient } from "../types/PatientTypes"

function Patients() {
    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("all")
    const [gender, setGender] = useState<string>("all")
    const [bloodGroup, setBloodGroup] = useState<string>("all")
    const [status, setStatus] = useState<string>("all")
    const [patientList, setPatientList] = useState<any[]>([])
    const [editPatient, setEditPatient] = useState<Patient | null>(null);
    const [isViewHistoryOpen, setIsViewHistoryOpen] = useState<boolean>(false)
    const [patientId, setPatientId] = useState<string>("")
    const [deletePatientTarget, setDeletePatientTarget] = useState<Patient | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const today = new Date();

    function viewHistory(id: string) {
        setIsViewHistoryOpen(true);
        setPatientId(id);
    }

    async function getPatientList() {
        try {
            const response = await api.get('/patients', {
                params: { search: search === "all" ? "" : search, gender, bloodGroup, status }
            })
            if (response.data.success) {
                const data = response.data.patients;
                setPatientList(data);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch patients")
        }
    }

    async function handleDeletePatient() {
        if (!deletePatientTarget) return;
        setIsDeleting(true);
        try {
            const targetId = deletePatientTarget.patientId || deletePatientTarget._id || deletePatientTarget.id;
            const response = await api.delete(`/patients/${targetId}`);
            if (response.data.success) {
                toast.success("Patient deleted successfully");
                setDeletePatientTarget(null);
                getPatientList();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete patient");
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        getPatientList();
    }, [search, gender, bloodGroup, status])

    return (
        <div className="w-full h-full mx-auto bg-gray-200 border-b border-gray-300">
            <div className="w-full mx-auto py-8 px-6 flex justify-between items-center ">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">Patients Dictionary</h2>
                    <p>Manage clinic patients records and medical histories</p>
                </div>
                <div className="space-y-1 flex items-end">
                    <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl text-white font-bold py-2 px-4 cursor-pointer transition shadow-xs" onClick={() => setShowAddModal(true)}>Add Patient</button>
                    {showAddModal && <AddPatientModal patient={null} onClose={() => { setShowAddModal(false); getPatientList(); }} />}
                </div>
            </div>
            {/* Filter Section */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search === "all" ? "" : search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[130px]">
                        <label htmlFor="gender" className="absolute -top-2 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500 z-10">
                            Gender
                        </label>
                        <select
                            name="gender"
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full py-2 pl-3 pr-8 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer appearance-none"
                        >
                            <option value="all">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative min-w-[150px]">
                        <label htmlFor="bloodGroup" className="absolute -top-2 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500 z-10">
                            Blood Group
                        </label>
                        <select
                            name="bloodGroup"
                            id="bloodGroup"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full py-2 pl-3 pr-8 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer appearance-none"
                        >
                            <option value="all">All Blood Groups</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                    <button
                        type="button"
                        onClick={() => setStatus("all")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            status === "all"
                                ? "bg-teal-100/90 text-teal-800 border border-teal-200/80 shadow-xs"
                                : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus("active")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            status === "active"
                                ? "bg-teal-100/90 text-teal-800 border border-teal-200/80 shadow-xs"
                                : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus("inactive")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            status === "inactive"
                                ? "bg-teal-100/90 text-teal-800 border border-teal-200/80 shadow-xs"
                                : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        Inactive
                    </button>
                </div>
            </div>
            <div>
                <table className="border w-full border-gray-300 rounded-3xl bg-white shadow-xs">
                    <thead>
                        <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                            <th>Patient ID</th>
                            <th>Patient name</th>
                            <th>Age/Gender</th>
                            <th>Phone Number</th>
                            <th>Blood Group</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            patientList && patientList.length > 0 ? (patientList.map((patient) => {
                                const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
                                let age = dob ? today.getFullYear() - dob.getFullYear() : "";
                                return (
                                    <tr key={patient.patientId || patient._id} className="border-b border-gray-200 hover:bg-slate-50 transition">
                                        <td className="text-center font-medium text-slate-700 py-3">{patient.patientId}</td>
                                        <td className="text-center font-semibold text-slate-900">{patient.firstName} {patient.lastName}</td>
                                        <td className="text-center text-slate-600">{age ? `${age} yrs` : "-"}/{patient.gender}</td>
                                        <td className="text-center text-slate-600">{patient.phone}</td>
                                        <td className="text-center font-semibold text-teal-700">{patient.bloodGroup || "-"}</td>
                                        <td className="text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${patient.status === "active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-center items-center py-2">
                                                <button className="border border-gray-300 rounded-xl px-2.5 py-1 text-xs font-medium hover:bg-gray-100 cursor-pointer transition" onClick={() => viewHistory(patient.patientId)}>View History</button>
                                                <button className="border border-gray-300 rounded-xl px-2.5 py-1 text-xs font-medium hover:bg-gray-100 cursor-pointer transition" onClick={() => setEditPatient(patient)}>Edit</button>
                                                <button className="border border-rose-200 text-rose-600 rounded-xl p-1.5 hover:bg-rose-50 cursor-pointer transition" title="Delete Patient" onClick={() => setDeletePatientTarget(patient)}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500">No patients found</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                {editPatient && <AddPatientModal onClose={() => { setEditPatient(null); getPatientList() }} patient={editPatient} />}
                {isViewHistoryOpen && <AddViewHistoryModal onClose={() => setIsViewHistoryOpen(false)} patientId={patientId} />}
                {deletePatientTarget && (
                    <DeleteConfirmModal
                        isOpen={!!deletePatientTarget}
                        title="Delete Patient Record"
                        itemName={`${deletePatientTarget.firstName} ${deletePatientTarget.lastName} (${deletePatientTarget.patientId})`}
                        message={`Are you sure you want to permanently delete this patient record? All linked appointments and medical history references will be affected.`}
                        isLoading={isDeleting}
                        onConfirm={handleDeletePatient}
                        onClose={() => setDeletePatientTarget(null)}
                    />
                )}
            </div>
            <div className="flex justify-between items-center mx-auto p-4">
                <div className="text-sm text-slate-600">Showing {patientList.length} of {patientList.length} patients</div>
                <div className="flex gap-2 items-end px-2 py-1.5 justify-end">
                    <button className="border border-gray-300 rounded-xl m-2 px-3 py-1.5 bg-white hover:bg-gray-100 cursor-pointer text-sm">Previous</button>
                    <button className="border border-gray-300 rounded-xl m-2 px-3 py-1.5 bg-white hover:bg-gray-100 cursor-pointer text-sm">Next</button>
                </div>
            </div>
        </div>
    )
}
export default Patients;