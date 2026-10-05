import { useState } from "react"
import type { Billing, StatisticsResponse } from "../types/BillingTypes"
import { Receipt } from "lucide-react"
import AddDownloadReceiptModal from "./AddDownloadReceiptModal"
import AddPaymentModal from "./AddPaymentModal"

function ViewInvoiceHistory({ invoiceData }: { invoiceData: Billing[], invoiceStats?: StatisticsResponse | null }) {
    const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<Billing | null>(null);
    const [paymentBill, setPaymentBill] = useState<Billing | null>(null);

    // Compute patient specific totals
    const totalIncurred = invoiceData?.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0) || 0;
    const totalPaid = invoiceData?.reduce((sum, item) => sum + (Number(item.amountPaid) || 0), 0) || 0;
    const pendingBalance = Math.max(0, totalIncurred - totalPaid);

    if (!invoiceData || invoiceData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Receipt size={24} />
                </div>
                <h4 className="font-semibold text-slate-700 text-sm">No Invoices Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    This patient has no billing invoices or payment transactions recorded.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                    <div className="text-xs font-semibold text-slate-600">Total Incurred</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">₹{totalIncurred.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                    <div className="text-xs font-semibold text-slate-600">Total Paid</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                    <div className="text-xs font-semibold text-slate-600">Pending Balance</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">₹{pendingBalance.toLocaleString('en-IN')}</div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="py-3 px-3.5">Invoice ID</th>
                            <th className="py-3 px-3.5">Date</th>
                            <th className="py-3 px-3.5">Services</th>
                            <th className="py-3 px-3.5 text-right">Total Amount</th>
                            <th className="py-3 px-3.5 text-right">Paid Amount</th>
                            <th className="py-3 px-3.5 text-center">Payment Status</th>
                            <th className="py-3 px-3.5 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoiceData.map((item, index) => {
                            const dateObj = item?.createdAt ? new Date(item.createdAt) : null;
                            const formattedDate = dateObj
                                ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                : "15 Oct 2023";

                            return (
                                <tr key={item?._id || index} className="hover:bg-slate-50/70 transition">
                                    <td className="py-3.5 px-3.5 font-bold text-slate-900">{item.billId}</td>
                                    <td className="py-3.5 px-3.5 text-slate-600">{formattedDate}</td>
                                    <td className="py-3.5 px-3.5 text-slate-700 font-medium max-w-xs truncate">{item.itemsSummary || "Consultation, Blood Test"}</td>
                                    <td className="py-3.5 px-3.5 font-semibold text-slate-900 text-right">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                                    <td className="py-3.5 px-3.5 font-semibold text-slate-900 text-right">₹{item.amountPaid?.toLocaleString('en-IN')}</td>
                                    <td className="py-3.5 px-3.5 text-center">
                                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                            item.paymentStatus === "paid"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : item.paymentStatus === "pending" || item.paymentStatus === "partially-paid"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-rose-100 text-rose-800"
                                        }`}>
                                            {item.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedBillForReceipt(item)}
                                                className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
                                            >
                                                View Receipt
                                            </button>
                                            {item.paymentStatus !== "paid" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentBill(item)}
                                                    className="px-2.5 py-1 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
                                                >
                                                    Collect Payment
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {selectedBillForReceipt && (
                <AddDownloadReceiptModal
                    billing={selectedBillForReceipt}
                    onClose={() => setSelectedBillForReceipt(null)}
                />
            )}

            {paymentBill && (
                <AddPaymentModal
                    billing={paymentBill}
                    onClose={() => setPaymentBill(null)}
                />
            )}
        </div>
    )
}

export default ViewInvoiceHistory;