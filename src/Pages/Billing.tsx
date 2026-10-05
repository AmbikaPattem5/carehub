import { useState, useEffect } from "react"
import InVoiceModal from "../Components/InVoiceModal"
import type { Billing as BillingData, StatisticsResponse } from "../types/BillingTypes"
import api from "../services/api"
import toast from "react-hot-toast";
import AddPaymentModal from "../Components/AddPaymentModal"
import { Search, Trash2 } from "lucide-react"
import type { BillingSearch } from "../types/BillingTypes"
import AddDownloadReceiptModal from "../Components/AddDownloadReceiptModal"
import DeleteConfirmModal from "../Components/DeleteConfirmModal"

const PaymentFilterStatus = {
    all: "All",
    paid: "Paid",
    pending: "Pending",
    cancelled: "Cancelled"
} as const;

function Billing() {
    const initialFormData: BillingSearch = {
        statusData: "",
        search: "",
        date: ""
    }
    const [isBilling, setIsBilling] = useState<boolean>(false)
    const [isPayment, setIsPayment] = useState<boolean>(false)
    const [billingList, setBillingList] = useState<BillingData[]>([])
    const [billing, setBilling] = useState<BillingData | null>(null)
    const [isSelect, setIsSelect] = useState<string>("all")
    const [formData, setFormData] = useState<BillingSearch>(initialFormData);
    const [statistics, setStatistics] = useState<StatisticsResponse | undefined>(undefined)
    const [isDownloadReceiptModalOpen, setIsDownloadReceiptModalOpen] = useState<boolean>(false)
    const [editBilling, setEditBilling] = useState<BillingData | null>(null)
    const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<BillingData | null>(null)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    function handleEdit(billing: BillingData) {
        setIsBilling(true);
        setEditBilling(billing)
    }

    function handlePayment(billing: BillingData) {
        if (billing.paymentStatus === "pending" || billing.paymentStatus === "partially-paid") {
            setIsPayment(true);
            setBilling(billing)
        }
        else if (billing.paymentStatus === "paid") {
            setIsDownloadReceiptModalOpen(true);
            setBilling(billing)
        }
    }

    function handleStatus(key: string, value: string) {
        setIsSelect(key);
        setFormData({ ...formData, statusData: key === "all" ? "" : key })
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    async function handleDeleteInvoice() {
        if (!deleteInvoiceTarget) return;
        setIsDeleting(true);
        try {
            const targetId = deleteInvoiceTarget._id || deleteInvoiceTarget.billId;
            const response = await api.delete(`/bills/${targetId}`);
            if (response.data.success) {
                toast.success("Invoice deleted successfully");
                setDeleteInvoiceTarget(null);
                loadData();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete invoice");
        } finally {
            setIsDeleting(false);
        }
    }

    async function loadData() {
        try {
            const response = await api.get("/bills", {
                params: {
                    status: formData.statusData,
                    search: formData.search,
                    date: formData.date
                }
            })
            if (response && response.data && response.data.success) {
                setBillingList(response.data.bills)
                setStatistics(response.data.stats)
            }

        }
        catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load billing data")
        }
    }

    useEffect(() => {
        loadData();
    }, [formData.statusData, formData.search, formData.date])

    return (
        <div>
            <div className="w-full h-full mx-auto bg-gray-200 border-b border-gray-300">
                <div className="w-full mx-auto py-8 px-6 flex flex-col gap-4">
                    <div className="flex flex-row w-full justify-between items-center space-y-1">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">Billing & Invoicing </h2>
                            <p>Manage patients billing, generate invoices, and track payments</p>
                        </div>
                        <div className="space-y-1 flex items-end">
                            <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl text-white font-bold py-2 px-4 rounded cursor-pointer transition shadow-xs" onClick={() => { setEditBilling(null); setIsBilling(true); }}>+ Create Invoice</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">₹{statistics?.totalRevenue?.toLocaleString('en-IN') ?? 0}</div>
                            <div className="text-xs text-emerald-600 font-medium mt-1">Cleared Collections</div>
                        </div>
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Collections</div>
                            <div className="text-2xl font-bold text-amber-600 mt-1">₹{statistics?.pendingAmount?.toLocaleString('en-IN') ?? 0}</div>
                            <div className="text-xs text-slate-500 mt-1">{statistics?.pendingCount ?? 0} pending invoices</div>
                        </div>
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Collections</div>
                            <div className="text-2xl font-bold text-teal-600 mt-1">₹{statistics?.todayCollections?.toLocaleString('en-IN') ?? 0}</div>
                            <div className="text-xs text-slate-500 mt-1">Cash, Card & UPI</div>
                        </div>
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoices Generated</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{statistics?.totalInvoicesCount ?? 0}</div>
                            <div className="text-xs text-slate-500 mt-1">Total in system</div>
                        </div>
                    </div>
                    <div className="flex flex-row flex-wrap gap-4 border border-gray-300 rounded-xl p-3 bg-white items-center">
                        <div className="relative flex-1 min-w-[240px]">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input type="text" placeholder="Search invoices by ID, patient name..." name="search" value={formData.search} onChange={handleChange} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm" />
                        </div>
                        <div className="flex gap-1">
                            {Object.entries(PaymentFilterStatus).map(([key, value]) => {
                                return (
                                    <button
                                        type="button"
                                        key={key}
                                        value={value}
                                        onClick={() => handleStatus(key, value)}
                                        className={`border rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer transition ${isSelect === key ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"}`}
                                    >
                                        {value}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Date: </label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="border border-gray-300 hover:bg-gray-100 cursor-pointer rounded-xl p-1.5 text-xs" />
                        </div>
                    </div>
                    <div>
                        <table className="border w-full border-gray-300 rounded-3xl bg-white shadow-xs">
                            <thead>
                                <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center text-sm">
                                    <th>Invoice #</th>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Items Summary</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    billingList && billingList.length > 0 ? (billingList.map((billItem) => {
                                        return (
                                            <tr key={billItem._id} className="border-b border-gray-200 hover:bg-slate-50 transition text-sm">
                                                <td className="text-center font-bold text-slate-900 py-3">{billItem.billId}</td>
                                                <td className="text-center">
                                                    <div className="font-semibold text-slate-900">{billItem.patientName}</div>
                                                    <div className="text-xs text-teal-600 font-medium">{billItem.patientId}</div>
                                                </td>
                                                <td className="text-center text-slate-600 text-xs">{new Date(billItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td className="text-center text-slate-700 max-w-xs truncate">{billItem.itemsSummary}</td>
                                                <td className="text-center font-bold text-slate-900">₹{billItem.totalAmount?.toLocaleString('en-IN')}</td>
                                                <td className="text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                        billItem.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                                        billItem.paymentStatus === "pending" || billItem.paymentStatus === "partially-paid" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                                        "bg-rose-100 text-rose-800 border border-rose-200"
                                                    }`}>
                                                        {billItem.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1.5 justify-center items-center py-2">
                                                        {billItem.paymentStatus === "pending" || billItem.paymentStatus === "partially-paid" ? (
                                                            <>
                                                                <button onClick={() => handleEdit(billItem)} className="border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-medium hover:bg-slate-100 cursor-pointer transition">Edit</button>
                                                                <button onClick={() => handlePayment(billItem)} className="border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl px-2.5 py-1 text-xs font-semibold cursor-pointer transition">Collect Payment</button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => handlePayment(billItem)} className="border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-medium hover:bg-slate-100 cursor-pointer transition">Download Receipt</button>
                                                        )}
                                                        <button
                                                            onClick={() => setDeleteInvoiceTarget(billItem)}
                                                            className="border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl p-1 cursor-pointer transition"
                                                            title="Delete Invoice"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-500">No invoices found</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>

                        {isPayment && billing && (
                            <AddPaymentModal
                                onClose={() => { setIsPayment(false); setBilling(null); loadData() }}
                                billing={billing}
                            />
                        )}
                        {isDownloadReceiptModalOpen && billing && (
                            <AddDownloadReceiptModal
                                onClose={() => { setIsDownloadReceiptModalOpen(false); setBilling(null); }}
                                billing={billing}
                            />
                        )}
                        {isBilling && <InVoiceModal onClose={() => { setIsBilling(false); setEditBilling(null); loadData() }} billing={editBilling} />}
                        {deleteInvoiceTarget && (
                            <DeleteConfirmModal
                                isOpen={!!deleteInvoiceTarget}
                                title="Delete Invoice"
                                itemName={`Invoice ${deleteInvoiceTarget.billId} for ${deleteInvoiceTarget.patientName}`}
                                message={`Are you sure you want to permanently delete invoice ${deleteInvoiceTarget.billId}? This cannot be undone.`}
                                isLoading={isDeleting}
                                onConfirm={handleDeleteInvoice}
                                onClose={() => setDeleteInvoiceTarget(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Billing;