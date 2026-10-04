export interface DoctorStats {
    todayQueue: number,
    completedToday: number,
    pendingConsultations: number,
    nextPatient: {
        patientName: string,
        time: string,
        reason: string
    }
}
export interface AdminStats {
    totalPatients: number,
    activeDoctors: number,
    todayAppointments: number,
    totalRevenue: number,
    monthlyGrowth: number

}
export interface Receptionist {
    todayVisits: number,
    pendingCheckIns: number,
    deskCollectionsToday: number

}