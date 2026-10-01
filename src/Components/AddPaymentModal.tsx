import type { Billing, paymentRequest } from "../types/BillingTypes"
import { useState, useEffect } from "react"
import { User } from "lucide-react"
import React from "react";
import api from "../services/api"
import toast from "react-hot-toast"
function AddPaymentModal({ billing, onClose }: { billing: Billing, onClose: () => void }) {
    console.log(billing);
    const initialBillingData: paymentRequest = {
        transactionRef: "",
        notes: "",
        totalAmount: Number(billing.totalAmount),
        paymentMethod: ""

    }
    const [isSelect, setIsSelect] = useState<string>("upi")
    const [billingData, setBillingData] = useState<paymentRequest>(initialBillingData)
    enum PaymentMethods {
        upi = "UPI/QR Code",
        cards = "Credit/Debit Cards",
        cash = "Cash"
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setBillingData({ ...billingData, [name]: value })

    }
    function handlePayment(key, value) {
        setIsSelect(key);
        setBillingData({ ...billingData, paymentMethod: value })
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const response = await api.patch(`/bills/${billing._id}/pay`, billingData);
            console.log(response.data);
            if (response && response.data.success) {
                toast.success(response?.data?.message)
            }
        }
        catch (err) {
            toast.error(err?.response?.data?.message)
        }
        onClose();
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col gap-2">
                        <div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Collect Payment - Invoice#{billing.billId}</h2>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <User size={20} />
                            <div>
                                <h4 className="border border-gray-300 bg-green-200">{billing.doctorName} . {billing.patientId} - {billing.notes}</h4>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div>Amount Due</div>
                            <div className="flex flex-eow">
                                <div className="text-2xl font-bold m-1 p-1">{billing.totalAmount}</div>
                                <div className="text-sm bg-orange-100 border border-orange-100 rounded-xl text-center p-1 m-1">{billing.paymentStatus}</div>
                            </div>
                        </div>
                        <div>
                            {Object.entries(PaymentMethods).map(([key, value]) => {
                                return (
                                    <button type="button" key={key} value={value} onClick={() => handlePayment(key, value)} className={`border border-gray-100 text-white rounded-xl p-1 m-1 cursor-pointer ${isSelect === key ? "bg-emerald-500" : "bg-gray-400 hover:bg-emerald-500"}`}>{value}</button>

                                )
                            })}
                            {/* <button type="button" onClick={() => { setIsSelect(true) }} className={`border border-gray-100 text-white rounded-xl p-1 m-1 cursor-pointer ${isSelect ? "bg-emerald-500" : "bg-gray-400 hover:bg-emerald-500"}`}>UPI/QR Code</button>
                            <button type="button" onClick={() => { setIsSelect(true) }} className={`border border-gray-100 text-white rounded-xl p-1 m-1 cursor-pointer ${isSelect ? "bg-emerald-500" : "bg-gray-400 hover:bg-emerald-500"}`}> Credit /Debit Card</button>
                            <button type="button" onClick={() => { setIsSelect(true) }} className={`border border-gray-100 text-white rounded-xl p-1 m-1 cursor-pointer ${isSelect ? "bg-emerald-500" : "bg-gray-400 hover:bg-emerald-500"}`}>Cash</button> */}

                        </div>
                        <div className="flex flex-row gap-6">
                            <div className="border border-gray-200 rounded-2xl overflow-hidden p-2 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
                                <img src="/qr-code-scanner.jpg" alt="Payment QR Scanner" className="w-44 h-44 object-contain rounded-xl" />
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray">Transaction reference ID</label>
                                    <input type="text" name="transactionRef" value={billingData.transactionRef} className="border border-gray-300 rounded-xl" onChange={handleChange} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray">Payment Notes</label>
                                    <textarea name="notes" value={billingData.notes} className="border border-gray-300 rounded-xl" onChange={handleChange}>
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={onClose} className="border border-gray-100 bg-gray-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="border border-gray-100 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Confirm Payment & Receipt</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default AddPaymentModal;