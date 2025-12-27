
import React, { useState } from 'react';
import { MOCK_BILLING, MOCK_EXPENSES, MOCK_RESIDENTS } from '../constants';
import StatCard from '../components/StatCard';

interface BillingViewProps {
  residentMode?: boolean;
  residentId?: string;
}

const BillingView: React.FC<BillingViewProps> = ({ residentMode, residentId }) => {
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'EXPENSES'>('REVENUE');
  const [showModal, setShowModal] = useState<'INVOICE' | 'EXPENSE' | null>(null);

  const totalRevenue = MOCK_BILLING.filter(b => b.status === 'PAID').reduce((a, b) => a + b.amount, 0);
  const totalExpense = MOCK_EXPENSES.reduce((a, b) => a + b.amount, 0);
  const profit = totalRevenue - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Financial Command</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time profit/loss tracking and digital invoicing.</p>
        </div>
        {!residentMode && (
          <div className="flex gap-3">
             <button onClick={() => setShowModal('EXPENSE')} className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all">Record Expense</button>
             <button onClick={() => setShowModal('INVOICE')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-xl">Generate Invoice</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Collected" value={`Rs. ${totalRevenue.toLocaleString()}`} icon="fa-hand-holding-dollar" color="bg-emerald-500" />
        <StatCard title="Branch Expenses" value={`Rs. ${totalExpense.toLocaleString()}`} icon="fa-money-bill-transfer" color="bg-red-500" />
        <StatCard title="Net Branch P/L" value={`Rs. ${profit.toLocaleString()}`} icon="fa-chart-line" color={profit >= 0 ? "bg-blue-600" : "bg-amber-600"} />
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-50 bg-slate-50/50 p-2">
           <button onClick={() => setActiveTab('REVENUE')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'REVENUE' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}>Revenue Stream</button>
           <button onClick={() => setActiveTab('EXPENSES')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'EXPENSES' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}>Operating Expenses</button>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'REVENUE' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5">Transaction ID</th>
                  <th className="px-8 py-5">Resident</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_BILLING.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400 uppercase">#{b.id}</td>
                    <td className="px-8 py-5 font-black text-slate-700">{MOCK_RESIDENTS.find(r => r.id === b.residentId)?.name}</td>
                    <td className="px-8 py-5 font-black text-slate-900">Rs. {b.amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${b.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-300 hover:text-emerald-600"><i className="fa-solid fa-file-invoice"></i></button>
                    </td>
                  </tr>
                ))}
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
                {MOCK_EXPENSES.map(e => (
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
    </div>
  );
};

export default BillingView;
