import { useState, useEffect } from "react";
import type { Patient } from "../types/PatientTypes";
import type { AppointmentResponse } from "../types/AppointmentTypes"
import type { BillingRequest, Item, BillingError, ItemsError, Billing } from "../types/BillingTypes"
import api from "../services/api";
import toast from "react-hot-toast";
import { X } from "lucide-react"

function InVoiceModal({ onClose, billing }: { onClose: () => void, billing: Billing }) {
    const initialFormData: BillingRequest = {
        patientId: billing?.patientId ?? "",
        appointmentId: billing?.appointmentId ?? "",
        items: billing?.items ?? [],
        discount: billing?.discount ?? null,
        taxPercent: billing?.taxPercent ?? null,
        notes: billing?.notes ?? "",
        doctorName: billing?.doctorName ?? ""
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
    const [totalItems, setTotalItems] = useState<Item[]>([])
    const [billingData, setBillingData] = useState<Item>(initialBillingData)
    const isEdit: Boolean = billing?.paymentStatus === "pending" ? true : false


    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
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

    useEffect(() => {
        if (formData.patientId && appointmentList.length > 0) {
            const filtered = appointmentList.filter(
                (appointment) => appointment.patientId === formData.patientId
            );
            setLinkedAppointments(filtered);
        }
    }, [formData.patientId, appointmentList]);

    useEffect(() => {
        if (isEdit) {
            setTotalItems(billing?.items)
        }
    }, [])
    function handleBilling(e) {
        const { name, value } = e.target;
        setBillingData({ ...billingData, [name]: value })

    }
    //console.log(billingData)
    function handleAdd() {
        if (!billingData.description || !billingData.quantity || !billingData.unitPrice) {
            toast.error("values are required");
            return;
        }
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
    const discountAmount = Number(formData.discount || 0);
    const taxAmount = Number(formData.taxPercent || 0);
    const discountValue = itemsSubAmount - discountAmount;
    const taxAmountValue = (discountValue * taxAmount) / 100
    const totalAmount = discountValue + taxAmountValue;
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.patientId || !formData.appointmentId) {
            toast.error("Patient and Appointment are required")
            return;
        }
        if (totalItems.length === 0) {
            toast.error("Please add items")
            return;
        }
        if (isEdit) {
            try {
                const billingRequest: BillingRequest = {
                    patientId: formData.patientId,
                    appointmentId: formData.appointmentId,
                    items: totalItems,
                    discount: Number(formData.discount),
                    taxPercent: Number(formData.taxPercent),
                    notes: formData.notes
                }
                const response = await api.patch(`/bills/${billing._id}`, billingRequest)
                if (response && response.data.success) {
                    toast.success(response.data.message)
                    onClose()
                }
            }
            catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to edit invoice")
            }
        }
        else {
            try {
                const billingRequest: BillingRequest = {
                    patientId: formData.patientId,
                    appointmentId: formData.appointmentId,
                    items: totalItems,
                    discount: Number(formData.discount),
                    taxPercent: Number(formData.taxPercent),
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
    }
    function handleDelete(id) {
        const updatedFilterList = totalItems.filter((item, index) => index != id);
        setTotalItems(updatedFilterList);
    }
    console.log("totalItem", totalItems)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                <div className="flex flex-col px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div >
                        <h1 className="font-bold">{isEdit ? "Edit Invoice" : "Create New Invoice"}</h1>
                    </div>
                    <form>
                        <div className="flex flex-row">
                            <div>
                                <label>Patient</label>
                                <select name="patientId" value={formData.patientId} onChange={(e) => { handleChange(e); }}>
                                    <option value="">Select Patient</option>
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
                                    <option value="">Select Appointment</option>
                                    {
                                        linkedAppointments.map((appointment) => {
                                            return (
                                                <option key={appointment._id} value={appointment.appointmentId}>{appointment.appointmentId} - Dr.{appointment.doctorName}</option>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {totalItems.map((item, index) => {
                                        return (
                                            <tr key={index} className="border-b border-gray-300">
                                                <td >{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.unitPrice}</td>
                                                <td>{item.amount}</td>
                                                <td><button type="button" className="bg-gray-200 hover:bg-gray-400 " onClick={() => handleDelete(index)}><X size={20} /></button></td>
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
                                <input type="number" name="quantity" value={billingData.quantity ?? ""} onChange={handleBilling} className="border border-gray-300 rounded-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                            </div>
                            <div>
                                <label>Unit Price</label>
                                <input type="number" name="unitPrice" value={billingData.unitPrice ?? ""} onChange={handleBilling} className="border border-gray-300 rounded-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                            </div>


                        </div>
                        <div className="flex justify-between">
                            <div>
                                <button type="button" onClick={handleAdd} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Add</button>
                            </div>
                            <div className="flex flex-col">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Discount</label>
                                    <input type="number" name="discount" value={formData.discount ?? ""} onChange={handleChange} className="border border-gray-300 rounded-xl m-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />

                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tax/GST(%)</label>
                                    <input type="number" name="taxPercent" value={formData.taxPercent ?? ""} onChange={handleChange} className="border border-gray-300 rounded-xl m-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />

                                </div>
                                <div className="flex gap-2">
                                    <label className="text-sm font-medium text-gray-700">Subtotal</label>
                                    <span className="text-center text-sm font-medium w-full justify-end">₹{itemsSubAmount}</span>
                                </div>
                                <div className="flex gap-2">
                                    <label className=" text-sm font-medium text-gray-700">Final Total</label>
                                    <span className="text-center text-lg font-medium w-full justify-end">₹{totalAmount > 0 ? totalAmount : 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label>Notes</label>
                            <textarea name="notes" value={formData.notes} className="border border-gray-300 rounded-xl" onChange={handleChange}></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-400 hover:bg-gray-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2">Cancel</button>
                            <button type="submit" onClick={handleSubmit} className="px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition-all cursor-pointer flex justify-center m-2 ">{isEdit ? "Edit Invoice" : "Generate Invoice"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

}

export default InVoiceModal;