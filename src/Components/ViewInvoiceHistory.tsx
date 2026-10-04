import type { Billing } from "../types/BillingTypes"
import type { StatisticsResponse } from "../types/BillingTypes"

function ViewInvoiceHistory({ invoiceData, invoiceStats }: { invoiceData: Billing[], invoiceStats: StatisticsResponse }) {
    console.log("Invoice Data", invoiceData)
    return (
        <div>
            <table className="border border-gray-300 rounded-2xl">
                <thead className="border-b border-gray-300">
                    <tr>
                        <th className="text-center p-2 m-2">Invoice ID</th>
                        <th className="text-center p-2 m-2">Date</th>
                        <th className="text-center p-2 m-2">Services</th>
                        <th className="text-center p-2 m-2">Total Amount</th>
                        <th className="text-center p-2 m-2">Paid Amount</th>
                        <th className="text-center p-2 m-2">Payment Status</th>
                    </tr>
                </thead>
                <tbody>
                    {invoiceData?.map((item, index) => {
                        return (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="text-center p-2 m-2">{item.billId}</td>
                                <td className="text-center p-2 m-2">{item.createdAt}</td>
                                <td className="text-center p-2 m-2">{item.itemsSummary}</td>
                                <td className="text-center p-2 m-2">{item.totalAmount}</td>
                                <td className="text-center p-2 m-2">{item.amountPaid}</td>
                                <td className="text-center p-2 m-2">{item.paymentStatus}</td>
                            </tr>
                        )

                    })}

                </tbody>
            </table>
        </div>
    )
}

export default ViewInvoiceHistory;