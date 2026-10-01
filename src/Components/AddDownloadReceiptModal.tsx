import type { Billing } from "../types/BillingTypes"
import logo from "../assets/logo.png"


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
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in zoom-in-95 duration-200">
                <div className="p-2 m-2" id="receipt-content">
                    <h1>Invoice & Payment Receipt - #{billing.billId}</h1>
                    {/* Modal Header */}
                    <div className="border border-gray-300 runded-xl">
                        <div className="flex flex-col items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col">
                                <div className="flex flex-row items-center justify-center">
                                    <div>
                                        <img src={logo} alt="logo" height={60} width={60} className="bg-gradient-to-br from-blue-500 to-cyan-400 text-transparent bg-clip-text" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xl">CareHub</p>
                                        <p className="font-semibold text-sm">Clinic System</p>

                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p>104 HealthCare Boulevard, Indira Nagar, Bengaluru</p>
                                    <p>Ph:9876543210 . Email: cano@gmail.com </p>
                                </div>
                            </div>

                        </div>
                        <div className="flex justify-between p-2">
                            <p>Invoice #{billing.billId}</p>
                            <p>Date: {billing.createdAt} </p>
                        </div>
                        <div className="flex justify-between p-2">
                            <div className="flex flex-col">
                                <h4>Billed To:</h4>
                                <div className="flex flex-col">
                                    <p>{billing.patientName} ({billing.patientId})</p>
                                    <p>{billing.patientPhone}</p>
                                </div>

                            </div>
                            <div>
                                <h4>Consulting Doctor:  </h4>
                                <p>Dr. {billing.doctorName}</p>
                            </div>
                        </div>
                        {/* Table */}
                        <div>
                            <table className="border w-full border-gray-300 rounded-3xl border border-gray-300 p-2">
                                <thead>
                                    <tr className="border-b border-gray-300 bg-gray-200 h-10 font-semibold text-center">
                                        <th>#</th>
                                        <th>Item Description</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billing.items.map((item, index) => {
                                        return (
                                            <tr key={index} className="border-b border-gray-300">
                                                <td className="h-10 text-center">{index + 1}</td>
                                                <td className="h-10 text-center">{item.description}</td>
                                                <td className="h-10 text-center">{item.quantity}</td>
                                                <td className="h-10 text-center">{item.unitPrice}</td>
                                                <td className="h-10 text-center">{item.amount}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col items-end border border-gray-300">
                            <p>Subtotal:{billing.subtotal}</p>
                            <p>Discount:{billing.discount}</p>
                        </div>
                        <div className="flex flex-col items-end border border-gray-300">
                            <p>Total Paid: {billing.amountPaid}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <div>
                        <button type="button" onClick={onClose} className="border border-gray-100 bg-gray-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Close</button>
                    </div>
                    <div>
                        <button type="button" onClick={handlePrint} className="border border-gray-100 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl p-1 m-1 cursor-pointer">Print Receipt</button>

                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddDownloadReceiptModal;