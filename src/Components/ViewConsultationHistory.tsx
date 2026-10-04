import type { ConsultationType } from "../types/PrescriptionTypes"

function ViewConsultationHistory({ consultationData }: { consultationData: ConsultationType[] }) {
    return (
        <div className="flex flex-col">
            <div>
                {consultationData?.map((consultation) => {
                    return (
                        <div key={consultation?.consultationId} className="border border-gray-400 rounded-2xl m-2 p-2">
                            <p>{consultation?.createdAt}</p>
                            <p>Doctor: {consultation?.doctorName}</p>
                            <p>Diagnosis tag: {consultation?.diagnosis}</p>
                            <p>Symptoms: {consultation?.symptoms}</p>
                            <p>Doctor Clinical Observs: {consultation?.doctorNotes}</p>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ViewConsultationHistory;