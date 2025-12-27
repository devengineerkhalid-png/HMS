
import React from 'react';
import { MOCK_MEAL_PLAN, MOCK_INVENTORY } from '../constants';

interface MessViewProps {
  residentMode?: boolean;
}

const MessView: React.FC<MessViewProps> = ({ residentMode }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{residentMode ? 'Hostel Meal Plan' : 'Mess & Utility Management'}</h2>
          <p className="text-sm text-slate-500 font-medium">Weekly schedule and meal opt-out options.</p>
        </div>
        {!residentMode && (
          <button className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
             <i className="fa-solid fa-calendar-plus"></i> Edit Menu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
             <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Weekly Menu Planner</h3>
             <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">May Week 4</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Day</th>
                  <th className="px-8 py-5 text-amber-600">Breakfast</th>
                  <th className="px-8 py-5 text-emerald-600">Lunch</th>
                  <th className="px-8 py-5 text-indigo-600">Dinner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_MEAL_PLAN.map((meal) => (
                  <tr key={meal.day} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6 font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{meal.day}</td>
                    <td className="px-8 py-6 text-slate-500 font-bold group-hover:text-slate-900 transition-colors">{meal.breakfast}</td>
                    <td className="px-8 py-6 text-slate-500 font-bold group-hover:text-slate-900 transition-colors">{meal.lunch}</td>
                    <td className="px-8 py-6 text-slate-500 font-bold group-hover:text-slate-900 transition-colors">{meal.dinner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {residentMode && (
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                    <i className="fa-solid fa-utensils"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Meal Off Request?</p>
                    <p className="text-xs text-slate-500 font-medium">Opt-out 24h before to save mess charges.</p>
                  </div>
               </div>
               <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  Mark Meal Off (Today)
               </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8">
              <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center justify-between">
                Mess Timings
                <i className="fa-solid fa-clock text-slate-300"></i>
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Breakfast', time: '07:30 - 09:00', icon: 'fa-mug-hot', color: 'text-amber-500' },
                   { label: 'Lunch', time: '13:00 - 14:30', icon: 'fa-cloud-sun', color: 'text-emerald-500' },
                   { label: 'Dinner', time: '20:00 - 21:30', icon: 'fa-moon', color: 'text-indigo-500' }
                 ].map(slot => (
                   <div key={slot.label} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${slot.color} transition-all group-hover:scale-110`}>
                        <i className={`fa-solid ${slot.icon}`}></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{slot.label}</p>
                        <p className="text-sm font-black text-slate-900 mt-1">{slot.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {!residentMode && (
             <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                <h3 className="font-black text-sm mb-6 flex items-center gap-3">
                  <i className="fa-solid fa-boxes-stacked text-emerald-400"></i>
                  Low Stock
                </h3>
                <div className="space-y-4">
                   {MOCK_INVENTORY.slice(0, 2).map(item => (
                     <div key={item.id} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <span>{item.name}</span>
                           <span className="text-emerald-400">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full">
                           <div className="bg-emerald-500 h-full w-[45%]"></div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MessView;
