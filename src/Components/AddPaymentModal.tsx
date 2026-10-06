import type { Billing, paymentRequest } from "../types/BillingTypes"
import { useState } from "react"
import { QrCode, CreditCard, Banknote, Check, X, Loader2 } from "lucide-react"
import React from "react"
import api from "../services/api"
import toast from "react-hot-toast"

function AddPaymentModal({ billing, onClose }: { billing: Billing, onClose: () => void }) {
    const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "cash">("upi")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const generateDefaultRef = (method: "upi" | "card" | "cash") => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
        const randNum = Math.floor(10000000 + Math.random() * 90000000)
        if (method === "upi") return `UPI/${dateStr}/${randNum}`
        if (method === "card") return `CARD/${dateStr}/${randNum.toString().slice(0, 6)}`
        return `CASH/${dateStr}/${randNum.toString().slice(0, 4)}`
    }

    const [billingData, setBillingData] = useState<paymentRequest>({
        transactionRef: generateDefaultRef("upi"),
        notes: "",
        totalAmount: Number(billing.totalAmount || 0),
        paymentMethod: "UPI/QR Code"
    })

    function handleMethodChange(method: "upi" | "card" | "cash", methodName: string) {
        setSelectedMethod(method)
        setBillingData((prev) => ({
            ...prev,
            paymentMethod: methodName,
            transactionRef: generateDefaultRef(method)
        }))
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setBillingData((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e?: React.SyntheticEvent) {
        if (e) e.preventDefault()
        const targetId = billing?._id || billing?.billId
        if (!targetId) return

        setIsSubmitting(true)
        try {
            const response = await api.patch(`/bills/${targetId}/pay`, {
                paymentMethod: billingData.paymentMethod,
                amountPaid: billingData.totalAmount,
                transactionRef: billingData.transactionRef,
                notes: billingData.notes
            })

            if (response && response.data.success) {
                toast.success(response.data.message || "Payment recorded successfully!")
                onClose()
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Payment recording failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    const patientInitial = billing.patientName
        ? billing.patientName.slice(0, 1).toUpperCase()
        : "P"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 sm:px-7 pt-6 pb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        Collect Payment - Invoice #{billing.billId}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-7 pt-2 space-y-5 flex-1 overflow-y-auto">
                    {/* Patient Information Strip */}
                    <div className="bg-[#eef7f9] border border-teal-100/80 rounded-xl p-2.5 px-3.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {patientInitial}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 truncate">
                            <span className="font-bold text-slate-900">{billing.patientName || "Priya Singh"}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-700">{billing.patientId || "PAT-1002"}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 truncate">{billing.itemsSummary || billing.notes || "Full Body Checkup"}</span>
                        </div>
                    </div>

                    {/* Amount Due Section */}
                    <div>
                        <div className="text-xs font-semibold text-slate-500">Amount Due</div>
                        <div className="flex items-center gap-3 mt-0.5">
                            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                ₹{Number(billing.totalAmount || 0).toLocaleString('en-IN')}
                            </div>
                            <span className="bg-amber-100 text-amber-800 font-semibold text-xs px-2.5 py-0.5 rounded-full capitalize border border-amber-200">
                                {billing.paymentStatus || "Pending"}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleMethodChange("upi", "UPI/QR Code")}
                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                selectedMethod === "upi"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                            }`}
                        >
                            <QrCode size={16} />
                            <span>UPI / QR Code</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMethodChange("card", "Credit/Debit Cards")}
                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                selectedMethod === "card"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                            }`}
                        >
                            <CreditCard size={16} />
                            <span>Credit / Debit Card</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleMethodChange("cash", "Cash")}
                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                selectedMethod === "cash"
                                    ? "bg-teal-600 text-white shadow-xs"
                                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                            }`}
                        >
                            <Banknote size={16} />
                            <span>Cash</span>
                        </button>
                    </div>

                    {/* Payment Form Content */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                        {selectedMethod === "upi" && (
                            <div className="w-full sm:w-44 border border-slate-200 rounded-2xl p-2.5 bg-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                                <img
                                    src="/qr-code-scanner.jpg"
                                    alt="Payment QR Scanner"
                                    className="w-36 h-36 object-contain rounded-xl"
                                />
                                <p className="text-[11px] text-slate-500 font-medium mt-1.5 text-center leading-tight">
                                    Scan using GPay, PhonePe, Paytm
                                </p>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col justify-between space-y-3.5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Transaction reference ID
                                </label>
                                <input
                                    type="text"
                                    name="transactionRef"
                                    value={billingData.transactionRef}
                                    onChange={handleChange}
                                    placeholder={
                                        selectedMethod === "upi"
                                            ? "UPI/20260929/44889900"
                                            : selectedMethod === "card"
                                            ? "AUTH-98214"
                                            : "CASH-REC-101"
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">
                                    Payment notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={billingData.notes}
                                    onChange={handleChange}
                                    placeholder="Payment notes..."
                                    rows={selectedMethod === "upi" ? 2 : 4}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Recording Payment...
                                </>
                            ) : (
                                <>
                                    <Check size={16} /> Confirm Payment & Receipt
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddPaymentModal