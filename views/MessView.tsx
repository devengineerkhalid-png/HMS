
import React, { useState } from 'react';
import { MOCK_MEAL_PLAN, MOCK_INVENTORY } from '../constants';

const MessView: React.FC<{ residentMode?: boolean }> = ({ residentMode }) => {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [activeView, setActiveView] = useState<'MENU' | 'INVENTORY'>('MENU');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Hostel Nutrition</h2>
          <p className="text-sm text-slate-500 font-medium">Digital mess logs and automated inventory tracking.</p>
        </div>
        {!residentMode && (
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
             <button onClick={() => setActiveView('MENU')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${activeView === 'MENU' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Menu Board</button>
             <button onClick={() => setActiveView('INVENTORY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${activeView === 'INVENTORY' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Kitchen Stock</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
           {activeView === 'MENU' ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/30 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                   <tr>
                     <th className="px-8 py-5">Day</th>
                     <th className="px-8 py-5 text-amber-600">Breakfast</th>
                     <th className="px-8 py-5 text-emerald-600">Lunch</th>
                     <th className="px-8 py-5 text-indigo-600">Dinner</th>
                     {!residentMode && <th className="px-8 py-5 text-right">Edit</th>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {MOCK_MEAL_PLAN.map(m => (
                     <tr key={m.day} className="hover:bg-slate-50 transition-all">
                       <td className="px-8 py-6 font-black text-slate-900">{m.day}</td>
                       <td className="px-8 py-6 font-bold text-slate-500">{m.breakfast}</td>
                       <td className="px-8 py-6 font-bold text-slate-500">{m.lunch}</td>
                       <td className="px-8 py-6 font-bold text-slate-500">{m.dinner}</td>
                       {!residentMode && <td className="px-8 py-6 text-right"><button className="text-slate-300 hover:text-emerald-500"><i className="fa-solid fa-pen"></i></button></td>}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {inventory.map(item => (
                  <div key={item.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 group">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="font-black text-slate-900">{item.name}</h4>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">In Stock</span>
                     </div>
                     <div className="flex items-end justify-between">
                        <div>
                           <p className="text-3xl font-black text-slate-900">{item.quantity} <span className="text-lg text-slate-400">{item.unit}</span></p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Last Arrival: {new Date().toLocaleDateString()}</p>
                        </div>
                        <button className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all"><i className="fa-solid fa-plus text-xs"></i></button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><i className="fa-solid fa-bowl-food text-9xl"></i></div>
              <h3 className="font-black text-sm mb-6 flex items-center gap-3"><i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Mess Opt-Outs</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Opt-Outs Today</span>
                    <span className="font-black text-emerald-400">14 Students</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Projected Waste Reduction</span>
                    <span className="font-black text-blue-400">~4.5 KG</span>
                 </div>
                 <button className="w-full bg-white/10 border border-white/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Download Prep List</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MessView;
