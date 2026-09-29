import { useState, useEffect } from "react"
import AddDoctorModal from "../Components/AddDoctorModal"
import type { Doctor } from '../types/DoctorTypes'
import {
    Specialization
} from "../types/DoctorTypes"
import DoctorCard from "../Components/DoctorCard"
import api from "../services/api"
import toast from "react-hot-toast"
function Doctors() {
    const [isDoctorModal, setIsDoctorModal] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("");
    const [specialization, setSpecialization] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [doctorList, setDoctorList] = useState<Doctor[]>([])
    const enum Status {
        all = "all",
        active = "active",
        onLeave = "onLeave"
    }
    // const enum Specialization {
    //     all = "all",
    //     Cardiologist = "Cardiologist",
    //     Dermatologist = "Dermatologist",
    //     Gynecologist = "Gynecologist",
    //     Pediatrician = "Pediatrician",
    //     GeneralPhysician = "General Physician",
    //     Orthopedic = "Orthopedic",
    //     Ophthalmologist = "Ophthalmologist",
    //     Neurologist = "Neurologist",
    //     Psychiatrist = "Psychiatrist",
    // }
    function addDoctor() {
        setIsDoctorModal(true)
    }

    async function getDoctorList() {
        try {
            const response = await api.get('/doctors', {
                params: {
                    search,
                    specialization,
                    status
                }
            })
            if (response.data.success) {
                setDoctorList(response.data.doctors)
                console.log("doctors data", response.data.doctors)
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch doctors")
        }
    }
    useEffect(() => {
        getDoctorList()
    }, [search, specialization, status])
    return (

        <div className="w-full h-full mx-auto bg-gray-200 border-b border-gray-300">
            <div className="w-full mx-auto py-8 px-6 flex justify-between items-center ">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">Doctors Dictionary</h2>
                    <p>Manage clinic doctors,Specializations and Consultation fees</p>
                </div>
                <div className="space-y-1 flex items-end">
                    <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl  text-white font-bold py-2 px-4 rounded" onClick={addDoctor}>Add Doctor</button>
                    {isDoctorModal && <AddDoctorModal doctor={null} onClose={() => { setIsDoctorModal(false) }} />}
                </div>
            </div>
            <div className="">
                <div className="flex gap-4 border border-gray-200 rounded-xl px-6 mb-4">
                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300">Total Doctors:{doctorList.length}</button>
                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300">Active on Duty:{doctorList.filter((doctor) => doctor.status === "active").length}</button>
                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300">Departments:{doctorList.filter((doctor) => doctor.specialization).length}</button>
                </div>
            </div>
            <div className="w-full mx-auto flex gap-4 border border-gray-200 rounded-xl px-6 mb-4">
                <div className="flex-1 px-2 py-1.5">
                    <input type="text" placeholder='search' className="w-48 border border-gray-300 rounded-xl  p-2" onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-48 border border-gray-300 rounded-xl m-2 flex-1 px-2 py-1.5">
                    <label htmlFor="specialization">Specialization:</label>
                    <select name="specialization" id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                        <option value="all">All Specializations</option>
                        {Object.entries(Specialization).map(([key, value]) => (<option key={key} value={key}>{key}</option>))}
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 border border-gray-300 rounded-xl m-2">
                    <label>Status</label>
                    <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                </div>

            </div>
            <div>
                <div className="">
                    <div className="grid grid-cols-3 gap-4">{
                        doctorList && doctorList.length > 0 && doctorList.map((doctor) => <DoctorCard key={doctor.doctorId} doctor={doctor} getDoctorList={getDoctorList} />)
                    }
                    </div>
                </div>
                {isDoctorModal && <AddDoctorModal onClose={() => { setIsDoctorModal(false); getDoctorList() }} doctor={null} />}

            </div>

        </div>

    )
}
export default Doctors