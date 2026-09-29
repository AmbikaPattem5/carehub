import { useState, useEffect } from "react";
import type { Patient } from "../types/PatientTypes";
import type { AppointmentResponse } from "../types/AppointmentTypes"
import type { BillingRequest, Item, BillingError } from "../types/BillingTypes"
import api from "../services/api";
import toast from "react-hot-toast";

function InVoiceModal({ onClose }: { onCLose: () => void }) {
    const initialFormData: BillingRequest = {
        patientId: "",
        appointmentId: "",
        items: [],
        discount: null,
        taxPercent: null,
        notes: ""
    }
    const initialFormErrors: BillingError = {
        patientId: "",
        appointmentId: "",
        items: "",
        discount: "",
        taxPercent: "",
        notes: ""

    }
    const initialBillingData: Item = {
        description: "",
        quantity: null,
        unitPrice: null,
        amount: null,
    }
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [appointmentList, setAppointmentList] = useState<AppointmentResponse[]>([])
    const [formData, setFormData] = useState<BillingRequest>(initialFormData)
    const [linkedAppointments, setLinkedAppointments] = useState<AppointmentResponse[]>([])
    const [description, setDescription] = useState<string>("");
    const [quantity, setquantity] = useState<number | null>(null);
    const [unitPrice, setUnitPrice] = useState<number | null>(null)
    const [totalItems, setTotalItems] = useState<Item[]>([])
    const [billingData, setBillingData] = useState<Item>(initialBillingData)
    let discount = 50;
    let tax = 0;
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: [value] })
    }
    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get('/patients')
                if (response && response.data.success) {
                    setPatientList(response.data.patients)
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch patients")
            }
            try {
                const response = await api.get('/appointments')
                if (response && response.data.success) {
                    setAppointmentList(response.data.appointments)
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to fetch appointments")
            }

        }
        loadData();
    }, [])
    function getAppointment(patientId) {
        const filteredAppointments = appointmentList.filter((appointment) => appointment.patientId === patientId);
        console.log(filteredAppointments)
        setLinkedAppointments(filteredAppointments);

    }
    function handleBilling(e) {
        const { name, value } = e.target;
        setBillingData({ ...billingData, [name]: value })

    }
    //console.log(billingData)
    function handleAdd() {
        const qty = Number(billingData.quantity) || 0;
        const unitPrice = Number(billingData.unitPrice) || 0;
        const itemAmount = qty * unitPrice;
        const newItem = {
            ...billingData,
            quantity: qty,
            unitPrice: unitPrice,
            amount: itemAmount
        }

        setTotalItems([...totalItems, newItem])
        setBillingData(initialBillingData)
    }
    let itemsSubAmount = 0;
    totalItems.forEach((item) => {
        itemsSubAmount = itemsSubAmount + item.amount
    })
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const billingRequest: BillingRequest = {
                patientId: formData.patientId,
                appointmentId: formData.appointmentId,
                items: totalItems,
                discount: discount,
                taxPercent: tax,
                notes: formData.notes
            }
            const response = await api.post('/bills', billingRequest)
            if (response && response.data.success) {
                toast.success(response.data.message)
                onClose()
            }
        }
        catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create invoice")
        }
    }
    console.log("totalItem", totalItems)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                <div className="flex flex-col px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div >
                        <h1 className="font-bold">Create New Voice</h1>
                    </div>
                    <form>
                        <div className="flex flex-row">
                            <div>
                                <label>Patient</label>
                                <select name="patientId" value={formData.patientId} onChange={(e) => { handleChange(e); getAppointment(e.target.value) }}>
                                    {
                                        patientList.map((patient) => {
                                            return (
                                                <option key={patient._id} value={patient.patientId}>{patient.firstName} {patient.patientId}</option>
                                            )
                                        })
                                    }
                                </select>

                            </div>
                            <div>
                                <label>Linked Appointment</label>
                                <select name="appointmentId" value={formData.appointmentId} onChange={handleChange}>
                                    {
                                        linkedAppointments.map((appointment) => {
                                            return (
                                                <option key={appointment._id} value={appointment.patientId}>{appointment.appointmentId} - Dr.{appointment.doctorName}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div>
                            <table className="border border-gray-300 rounded-2xl">
                                <thead className="border-b border-gray-300">
                                    <tr>
                                        <th>Service / Item Description</th>
                                        <th>Qty</th>
                                        <th>Unit Price(₹)</th>
                                        <th>Total Amount(₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {totalItems.map((item) => {
                                        return (
                                            <tr className="border-b border-gray-300">
                                                <td >{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.unitPrice}</td>
                                                <td>{item.amount}</td>
                                            </tr>
                                        )

                                    })}

                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-row">
                            <div>
                                <label>Item Description</label>
                                <input type="text" name="description" value={billingData.description} onChange={handleBilling} className="border border-gray-300 rounded-2xl" />
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input type="number" name="quantity" value={billingData.quantity ?? ""} onChange={handleBilling} className="border border-gray-300 rounded-2xl" />
                            </div>
                            <div>
                                <label>Unit Price</label>
                                <input type="number" name="unitPrice" value={billingData.unitPrice ?? ""} onChange={handleBilling} className="border border-gray-300 rounded-2xl" />
                            </div>


                        </div>
                        <div className="flex justify-between">
                            <div>
                                <button type="button" onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Add</button>
                            </div>
                            <div className="flex flex-col">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Discount</label>
                                    <input type="number" value="50" className="border border-gray-300 rounded-xl m-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tax/GST(%)</label>
                                    <input type="number" value="0" className="border border-gray-300 rounded-xl m-2" />
                                </div>
                                <div className="flex gap-2">
                                    <label className="text-sm font-medium text-gray-700">Subtotal</label>
                                    <span className="text-center text-sm font-medium w-full justify-end">₹{itemsSubAmount}</span>
                                </div>
                                <div className="flex gap-2">
                                    <label className=" text-sm font-medium text-gray-700">Final Total</label>
                                    <span className="text-center text-lg font-medium w-full justify-end">₹{itemsSubAmount && itemsSubAmount - discount + tax}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label>Notes</label>
                            <textarea name="notes" value={formData.notes} className="border border-gray-300 rounded-xl" onChange={handleChange}></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-400 hover:bg-gray-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2 ">Generate Invoice</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

}

export default InVoiceModal;