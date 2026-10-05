import { useState, useEffect } from "react";
import type { Patient } from "../types/PatientTypes";
import type { AppointmentResponse } from "../types/AppointmentTypes"
import type { BillingRequest, Item, BillingError, Billing } from "../types/BillingTypes"
import api from "../services/api";
import toast from "react-hot-toast";
import { X, Trash2, Plus, Receipt, Loader2 } from "lucide-react"

function InVoiceModal({ onClose, billing }: { onClose: () => void, billing: Billing | null }) {
    const initialFormData: BillingRequest = {
        patientId: billing?.patientId ?? "",
        appointmentId: billing?.appointmentId ?? "",
        items: billing?.items ?? [],
        discount: billing?.discount ?? 0,
        taxPercent: billing?.taxPercent ?? 0,
        notes: billing?.notes ?? "",
        doctorName: billing?.doctorName ?? ""
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
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const isEdit: boolean = billing?.paymentStatus === "pending" || !!billing?._id;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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
        } else {
            setLinkedAppointments(appointmentList);
        }
    }, [formData.patientId, appointmentList]);

    useEffect(() => {
        if (billing?.items && billing.items.length > 0) {
            setTotalItems(billing.items)
        }
    }, [billing])

    function handleBilling(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setBillingData({ ...billingData, [name]: value })
    }

    function handleAdd() {
        if (!billingData.description?.trim()) {
            toast.error("Please enter item description");
            return;
        }
        const qty = Number(billingData.quantity) || 1;
        const unitPrice = Number(billingData.unitPrice) || 0;
        if (unitPrice <= 0) {
            toast.error("Please enter a valid unit price");
            return;
        }
        const itemAmount = qty * unitPrice;
        const newItem: Item = {
            description: billingData.description.trim(),
            quantity: qty,
            unitPrice: unitPrice,
            amount: itemAmount
        }

        setTotalItems([...totalItems, newItem])
        setBillingData(initialBillingData)
    }

    let itemsSubAmount = 0;
    totalItems.forEach((item) => {
        itemsSubAmount += (Number(item.amount) || 0);
    })
    const discountAmount = Number(formData.discount || 0);
    const taxAmount = Number(formData.taxPercent || 0);
    const discountValue = Math.max(0, itemsSubAmount - discountAmount);
    const taxAmountValue = Math.round((discountValue * taxAmount) / 100);
    const totalAmount = discountValue + taxAmountValue;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.patientId) {
            toast.error("Please select a patient")
            return;
        }
        if (totalItems.length === 0) {
            toast.error("Please add at least one billable service/item")
            return;
        }

        setIsSubmitting(true);
        const billingRequest: BillingRequest = {
            patientId: formData.patientId,
            appointmentId: formData.appointmentId || "",
            items: totalItems,
            discount: Number(formData.discount) || 0,
            taxPercent: Number(formData.taxPercent) || 0,
            notes: formData.notes || ""
        }

        try {
            if (isEdit && billing?._id) {
                const response = await api.patch(`/bills/${billing._id}`, billingRequest)
                if (response && response.data.success) {
                    toast.success(response.data.message || "Invoice updated successfully")
                    onClose()
                }
            } else {
                const response = await api.post('/bills', billingRequest)
                if (response && response.data.success) {
                    toast.success(response.data.message || "Invoice generated successfully")
                    onClose()
                }
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to process invoice")
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleDelete(idx: number) {
        const updated = totalItems.filter((_, index) => index !== idx);
        setTotalItems(updated);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                            <Receipt size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Invoice" : "Create New Invoice"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Patient & Appointment Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Patient <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <select
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 outline-none transition"
                            >
                                <option value="">Select Patient</option>
                                {patientList.map((patient) => (
                                    <option key={patient._id || patient.patientId} value={patient.patientId}>
                                        {patient.firstName} {patient.lastName} ({patient.patientId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">Linked Appointment</label>
                            <select
                                name="appointmentId"
                                value={formData.appointmentId}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 outline-none transition"
                            >
                                <option value="">Select Appointment (Optional)</option>
                                {linkedAppointments.map((appointment) => (
                                    <option key={appointment._id || appointment.appointmentId} value={appointment.appointmentId}>
                                        {appointment.appointmentId} - Dr. {appointment.doctorName} ({appointment.date})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">Billed Services & Items</label>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                        <th className="py-2.5 px-3">Service / Item Description</th>
                                        <th className="py-2.5 px-3 text-center w-16">Qty</th>
                                        <th className="py-2.5 px-3 text-right w-24">Unit Price (₹)</th>
                                        <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
                                        <th className="py-2.5 px-3 text-center w-14"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {totalItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-slate-400">
                                                No items added yet. Add at least one item below.
                                            </td>
                                        </tr>
                                    ) : (
                                        totalItems.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                                                <td className="py-2.5 px-3 text-center text-slate-600">{item.quantity}</td>
                                                <td className="py-2.5 px-3 text-right text-slate-600">₹{item.unitPrice}</td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">₹{item.amount}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(index)}
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Inline Add Item Row */}
                        <div className="flex flex-wrap items-end gap-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl mt-2">
                            <div className="flex-1 min-w-[160px] space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">Item Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="e.g. Consultation Fee, ECG..."
                                    value={billingData.description}
                                    onChange={handleBilling}
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none"
                                />
                            </div>
                            <div className="w-20 space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">Qty</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    placeholder="1"
                                    value={billingData.quantity ?? ""}
                                    onChange={handleBilling}
                                    className="w-full px-2.5 py-1.5 text-xs text-center rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="w-28 space-y-1">
                                <label className="text-[11px] font-medium text-slate-500">Unit Price (₹)</label>
                                <input
                                    type="number"
                                    name="unitPrice"
                                    min="0"
                                    placeholder="500"
                                    value={billingData.unitPrice ?? ""}
                                    onChange={handleBilling}
                                    className="w-full px-2.5 py-1.5 text-xs text-right rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
                            >
                                <Plus size={14} />
                                Add Item
                            </button>
                        </div>
                    </div>

                    {/* Summary Calculation & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700">Notes / Remarks</label>
                            <textarea
                                name="notes"
                                rows={4}
                                placeholder="Payment terms, clinical referral notes, or remarks..."
                                value={formData.notes || ""}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 outline-none transition resize-none"
                            ></textarea>
                        </div>

                        {/* Calculation Block */}
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Subtotal:</span>
                                <span className="font-semibold text-slate-900">₹{itemsSubAmount}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-slate-600">Discount (₹):</label>
                                <input
                                    type="number"
                                    name="discount"
                                    min="0"
                                    placeholder="0"
                                    value={formData.discount ?? ""}
                                    onChange={handleChange}
                                    className="w-24 px-2 py-1 text-right text-xs rounded-lg border border-slate-200 bg-white focus:border-teal-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-slate-600">Tax / GST (%):</label>
                                <input
                                    type="number"
                                    name="taxPercent"
                                    min="0"
                                    placeholder="0"
                                    value={formData.taxPercent ?? ""}
                                    onChange={handleChange}
                                    className="w-24 px-2 py-1 text-right text-xs rounded-lg border border-slate-200 bg-white focus:border-teal-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                <span className="font-bold text-sm text-slate-800">Final Total:</span>
                                <span className="font-bold text-xl text-teal-600">₹{totalAmount > 0 ? totalAmount : 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs hover:shadow-md hover:shadow-teal-600/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Saving...
                                </>
                            ) : isEdit ? (
                                "Update Invoice"
                            ) : (
                                "Generate Invoice"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InVoiceModal;