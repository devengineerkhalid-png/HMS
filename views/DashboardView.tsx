
import React from 'react';
import StatCard from '../components/StatCard';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS, MOCK_GATE_PASSES } from '../constants';

const DashboardView: React.FC = () => {
  const activeResidents = MOCK_RESIDENTS.filter(r => r.status === 'ACTIVE').length;
  const totalRevenue = MOCK_BILLING.filter(b => b.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const openComplaints = MOCK_COMPLAINTS.filter(c => c.status === 'OPEN').length;
  const pendingFeesCount = MOCK_BILLING.filter(b => b.status === 'UNPAID').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header & Quick Actions */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Control Center</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time overview of Peshawar hostel branches.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <i className="fa-solid fa-cloud-arrow-down text-emerald-500"></i> Local Backup
          </button>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <i className="fa-solid fa-plus mr-2"></i> Quick Admission
          </button>
        </div>
      </header>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Occupancy" value={`${activeResidents} / 100`} icon="fa-user-check" color="bg-blue-600 shadow-blue-200" />
        <StatCard title="Occupancy Rate" value="88%" icon="fa-chart-pie" color="bg-indigo-600 shadow-indigo-200" />
        <StatCard title="Monthly revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} icon="fa-money-bill-trend-up" color="bg-emerald-600 shadow-emerald-200" />
        <StatCard title="Unpaid Dues" value={pendingFeesCount} icon="fa-receipt" color="bg-red-500 shadow-red-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Occupancy Chart Visualization */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900">Occupancy Trends</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Students</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Employees</span>
            </div>
          </div>
          
          <div className="flex items-end gap-4 h-48 mb-6">
            {[65, 80, 45, 90, 70, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                <div className="w-full bg-slate-50 rounded-t-xl relative overflow-hidden flex flex-col justify-end" style={{ height: '100%' }}>
                  <div 
                    className="w-full bg-emerald-500 rounded-t-xl group-hover:bg-emerald-600 transition-all duration-1000 ease-out" 
                    style={{ height: `${val}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-slate-900/5">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Day {i+1}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase">Mon</span>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                  <p className="text-lg font-black text-emerald-600">+12%</p>
               </div>
               <div className="h-8 w-[1px] bg-slate-100"></div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vacant</p>
                  <p className="text-lg font-black text-slate-900">12 Beds</p>
               </div>
            </div>
            <button className="text-emerald-600 font-bold text-sm hover:underline">Full Analytics →</button>
          </div>
        </div>

        {/* Local Logistics Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
               <i className="fa-solid fa-bolt text-8xl"></i>
            </div>
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PESCO Tracker
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Load Shedding</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black">2:00 PM</span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">Starts in 45m</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Gen Diesel Level</span>
                  <span className="text-emerald-400">78%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[78%]"></div>
                </div>
              </div>

              <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                Manual Gen Start
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
               <i className="fa-solid fa-building-shield text-blue-500"></i>
               Police Compliance
             </h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-500 font-medium">Form-A Submission</span>
                   <span className="text-emerald-600 font-black">100% Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-500 font-medium">Pending Approvals</span>
                   <span className="text-amber-500 font-black">02 Records</span>
                </div>
                <button className="w-full mt-2 border-2 border-dashed border-slate-200 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all">
                  Sync with Station Database
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Logs & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Security Logs */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900">Gate Activity</h3>
              <button className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase">View History</button>
           </div>
           <div className="space-y-6">
              {[
                { type: 'IN', name: 'Ahmad Khan', room: '102-A', time: '10:24 AM' },
                { type: 'OUT', name: 'Zia-ur-Rehman', room: '305-B', time: '09:15 AM' },
                { type: 'IN', name: 'Salman Khan (Visitor)', room: '102-A', time: '08:45 AM' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                      {log.type}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{log.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Room {log.room}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{log.time}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Kitchen/Mess Mini Report */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900">Kitchen Status</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Healthy</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Alerts</p>
                 <p className="text-lg font-black text-slate-900">4 Items Low</p>
                 <p className="text-[10px] text-red-500 font-bold mt-1">Chicken, Cooking Oil</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mess Opt-Out</p>
                 <p className="text-lg font-black text-slate-900">12 residents</p>
                 <p className="text-[10px] text-slate-500 font-bold mt-1">Saving Rs. 1,800 today</p>
              </div>
           </div>
           <button className="w-full mt-6 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
             Audit Kitchen Inventory
           </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
