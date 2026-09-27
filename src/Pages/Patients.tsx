import { useEffect, useState } from "react"
import api from "../services/api"
import AddPatientModal from "../Components/AddPatientModal"
import toast from "react-hot-toast"
import type { Patient } from "../types/PatientTypes"
function Patients() {
    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")
    const [gender, setGender] = useState<string>("all")
    const [bloodGroup, setBloodGroup] = useState<string>("all")
    const [status, setStatus] = useState<string>("all")
    const [patientList, setPatientList] = useState<any[]>([])
    const [editPatient, setEditPatient] = useState<Patient | null>(null);
    const today = new Date();
    async function getPatientList() {
        try {
            const response = await api.get('/patients', {
                params: { search, gender, bloodGroup, status }
            })
            if (response.data.success) {
                const data = response.data.patients;
                setPatientList(data);
                console.log(data)
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch patients")
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
                    <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl  text-white font-bold py-2 px-4 rounded" onClick={() => setShowAddModal(true)}>Add Patient</button>
                    {showAddModal && <AddPatientModal patient={null} onClose={() => { setShowAddModal(false); getPatientList(); }} />}
                </div>
            </div>
            <div className="w-full mx-auto flex gap-4 border border-gray-200 rounded-xl px-6 mb-4">
                <div className="flex-1 px-2 py-1.5">
                    <input type="text" placeholder='search' className="w-48 border border-gray-300 rounded-xl  p-2" onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-48 border border-gray-300 rounded-xl m-2 flex-1 px-2 py-1.5">
                    <label htmlFor="gender">Gender:</label>
                    <select name="gender" id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="all">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="w-48 border border-gray-300 rounded-xl m-2 flex-1 px-2 py-1.5">
                    <select name="bloodGroup" id="bloodGroup" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
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
                </div>
                <div className="flex flex-wrap gap-2 border border-gray-300 rounded-xl m-2">
                    <button className="w-24 text-sm px-1 py-1.5 border border-gray-300 rounded-xl m-1 hover:bg-emerald-300" onClick={() => setStatus("all")}>All Status</button>
                    <button className="w-24 text-sm px-2 py-1.5 border border-gray-300 rounded-xl m-1 hover:bg-emerald-300" onClick={() => setStatus("active")}>Active</button>
                    <button className="w-24 text-sm px-2 py-1.5 border border-gray-300 rounded-xl m-1 hover:bg-emerald-300" onClick={() => setStatus("inactive")}>Inactive</button>
                </div>

            </div>
            <div>
                <table className="border w-full border-gray-300 rounded-3xl">
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
                        {
                            patientList && patientList.length > 0 ? (patientList.map((patient) => {
                                const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
                                let age = dob ? today.getFullYear() - dob.getFullYear() : "";
                                return (
                                    <tr key={patient.patientId} className="border-b border-gray-300">
                                        <td className="text-center">{patient.patientId}</td>
                                        <td className="text-center">{patient.firstName}</td>
                                        <td className="text-center">{age}/{patient.gender}</td>
                                        <td className="text-center">{patient.phone}</td>
                                        <td className="text-center">{patient.bloodGroup}</td>
                                        <td className="text-center" className={patient.status == "active" ? "bg-green-300 text-white text-center rounded-xl" : "bg-red-300 text-white text-center rounded-xl"}>{patient.status}</td>
                                        <td>
                                            <div className="flex gap-2 justify-center items-center">
                                                <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300">View History</button>
                                                <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300" onClick={() => setEditPatient(patient)}>Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">No patients found</td>
                                </tr>
                            )
                        }
                    </thead>
                </table>
                {editPatient && <AddPatientModal onClose={() => { setEditPatient(null); getPatientList() }} patient={editPatient} />}

            </div>
            <div className="flex justify-between items-center mx-auto">
                <div className="">Showing {patientList.length} of {patientList.length} patients</div>
                <div className="flex gap-2 items-end px-2 py-1.5 justify-end">
                    <button className="border border-gray-300 rounded-xl m-2 px-2 py-1.5">Previous</button>
                    <button className="border border-gray-300 rounded-xl m-2 px-2 py-1.5">Next</button>
                </div>
            </div>
        </div>
    )
}
export default Patients;