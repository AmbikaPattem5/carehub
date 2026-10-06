import type { Billing } from "../types/BillingTypes"
import logo from "../assets/logo.png"
import { Printer, Download, X } from "lucide-react"

function AddDownloadReceiptModal({ billing, onClose }: { billing: Billing, onClose: () => void }) {
    function handlePrint() {
        const receiptElement = document.getElementById("receipt-content");
        if (!receiptElement) return;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
      <html>
        <head>
          <title>Receipt_${billing.billId}</title>
          <link rel="stylesheet" href="/src/index.css">
          <style>
            body { font-family: sans-serif; padding: 24px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; }
            th { background-color: #f8fafc; font-weight: 600; }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
        </body>
      </html>
    `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }

    const formattedDate = billing.createdAt
        ? new Date(billing.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[94vh] transition-all animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Invoice & Payment Receipt - #{billing.billId}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Printable Receipt Paper Sheet */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs max-w-lg mx-auto text-slate-800 space-y-5" id="receipt-content">
                        {/* Centered Brand Header */}
                        <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                            <div className="flex items-center justify-center gap-2">
                                <img src={logo} alt="CareHub" className="w-8 h-8 object-contain" />
                                <div className="text-left">
                                    <h4 className="font-extrabold text-lg text-slate-900 leading-tight">CareHub</h4>
                                    <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Clinic System</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 pt-1">
                                104 Healthcare Boulevard, Indiranagar, Bengaluru
                            </p>
                            <p className="text-xs text-slate-500">
                                Ph: 9876543210 • Email: contact@carehub.com
                            </p>
                        </div>

                        {/* Invoice & Patient Meta Information */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <div className="font-bold text-slate-900 text-sm">
                                    Invoice #{billing.billId}
                                </div>
                                <div className="text-slate-500 pt-1">
                                    <strong className="text-slate-700">Billed To:</strong>
                                    <p className="text-slate-900 font-semibold">{billing.patientName} ({billing.patientId})</p>
                                    <p className="text-slate-600">Phone: {billing.patientPhone || "9876543210"}</p>
                                </div>
                            </div>

                            <div className="space-y-1 text-right">
                                <div className="text-slate-600 font-medium">
                                    <strong className="text-slate-700">Date: </strong>{formattedDate}
                                </div>
                                <div className="text-slate-500 pt-1">
                                    <strong className="text-slate-700">Consulting Doctor:</strong>
                                    <p className="text-slate-900 font-semibold">Dr. {billing.doctorName?.replace(/^Dr\.\s*/i, '') || "Priya Sharma"}</p>
                                    <p className="text-slate-600">General Medicine</p>
                                </div>
                            </div>
                        </div>

                        {/* Itemized Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                                        <th className="py-2.5 px-3">Item Description</th>
                                        <th className="py-2.5 px-3 text-center w-12">Qty</th>
                                        <th className="py-2.5 px-3 text-right w-20">Rate</th>
                                        <th className="py-2.5 px-3 text-right w-24">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {billing.items && billing.items.length > 0 ? (
                                        billing.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-3 text-center text-slate-500">{index + 1}</td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description}</td>
                                                <td className="py-2.5 px-3 text-center text-slate-700">{item.quantity ?? 1}</td>
                                                <td className="py-2.5 px-3 text-right text-slate-700">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Number(item.amount || 0).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-4 text-center text-slate-400">
                                                No itemized charges listed.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Breakdown & PAID Stamp */}
                        <div className="flex items-center justify-between pt-2">
                            {/* Paid Stamp Badge */}
                            <div>
                                {billing.paymentStatus === 'paid' && (
                                    <div className="border-2 border-emerald-600 text-emerald-600 font-extrabold px-3 py-1 rounded-md rotate-[-12deg] tracking-wider text-sm uppercase shadow-xs">
                                        PAID
                                    </div>
                                )}
                            </div>

                            {/* Calculation Summary */}
                            <div className="space-y-1 text-xs text-right min-w-[160px]">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-slate-800">₹{Number(billing.subtotal || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Discount:</span>
                                    <span className="font-semibold text-slate-800">₹{Number(billing.discount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                                    <span>Total Paid:</span>
                                    <span className="text-teal-700">₹{Number(billing.amountPaid || billing.totalAmount || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Footer note */}
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                            <strong>Payment Method: </strong>
                            <span className="uppercase font-semibold text-slate-700">{billing.paymentMethod || "UPI"}</span>
                            {billing.transactionRef && (
                                <span className="text-slate-500"> (Ref: {billing.transactionRef})</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                    >
                        Close
                    </button>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Printer size={15} /> Print Receipt
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Download size={14} /> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddDownloadReceiptModal;