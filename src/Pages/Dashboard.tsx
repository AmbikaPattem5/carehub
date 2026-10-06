import useAuth from "../CustomHooks/useAuth";
import { useState, useEffect } from "react"
import api from "../services/api"
import type { DoctorStats, AdminStats, Receptionist } from "../types/DashboardTypes"
import toast from "react-hot-toast"
import type { AppointmentResponse } from "../types/AppointmentTypes";
import AddPrescriptionModal from "../Components/AddPrescriptionModal"
import PrescriptionPrint from "../Components/PrescriptionPrint"
import { Calendar, Loader2 } from "lucide-react"


function Dashboard() {
    const [doctorStats, setDoctorStats] = useState<DoctorStats | undefined>(undefined)
    const [receptionistStats, setReceptionistStats] = useState<Receptionist | undefined>(undefined)
    const [adminStats, setAdminStats] = useState<AdminStats | undefined>(undefined)
    const [appointmentList, setAppointmentList] = useState<AppointmentResponse[]>([])
    const { role, user } = useAuth();
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<Boolean>(false)
    const [appointmentId, setAppointmentId] = useState<string>("")
    const [patientId, setPatientId] = useState<string>("")
    const [isPrecriptionOpen, setIsPrescriptionOpen] = useState<Boolean>(false)
    const [prescriptionId, setPrescriptionId] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true);
    console.log(role)
    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get("/dashboard/stats")
                if (response && response.data && response.data.success) {
                    if (response.data.role == "doctor") {
                        setDoctorStats(response.data.stats)
                    }
                    if (response.data.role == "receptionist") {
                        setReceptionistStats(response.data.stats)
                    }
                    if (response.data.role == "admin") {
                        setAdminStats(response.data.stats)
                    }
                }

            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to load dashboard data")
            }
        }
        loadData();
    }, [])
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        async function getAppointments() {
            setLoading(true);
            try {
                const response = await api.get("/appointments", {
                    params: {
                        date: formattedDate
                    }
                })
                if (response && response.data && response.data.success) {
                    setAppointmentList(response.data.appointments)

                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to load appointments")

            } finally {
                setLoading(false);
            }
        }
        getAppointments()
    }, [])
    function handleConsultation(patientId: string, appointmentId: string) {
        setIsPrescriptionModalOpen(true);
        setAppointmentId(appointmentId);
        setPatientId(patientId)

    }
    function handleClose(isPrescriptionPrint: boolean, prescriptionId: string = "") {
        setIsPrescriptionModalOpen(false);
        if (isPrescriptionPrint) {

            setIsPrescriptionOpen(true);
            setPrescriptionId(prescriptionId)

        }

    }
    const displayName = user
        ? (role === 'doctor' && !user.toLowerCase().startsWith('dr') ? `Dr. ${user}` : user)
        : (role === 'doctor' ? 'Doctor' : 'User');

    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* Header Greeting */}
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Good morning, {displayName}!
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                    {role === 'doctor'
                        ? "Here is your consultation schedule for today"
                        : role === 'receptionist'
                            ? "Here is today's patient check-in and visit queue"
                            : "Here is your clinic overview and operational metrics for today"}
                </p>
            </div>

            {/* KPI Metrics Section */}
            {role === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Card 1: Today's Queue */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Queue</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            {doctorStats?.todayQueue ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Total appointments</p>
                    </div>

                    {/* Card 2: Pending Consultations */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Consultations</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            {doctorStats?.pendingConsultations ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">
                            {doctorStats?.pendingConsultations ?? 0} remaining
                        </p>
                    </div>

                    {/* Card 3: Completed Today */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Today</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            {doctorStats?.completedToday ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Completed</p>
                    </div>

                    {/* Card 4: Next Patient or Patient Satisfaction */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition flex flex-col justify-between">
                        {doctorStats?.nextPatient?.patientName ? (
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Patient</span>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
                                    {doctorStats.nextPatient.patientName}
                                </div>
                                <p className="text-xs text-teal-600 font-semibold mt-1.5 truncate">
                                    {doctorStats.nextPatient.time} • {doctorStats.nextPatient.reason}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Satisfaction</span>
                                <div className="flex items-end justify-between mt-2">
                                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">98%</div>
                                    <svg className="w-20 h-9 text-emerald-500" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 30 Q 25 35, 45 20 T 85 10 T 95 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
                                    </svg>
                                </div>
                                <p className="text-xs text-emerald-600 font-semibold mt-1.5">High score</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {role === 'receptionist' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Visits</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            {receptionistStats?.todayVisits ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Patient visits recorded</p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Check-Ins</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            {receptionistStats?.pendingCheckIns ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">
                            {receptionistStats?.pendingCheckIns ?? 0} waiting in lobby
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desk Collections</span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                            ₹{receptionistStats?.deskCollectionsToday?.toLocaleString('en-IN') ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Collected today at desk</p>
                    </div>
                </div>
            )}

            {role === 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                            {adminStats?.totalPatients ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Registered records</p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Doctors</span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                            {adminStats?.activeDoctors ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">On-duty physicians</p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today Appointments</span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                            {adminStats?.todayAppointments ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Scheduled today</p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                            ₹{adminStats?.totalRevenue?.toLocaleString('en-IN') ?? 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Clinic revenue</p>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Growth</span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                            +{adminStats?.monthlyGrowth ?? 0}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">vs last month</p>
                    </div>
                </div>
            )}

            {/* Today's Appointments Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold text-slate-600">
                                <th className="py-3.5 px-6 font-semibold">Patient Name</th>
                                <th className="py-3.5 px-6 font-semibold">Time</th>
                                <th className="py-3.5 px-6 font-semibold">Reason</th>
                                <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                                <th className="py-3.5 px-6 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-14 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                                            <span className="text-xs font-semibold text-slate-500">Loading today's schedule...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : appointmentList && appointmentList.length > 0 ? (
                                appointmentList.map((appointment) => (
                                    <tr key={appointment._id} className="hover:bg-slate-50/80 transition-colors text-sm">
                                        <td className="py-4 px-6 font-semibold text-slate-900">
                                            {appointment?.patientName}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 text-xs sm:text-sm font-medium">
                                            {appointment?.time}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 text-xs sm:text-sm max-w-xs truncate">
                                            {appointment?.reason || "General Consultation"}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${appointment?.status === "confirmed" || appointment?.status === "checked-in"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : appointment?.status === "pending"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                        : appointment?.status === "completed"
                                                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                                }`}>
                                                {appointment?.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleConsultation(appointment.patientId, appointment.appointmentId || "")}
                                                className="px-4 py-1.5 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
                                            >
                                                Start Consultation
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-14 text-center text-slate-400">
                                        <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="text-sm font-medium text-slate-600">No appointments scheduled for today</p>
                                        <p className="text-xs text-slate-400 mt-1">Appointments booked for today will appear in this queue</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {isPrescriptionModalOpen && (
                <AddPrescriptionModal
                    onClose={handleClose}
                    appointmentId={appointmentId}
                    patientId={patientId}
                />
            )}
            {isPrecriptionOpen && (
                <PrescriptionPrint
                    onClose={() => setIsPrescriptionOpen(false)}
                    patientId={patientId}
                    prescriptionId={prescriptionId}
                />
            )}
        </div>
    )
}
export default Dashboard
