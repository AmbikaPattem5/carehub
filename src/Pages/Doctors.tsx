import { useState, useEffect } from "react"
import AddDoctorModal from "../Components/AddDoctorModal"
import type { Doctor } from '../types/DoctorTypes'
import { Specialization } from "../types/DoctorTypes"
import DoctorCard from "../Components/DoctorCard"
import api from "../services/api"
import toast from "react-hot-toast"
import { Search, Plus, User, Loader2 } from "lucide-react"
import useAuth from "../CustomHooks/useAuth"

function Doctors() {
    const [isDoctorModal, setIsDoctorModal] = useState<boolean>(false)
    const [search, setSearch] = useState<string>("")
    const [specialization, setSpecialization] = useState<string>("all")
    const [status, setStatus] = useState<string>("all")
    const [doctorList, setDoctorList] = useState<Doctor[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const { role } = useAuth()

    function addDoctor() {
        setIsDoctorModal(true)
    }

    async function getDoctorList() {
        setLoading(true);
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
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to fetch doctors")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getDoctorList()
    }, [search, specialization, status])

    const departmentsCount = new Set(doctorList.map((d) => d.specialization).filter(Boolean)).size

    return (
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Doctors Directory</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage clinic doctors, specializations, and consultation fees</p>

                    {/* Stat Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-3">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                            Total Doctors: <strong className="ml-1 text-slate-900 font-bold">{doctorList.length}</strong>
                        </span>
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                            Active On Duty: <strong className="ml-1 text-emerald-700 font-bold">{doctorList.filter((d) => d.status === "active").length}</strong>
                        </span>
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                            Departments: <strong className="ml-1 text-slate-900 font-bold">{departmentsCount || 5}</strong>
                        </span>
                    </div>
                </div>
                {role == "admin" &&
                    <button
                        type="button"
                        onClick={addDoctor}
                        className="self-start sm:self-auto bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                        <Plus size={16} /> Add Doctor
                    </button>}
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-xs">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-xs"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Specialization Filter */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="specialization" className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                            Specialization
                        </label>
                        <select
                            id="specialization"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-xs cursor-pointer min-w-[170px]"
                        >
                            <option value="all">All Specialties</option>
                            {Object.entries(Specialization).map(([key, value]) => (
                                <option key={key} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="status" className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-xs cursor-pointer min-w-[120px]"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">On Leave</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Doctors Grid */}
            <div>
                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        <span className="text-xs font-semibold text-slate-500">Loading doctors directory...</span>
                    </div>
                ) : doctorList && doctorList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {doctorList.map((doctor) => (
                            <DoctorCard
                                key={doctor.doctorId || doctor._id}
                                doctor={doctor}
                                getDoctorList={getDoctorList}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                            <User size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">No Doctors Found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No doctor profiles match the current filter or search criteria. Try resetting filters or adding a new doctor.
                        </p>
                    </div>
                )}
            </div>

            {isDoctorModal && (
                <AddDoctorModal
                    onClose={() => { setIsDoctorModal(false); getDoctorList(); }}
                    doctor={null}
                />
            )}
        </div>
    )
}

export default Doctors