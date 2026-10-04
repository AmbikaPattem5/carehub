import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { PrescriptionMedicines } from "../types/PrescriptionTypes"
import api from "../services/api"
import type { Patient } from "../types/PatientTypes"
import { Phone } from "lucide-react"
import logo from "../assets/logo.png"

function PrescriptionPrint({ onClose, patientId, prescriptionId }: { onClose: () => void, patientId: string, prescriptionId: string }) {
    console.log("patient and prescription", patientId, prescriptionId)
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionMedicines | null>(null)
    const [patientData, setPatientData] = useState<Patient | null>(null)
    useEffect(() => {
        async function loadPatientPrecriptionData() {
            try {
                const response = await api.get(`/prescriptions/patient/${patientId}`)
                const filterPrescriptionData = response.data.prescriptions;
                const updatedData = filterPrescriptionData?.find((prescription) => prescription.prescriptionId === prescriptionId)

                setPrescriptionData(updatedData)
                console.log("PrescriptionIdData", updatedData)

            }
            catch (error) {
                console.log(error);
            }
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
        loadPatientPrecriptionData();
    }, [])
    const birthDate = new Date(patientData?.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    // const createdDate = patientData?.createdAt;
    // const currentDate = createdDate.slice(0, 10)
    function handlePrint() {
        const receiptElement = document.getElementById("prescription-content");
        if (!receiptElement) return;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
      <html>
        <head>
          <title>Receipt_${prescriptionData?.prescriptionId}</title>
          <link rel="stylesheet" href="/src/index.css">
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
      </html>
    `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                <div className="p-2 m-2" id="prescription-content">
                    <h1>CareHub Clinic - Medical Prescription</h1>
                    {/* Modal Header */}
                    <div className="border border-gray-300 rounded-xl">
                        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-row justify-between border-b border-gray-400">
                                <div className="flex flex-col">
                                    <div className="flex flex-row">
                                        <div>
                                            <img src={logo} alt="logo" height={60} width={60} className="bg-gradient-to-br from-blue-500 to-cyan-400 text-transparent bg-clip-text" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xl">CareHub</p>
                                            <p className="font-semibold text-sm">Clinic System</p>

                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p>104 HealthCare Boulevard,</p>
                                        <p> Indira Nagar, Bengaluru, India </p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p>Dr. {prescriptionData?.doctorName}</p>
                                    <p>MD (Internal Medicine) - Reg No:88412</p>
                                    <p><Phone size={16} /></p>
                                    <p>E-mail: ddu@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex flex-col border-b border-gray-400">
                                <div className="flex flex-row gap-2">
                                    <p>Patient:{patientData?.firstName}{patientData?.lastName}({patientData?.patientId}) | {age}/{patientData?.gender} | {patientData?.createdAt} </p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Date:{patientData?.createdAt}</p>
                                    <p>Vitals</p>
                                </div>

                            </div>
                        </div>

                        Table
                        <div>
                            <table className="border w-full border-gray-300 rounded-3xl border border-gray-300 p-2">
                                <thead>
                                    <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                                        <th>S.No.</th>
                                        <th>Medication Name</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionData?.medicines.map((item, index) => {
                                        return (
                                            <tr key={index} className="border-b border-gray-300">
                                                <td className="h-10 text-center">{index + 1}</td>
                                                <td className="h-10 text-center">{item?.name}</td>
                                                <td className="h-10 text-center">{item?.dosage}</td>
                                                <td className="h-10 text-center">{item?.frequency}</td>
                                                <td className="h-10 text-center">{item?.duration}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>


                    </div>
                </div>
                <div className="flex justify-between">
                    <div>
                        <button type="button" onClick={onClose} className="border border-gray-100 bg-gray-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Close</button>
                    </div>
                    <div>
                        <button type="button" onClick={handlePrint} className="border border-gray-100 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Print Receipt</button>

                    </div>
                </div>
            </div>
        </div>
    )
}
export default PrescriptionPrint;