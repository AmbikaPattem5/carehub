import AddAppointmentModal from "../Components/AddAppointmentModal";
import { useState, useEffect } from "react";
import type { AppointmentResponse } from "../types/AppointmentTypes";
import api from "../services/api";
import toast from "react-hot-toast";
import type { Doctor } from "../types/DoctorTypes";
import { Status } from '../types/AppointmentTypes'
import { X } from "lucide-react"
function Appointments() {
    const [isAppointmentModal, setIsAppointmentModal] = useState<boolean>(false)
    const [appointmentList, setAppointmentList] = useState<AppointmentResponse[] | null>(null)
    const [initialAppointmentList, setinitialAppointmentList] = useState<AppointmentResponse[] | null>(null)
    const [rescheduleAppointment, setRescheduleAppointment] = useState<AppointmentResponse | null>(null)
    const [date, setDate] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [checkInStatus, setCheckInStatus] = useState<string | null>(null)
    const [cancelAppointment, setCancelAppointment] = useState<AppointmentResponse | null>(null)
    const [reshedule, setReshedule] = useState<string | null>("reshedule")

    // const editData ={
    //     status : "",
    //     notes : ""
    // }

    // enum Status {
    //     All = "all",
    //     Confirmed = "confirmed",
    //     Pending = "pending",
    //     Completed = "completed"

    // }
    useEffect(() => {
        getDoctors()
    }, [])

    async function handleCheckIn(id: string) {
        try {
            const response = await api.patch(`/appointments/${id}/check-in`)
            if (response.data.success) {
                toast.success("Appointment checked in successfully")
                getAppointmentList()
                setCheckInStatus(response.data.appointment.status)
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to check in")
        }
    }


    async function getDoctors() {
        try {
            const response = await api.get('/doctors')
            if (response.data.success) {
                setDoctors(response.data.doctors)
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch doctors")
        }
    }
    async function handleCancelAppointment(id: string) {
        try {
            const response = await api.patch(`/appointments/${id}/cancel`)
            if (response.data.success) {
                toast.success("Appointment cancelled successfully");
                setCancelAppointment(response.data.appointment);
                getAppointmentList()
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to cancel appointment")
        }
    }
    async function getAppointmentList() {
        try {
            const response = await api.get('/appointments',
                {
                    params: {
                        status, date
                    }
                }
            )
            console.log("appointmentList" + response.data)

            if (response && response.data.success) {
                setAppointmentList(response.data.appointments)
                setinitialAppointmentList(response.data.appointments);
            }
        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch appointments")
        }
    }

    useEffect(() => {
        getAppointmentList()
    }, [status, date])


    function filterDoctorId(id: string) {
        const updatedAppointmentList = initialAppointmentList.filter((appointment) => (appointment.doctorId === id));
        setAppointmentList(updatedAppointmentList)
    }
    return (
        <div className="w-full h-full mx-auto bg-gray-200 border-b border-gray-300">
            <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                <div className="flex flex-row w-full justify-between items-center space-y-1">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold">Appointments</h2>
                        <p>Book, track and manage patient visits and consultation visits</p>
                    </div>
                    <div className="space-y-1 flex items-end">
                        <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl  text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={() => setIsAppointmentModal(true)}>Add Appointment</button>
                        {isAppointmentModal && <AddAppointmentModal onClose={() => setIsAppointmentModal(false)} appointment={null} />}
                    </div>
                </div>
                <div className="flex flex-row gap-6 border border-gray-300 rounded-xl p-2 ">

                    <div>
                        <label>Date </label>
                        <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 hover:bg-gray-300 cursor-pointer rounded-xl p-2 m-2" />
                    </div>
                    <div>
                        <label>Doctor </label>
                        <select onChange={(e) => filterDoctorId(e.target.value)} className="border border-gray-300 rounded-xl hover:bg-gray-300 cursor-pointer p-2 m-2">

                            {doctors.map((doctor) => {
                                return (
                                    <option key={doctor.doctorId} value={doctor.doctorId} >{doctor.name}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div>
                        {
                            Object.entries(Status).map(([key, value]) => {
                                return (
                                    <button type="button" value={value} onClick={() => setStatus(value)} className="border border-gray-300 rounded-xl p-2 hover:bg-gray-300 cursor-pointer m-2">{key}</button>
                                )
                            }
                            )
                        }
                    </div>
                </div>
                <div>
                    <table className="border w-full border-gray-300 rounded-3xl">
                        <thead>
                            <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                                <th>Time & Token</th>
                                <th>Patient</th>
                                <th>Assigned Doctor</th>
                                <th>Reason for Visit</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                appointmentList && appointmentList.length > 0 ? (appointmentList.map((appointment) => {

                                    return (
                                        <tr key={appointment._id} className="border-b border-gray-300">
                                            <td className="text-center">{appointment.time + appointment.appointmentId}</td>
                                            <td className="text-center">{appointment.patientName}</td>
                                            <td className="text-center">{appointment.doctorName}</td>
                                            <td className="text-center">{appointment.reason}</td>
                                            <td className="text-center" className={appointment.status == "active" ? "bg-green-300 text-white text-center rounded-xl" : "bg-red-300 text-white text-center rounded-xl"}>{appointment.status}</td>
                                            <td>
                                                <div className="flex gap-2 justify-center items-center">
                                                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300 cursor-pointer" onClick={() => handleCheckIn(appointment._id)}>Check In</button>
                                                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300 cursor-pointer" onClick={() => { setRescheduleAppointment(appointment); setReshedule("reschedule") }}>Reschedule</button>
                                                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300 cursor-pointer" onClick={() => { setRescheduleAppointment(appointment); setReshedule("edit") }}>Edit</button>
                                                    <button className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300 cursor-pointer" onClick={() => handleCancelAppointment(appointment._id)}><X size={16} /></button>


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

                    {rescheduleAppointment && (
                        <AddAppointmentModal
                            doctor={null}
                            onClose={() => { setRescheduleAppointment(null); getAppointmentList(); }}
                            appointment={rescheduleAppointment} reschedule={reshedule}
                        />
                    )}
                </div>
            </div>
        </div>

    )
}
export default Appointments;