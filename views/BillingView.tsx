
import React, { useState, useEffect } from 'react';
import { BillingRecord, Resident } from '../types';
import { dataStore } from '../services/dataStore';
import StatCard from '../components/StatCard';

interface BillingViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const BillingView: React.FC<BillingViewProps> = ({ residentMode, residentId }) => {
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'EXPENSES'>('REVENUE');
  const [showModal, setShowModal] = useState<'INVOICE' | 'EXPENSE' | null>(null);
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [allBills, allResidents] = await Promise.all([
        dataStore.getBilling(),
        dataStore.getResidents()
      ]);
      
      if (residentMode && residentId) {
        setBillingData(allBills.filter(b => b.residentId === residentId));
      } else {
        setBillingData(allBills);
      }
      setResidents(allResidents);
      setLoading(false);
    };
    fetchData();
  }, [residentMode, residentId]);

  // Admin Calculations
  const totalRevenue = billingData.filter(b => b.status === 'PAID').reduce((a, b) => a + b.amount, 0);
  // Using a hardcoded mock value for expenses since we haven't implemented full expense storage yet, 
  // but in a real app this would come from dataStore
  const totalExpense = 56400; 
  const profit = totalRevenue - totalExpense;

  // Resident Specific Calculations
  const myPendingDues = billingData.filter(b => b.status === 'UNPAID').reduce((a, b) => a + b.amount, 0);
  const myTotalPaid = billingData.filter(b => b.status === 'PAID').reduce((a, b) => a + b.amount, 0);
  const nextDueDate = billingData.find(b => b.status === 'UNPAID')?.dueDate || 'N/A';

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {residentMode ? 'Dues & Fees Portal' : 'Financial Command'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {residentMode ? 'Manage your invoices and track payment history.' : 'Real-time profit/loss tracking and digital invoicing.'}
          </p>
        </div>
        {!residentMode && (
          <div className="flex gap-3">
             <button onClick={() => setShowModal('EXPENSE')} className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all">Record Expense</button>
             <button onClick={() => setShowModal('INVOICE')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-xl">Generate Invoice</button>
          </div>
        )}
      </div>

      {/* Conditional Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {residentMode ? (
          <>
            <StatCard title="Total Payable" value={`Rs. ${myPendingDues.toLocaleString()}`} icon="fa-clock-rotate-left" color="bg-red-500 shadow-lg shadow-red-100" />
            <StatCard title="Total Paid (Lifetime)" value={`Rs. ${myTotalPaid.toLocaleString()}`} icon="fa-check-double" color="bg-emerald-500 shadow-lg shadow-emerald-100" />
            <StatCard title="Next Due Date" value={nextDueDate} icon="fa-calendar-exclamation" color="bg-slate-900 shadow-lg shadow-slate-200" />
          </>
        ) : (
          <>
            <StatCard title="Total Collected" value={`Rs. ${totalRevenue.toLocaleString()}`} icon="fa-hand-holding-dollar" color="bg-emerald-500" />
            <StatCard title="Branch Expenses" value={`Rs. ${totalExpense.toLocaleString()}`} icon="fa-money-bill-transfer" color="bg-red-500" />
            <StatCard title="Net Branch P/L" value={`Rs. ${profit.toLocaleString()}`} icon="fa-chart-line" color={profit >= 0 ? "bg-blue-600" : "bg-amber-600"} />
          </>
        )}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-50 bg-slate-50/50 p-2">
           <button 
             onClick={() => setActiveTab('REVENUE')} 
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REVENUE' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
           >
             {residentMode ? 'Payment History' : 'Revenue Stream'}
           </button>
           
           {!residentMode && (
             <button 
               onClick={() => setActiveTab('EXPENSES')} 
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
             >
               Operating Expenses
             </button>
           )}
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'REVENUE' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5">Invoice ID</th>
                  {!residentMode && <th className="px-8 py-5">Resident</th>}
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {billingData.length > 0 ? billingData.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400 uppercase">#{b.id}</td>
                    {!residentMode && <td className="px-8 py-5 font-black text-slate-700">{residents.find(r => r.id === b.residentId)?.name || 'Unknown'}</td>}
                    <td className="px-8 py-5 font-black text-slate-900">Rs. {b.amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${b.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {residentMode && b.status === 'UNPAID' && (
                          <button className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-all uppercase tracking-widest">Pay Now</button>
                        )}
                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-all border border-slate-100">
                          <i className="fa-solid fa-file-invoice"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={residentMode ? 4 : 5} className="px-8 py-20 text-center text-slate-300 font-black text-xs uppercase tracking-widest">No billing records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5">Expense Title</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Mocking expenses for UI demonstration since it's not in DB yet */}
                {[
                  { id: 'e1', title: 'PESCO Electricity Bill', category: 'UTILITIES', amount: 45000, date: '2024-05-15' },
                  { id: 'e2', title: 'Water Tanker (3 Units)', category: 'MAINTENANCE', amount: 6000, date: '2024-05-18' },
                  { id: 'e3', title: 'Generator Diesel (20L)', category: 'FUEL', amount: 5400, date: '2024-05-20' }
                ].map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-700">{e.title}</td>
                    <td className="px-8 py-5">
                      <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-600">{e.category}</span>
                    </td>
                    <td className="px-8 py-5 font-black text-red-500">Rs. {e.amount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {residentMode && (
        <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5"><i className="fa-solid fa-credit-card text-9xl"></i></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Digital Payment Instructions</h3>
              <p className="text-xs text-slate-400 font-bold mb-6">Fast and secure settlements via Easypaisa or JazzCash.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Method 1: Easypaisa</p>
                    <p className="text-sm font-bold">A/C: 03451234567</p>
                    <p className="text-[10px] text-slate-500 mt-1">Title: Frontier Hostel Management</p>
                 </div>
                 <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Method 2: JazzCash</p>
                    <p className="text-sm font-bold">A/C: 03129876543</p>
                    <p className="text-[10px] text-slate-500 mt-1">Title: Frontier Hostel Management</p>
                 </div>
              </div>
              <p className="mt-6 text-[10px] text-slate-500 italic">
                * Please upload a screenshot of your payment receipt in the 'My Portal' section or present it to the Warden for manual verification.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
