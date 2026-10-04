import type { PrescriptionMedicines } from "../types/PrescriptionTypes"
function ViewPrescriptionHistory({ prescriptionData }: { prescriptionData: PrescriptionMedicines[] }) {
    console.log("PrescriptionData", prescriptionData)
    return (
        <div>
            <div>
                {prescriptionData?.map((prescription, index) => {
                    return (
                        <div key={prescription?.prescriptionId} className="border border-gray-400 rounded-2xl m-2 p-2 flex flex-col">
                            <div className="flex flex-row">
                                <div className='flex flex-col'>
                                    <p>Rx ID</p>
                                    <p>{prescription?.prescriptionId}</p>
                                </div>
                                <div className='flex flex-col'>
                                    <p>Prescribed By:</p>
                                    <p>{prescription?.doctorName}</p>
                                </div>
                                <div className='flex flex-col'>
                                    <p>Date: </p>
                                    <p>{prescription?.createdAt}</p>
                                </div>

                            </div>
                            <table className="border w-full border-gray-300 rounded-3xl border border-gray-300 p-2">
                                <thead>
                                    <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                                        <th>Medication Name</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescription?.medicines.map((item, index) => {
                                        return (
                                            <tr key={index} className="border-b border-gray-300">
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
                    )
                })}
            </div>
        </div>
    )
}

export default ViewPrescriptionHistory;