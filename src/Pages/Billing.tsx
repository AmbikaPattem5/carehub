import { useState, useEffect } from "react"
import InVoiceModal from "../Components/InVoiceModal"
import type { Billing, StatisticsResponse } from "../types/BillingTypes"
import api from "../services/api"
import toast from "react-hot-toast";
import AddPaymentModal from "../Components/AddPaymentModal"
import { Search } from "lucide-react"
import type { BillingSearch } from "../types/BillingTypes"
import AddDownloadReceiptModal from "../Components/AddDownloadReceiptModal"
function Billing() {
    const initialFormData: BillingSearch = {
        statusData: "",
        search: "",
        date: ""
    }
    const [isBilling, setIsBilling] = useState<boolean>(false)
    const [isPayment, setIsPayment] = useState<boolean>(false)
    const [billingList, setBillingList] = useState<Billing[]>([])
    const [billing, setBilling] = useState<Billing | null>(null)
    const [isSelect, setIsSelect] = useState<string>("all")
    const [formData, setFormData] = useState<BillingSearch>(initialFormData);
    const [statistics, setStatistics] = useState<StatisticsResponse | undefined>(undefined)
    const [isDownloadReceiptModalOpen, setIsDownloadReceiptModalOpen] = useState<boolean>(false)
    const [editBilling, setEditBilling] = useState<Billing | null>(null)
    enum PaymentStatus {
        all = "All",
        paid = "Paid",
        pending = "Pending",
        cancelled = "Cancelled"
    }
    function handleEdit(billing: Billing) {
        setIsBilling(true);
        setEditBilling(billing)
    }

    function handlePayment(billing: Billing) {
        if (billing.paymentStatus === "pending") {
            setIsPayment(true);
            setBilling(billing)
        }
        else if (billing.paymentStatus === "paid") {
            setIsDownloadReceiptModalOpen(true);
            setBilling(billing)
        }
    }
    function handleStatus(key, value) {
        setIsSelect(key);
        setFormData({ ...formData, statusData: key })
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
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
                console.log(response.data.bills)
                setBillingList(response.data.bills)
                setStatistics(response.data.stats)
            }

        }
        catch (err) {
            toast.error(err?.response?.data?.message)
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
                            <button className="bg-emerald-500 hover:bg-emerald-600 border rounded-xl  text-white font-bold py-2 px-4 rounded cursor-pointer" onClick={() => setIsBilling(true)}>Create Invoice</button>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="flex-1 border border-gray-300 rounded-xl">
                            <h4>Total Revenue</h4>
                            <h1>{statistics?.totalRevenue}</h1>
                            <p>Trend</p>
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-xl">
                            <h4>Pending Collections</h4>
                            <h1>{statistics?.pendingAmount}</h1>
                            <p>{statistics?.pendingCount} pending invoices</p>

                        </div>

                        <div className="flex-1 border border-gray-300 rounded-xl">
                            <h4>Today's Collections</h4>
                            <h1>{statistics?.pendingAmount}</h1>
                            <p>cash,card & UPI</p>
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-xl">
                            <h4>Invoices Generated</h4>
                            <h1>{statistics?.totalInvoicesCount}</h1>
                            <p>today</p>
                        </div>
                    </div>
                    <div className="flex flex-row gap-6 border border-gray-300 rounded-xl p-2 ">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>

                            <input type="text" name="search" value={formData.search} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <div>
                                {Object.entries(PaymentStatus).map(([key, value]) => {
                                    return (
                                        <button type="button" key={key} value={value} onClick={() => handleStatus(key, value)} className={`border border-gray-100 text-white rounded-xl p-1 m-1 cursor-pointer ${isSelect === key ? "bg-emerald-500" : "bg-gray-400 hover:bg-emerald-500"}`}>{value}</button>

                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <label>Date </label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="border border-gray-300 hover:bg-gray-300 cursor-pointer rounded-xl p-2 m-2" />
                        </div>


                    </div>
                    <div>
                        <table className="border w-full border-gray-300 rounded-3xl">
                            <thead>
                                <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
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
                                    billingList && billingList.length > 0 ? (billingList.map((billing) => {

                                        return (
                                            <tr key={billing._id} className="border-b border-gray-300">
                                                <td className="text-center">{billing.billId}</td>
                                                <td className="text-center">{billing.patientName} . {billing.patientId}</td>
                                                <td className="text-center">{billing.createdAt}</td>
                                                <td className="text-center">{billing.itemsSummary}</td>
                                                <td className="text-center">{billing.totalAmount}</td>
                                                <td className={`text-center ${billing.paymentStatus === "paid" ? "bg-green-300 text-white text-center rounded-xl" : "bg-red-300 text-white text-center rounded-xl"}`}>{billing.paymentStatus}</td>
                                                <td>
                                                    <div className="flex gap-2 justify-center items-center">
                                                        {/* <button type="button" onClick={() => handlePayment(billing)} className="border border-gray-300 rounded-xl p-1 hover:bg-gray-300 cursor-pointer">{billing.paymentStatus == "pending" ? "Collect Payment" : "Download Receipt"}</button> */}
                                                        {billing.paymentStatus == "pending" ?
                                                            <div>
                                                                <button onClick={() => handleEdit(billing)} className="border border-gray-300 rounded-xl p-1 bg-blue-200 hover:bg-blue-400 cursor-pointer">Edit</button>
                                                                <button onClick={() => handlePayment(billing)} className="border border-gray-300 rounded-xl p-1 bg-emerald-200 hover:bg-emerald-400 cursor-pointer">Collection Payment</button>
                                                            </div> :
                                                            <button onClick={() => handlePayment(billing)} className="border border-gray-300 rounded-xl p-1 bg-emerald-200 hover:bg-emerald-400 cursor-pointer">Download Receipt</button>
                                                        }


                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })) : (
                                        <tr>
                                            <td colSpan={7} className="text-center py-4">No patients found</td>
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
                        {isDownloadReceiptModalOpen && (
                            <AddDownloadReceiptModal onClose={() => { setIsDownloadReceiptModalOpen(false) }}
                                billing={billing}

                            />
                        )}
                        {isBilling && <InVoiceModal onClose={() => { setIsBilling(false); loadData() }} billing={editBilling} />}
                    </div>
                </div>
            </div>

        </div>


    )
}
export default Billing;