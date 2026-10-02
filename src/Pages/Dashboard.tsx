import useAuth from "../CustomHooks/useAuth";
import { useState, useEffect } from "react"
import api from "../services/api"
import type { DoctorStats, AdminStats, Receptionist } from "../types/DashboardTypes"
import toast from "react-hot-toast"
import type { AppointmentResponse } from "../types/AppointmentTypes";
import AddPrescriptionModal from "../Components/AddPrescriptionModal"

function Dashboard() {
    const [doctorStats, setDoctorStats] = useState<DoctorStats | undefined>(undefined)
    const [receptionistStats, setReceptionistStats] = useState<Receptionist | undefined>(undefined)
    const [adminStats, setAdminStats] = useState<AdminStats | undefined>(undefined)
    const [appointmentList, setAppointmentList] = useState<AppointmentResponse[]>([])
    const { role, user } = useAuth();
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<Boolean>(false)
    const [appointmentId, setAppointmentId] = useState<string>("")
    const [patientId, setPatientId] = useState<string>("")

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
            catch (error) {
                toast.error(error?.response?.data?.message)
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
            catch (error) {
                toast.error(error?.response?.data?.message)

            }
        }
        getAppointments()
    }, [])
    function handleConsultation(patientId, appointmentId) {
        setIsPrescriptionModalOpen(true);
        setAppointmentId(appointmentId);
        setPatientId(patientId)

    }
    return (
        <div className="flex flex-col gap-4">
            <div>
                {role == 'doctor' &&
                    <div className="w-full h-full mx-auto">
                        <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                            <div className="flex flex-col w-full justify-start space-y-1">
                                <div className="space-y-1 border-b border-gray-300">
                                    <h2 className="text-2xl font-semibold">Good Morning, {user} </h2>
                                    <p>Here is your consultation schedule for today</p>
                                </div>

                            </div>
                            <div className="flex flex-row gap-2 bg-gray-200">
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Todays Queue</h4>
                                    <h1>{doctorStats?.todayQueue}</h1>
                                    <p>Trend</p>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Pending Consultations</h4>
                                    <h1>{doctorStats?.pendingConsultations}</h1>
                                    <p>{doctorStats?.pendingConsultations} remaining</p>

                                </div>

                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Completed Today</h4>
                                    <h1>{doctorStats?.completedToday}</h1>
                                    <p>Completed</p>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Next Patient</h4>
                                    <h1>{doctorStats?.nextPatient?.patientName}</h1>
                                    <p>{doctorStats?.nextPatient?.time} . {doctorStats?.nextPatient?.reason}</p>
                                </div>
                            </div>


                        </div>
                    </div>
                }
                {role == "receptionist" &&
                    <div className="w-full h-full mx-auto">
                        <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                            <div className="flex flex-col w-full justify-start space-y-1">
                                <div className="space-y-1 border-b border-gray-300">
                                    <h2 className="text-2xl font-semibold">Good Morning, {user} </h2>
                                    <p>Here is your consultation schedule for today</p>
                                </div>

                            </div>
                            <div className="flex flex-row gap-2 bg-gray-200 ">
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Todays Visits</h4>
                                    <h1>{receptionistStats?.todayVisits}</h1>
                                    <p>visits</p>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Pending ChehckIns</h4>
                                    <h1>{receptionistStats?.pendingCheckIns}</h1>
                                    <p>{receptionistStats?.pendingCheckIns} pending</p>

                                </div>

                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Desk Collections</h4>
                                    <h1>{receptionistStats?.deskCollectionsToday}</h1>
                                    <p>Completed</p>
                                </div>

                            </div>


                        </div>
                    </div>
                }
                {role == "admin" &&
                    <div className="w-full h-full mx-auto">
                        <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                            <div className="flex flex-col w-full justify-start space-y-1">
                                <div className="space-y-1 border-b border-gray-300">
                                    <h2 className="text-2xl font-semibold">Good Morning, {user} </h2>
                                    <p>Here is your consultation schedule for today</p>
                                </div>

                            </div>
                            <div className="flex flex-row gap-2 bg-gray-200 ">
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Total Patients</h4>
                                    <h1>{adminStats?.totalPatients}</h1>
                                    <p>Trend</p>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Active Doctors</h4>
                                    <h1>{adminStats?.activeDoctors}</h1>

                                </div>

                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Today Apponitments</h4>
                                    <h1>{adminStats?.todayAppointments}</h1>
                                    <p>Completed</p>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Total Revenue</h4>
                                    <h1>{adminStats?.totalRevenue}</h1>
                                </div>
                                <div className="flex-1 border border-gray-300 rounded-xl">
                                    <h4>Monthly Growth</h4>
                                    <h1>{adminStats?.monthlyGrowth}</h1>
                                </div>
                            </div>


                        </div>
                    </div>
                }
            </div>
            <div>
                <table className="border w-full border-gray-300 rounded-3xl mx-4">
                    <thead>
                        <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                            <th>Patient Name</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            appointmentList && appointmentList.length > 0 ? (appointmentList.map((appointment) => {

                                return (
                                    <tr key={appointment._id} className="border-b border-gray-300">
                                        <td className="text-center">{appointment?.patientName}</td>
                                        <td className="text-center">{appointment?.time}</td>
                                        <td className="text-center">{appointment?.reason}</td>
                                        <td className="text-center">{appointment?.status}</td>

                                        <td>
                                            <div className="flex gap-2 justify-center items-center">
                                                <div>
                                                    <button onClick={() => handleConsultation(appointment.patientId, appointment.appointmentId)} className="border border-gray-300 rounded-xl p-1 bg-emerald-200 hover:bg-emerald-400 cursor-pointer">Start Consultation</button>
                                                </div>


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
                    </tbody>
                </table>
                {isPrescriptionModalOpen && <AddPrescriptionModal onClose={() => setIsPrescriptionModalOpen(false)} appointmentId={appointmentId} patientId={patientId} />}
            </div>
        </div>
    )
}
export default Dashboard
