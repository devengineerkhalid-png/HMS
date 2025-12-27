
import React, { useState } from 'react';
import { MOCK_BILLING, MOCK_EXPENSES, MOCK_RESIDENTS } from '../constants';
import StatCard from '../components/StatCard';

interface BillingViewProps {
  residentMode?: boolean;
}

const BillingView: React.FC<BillingViewProps> = ({ residentMode }) => {
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'EXPENSES' | 'PAYMENTS'>('REVENUE');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  const myBills = residentMode ? MOCK_BILLING.filter(b => b.residentId === '1') : MOCK_BILLING;
  const totalRevenue = myBills.filter(b => b.status === 'PAID').reduce((a, b) => a + b.amount, 0);
  const totalUnpaid = myBills.filter(b => b.status === 'UNPAID').reduce((a, b) => a + b.amount, 0);
  const totalExpense = MOCK_EXPENSES.reduce((a, b) => a + b.amount, 0);

  const getResidentName = (id: string) => MOCK_RESIDENTS.find(r => r.id === id)?.name || 'Unknown';

  const handlePayClick = (bill: any) => {
    setSelectedBill(bill);
    setShowPayModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{residentMode ? 'Dues & Fees' : 'Financial Management'}</h2>
          <p className="text-sm text-slate-500 font-medium">Clear overview of all transactions and pending dues.</p>
        </div>
        {!residentMode && (
          <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            <button 
              onClick={() => setActiveTab('REVENUE')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'REVENUE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Revenue
            </button>
            <button 
              onClick={() => setActiveTab('EXPENSES')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'EXPENSES' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expenses
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={residentMode ? "Total Paid" : "Total Collected"} value={`Rs. ${totalRevenue.toLocaleString()}`} icon="fa-sack-dollar" color="bg-emerald-500" />
        <StatCard title="Current Dues" value={`Rs. ${totalUnpaid.toLocaleString()}`} icon="fa-clock-rotate-left" color="bg-amber-500" />
        <StatCard title={residentMode ? "Last Payment" : "Total Expenses"} value={residentMode ? "May 2024" : `Rs. ${totalExpense.toLocaleString()}`} icon="fa-file-invoice-dollar" color="bg-indigo-400" />
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">{residentMode ? 'Detailed Ledger' : 'Transaction Logs'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                {!residentMode && <th className="px-6 py-4">Resident</th>}
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#{bill.id.toUpperCase()}</td>
                  {!residentMode && <td className="px-6 py-4 font-bold text-slate-900">{getResidentName(bill.residentId)}</td>}
                  <td className="px-6 py-4">
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-black uppercase">{bill.type}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">Rs. {bill.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{bill.dueDate}</td>
                  <td className="px-6 py-4 text-right">
                    {bill.status === 'UNPAID' && residentMode ? (
                      <button 
                        onClick={() => handlePayClick(bill)}
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <i className="fa-solid fa-receipt"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl space-y-8 animate-in zoom-in duration-200">
             <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                    <i className="fa-solid fa-wallet"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Secure Payment</h3>
                <p className="text-sm text-slate-500">Processing bill for <strong>{selectedBill?.type}</strong></p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button className="border-2 border-emerald-500 bg-emerald-50 p-4 rounded-3xl flex flex-col items-center gap-2 group transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/EasyPaisa_Logo.png" className="h-6 object-contain" alt="Easypaisa" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Easypaisa</span>
                </button>
                <button className="border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center gap-2 group hover:border-emerald-200 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jazz_Logo.svg/1200px-Jazz_Logo.svg.png" className="h-6 object-contain grayscale opacity-50" alt="JazzCash" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JazzCash</span>
                </button>
             </div>

             <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                   <p className="text-3xl font-black text-slate-900">Rs. {selectedBill?.amount.toLocaleString()}</p>
                </div>
                <input type="text" placeholder="Mobile Wallet Number (03XX-XXXXXXX)" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm font-medium" />
                <div className="flex gap-3">
                  <button onClick={() => setShowPayModal(false)} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={() => setShowPayModal(false)} className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Confirm Payment</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
