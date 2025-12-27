
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { MOCK_RESIDENTS } from '../constants';

const ReportsView: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [calcInput, setCalcInput] = useState({ fuel: 5000, rooms: 40, hours: 4 });

  const handlePoliceReport = async () => {
    setLoading(true);
    const res = await geminiService.generatePoliceReport(MOCK_RESIDENTS);
    setReport(res || "Error generating report.");
    setLoading(false);
  };

  const handleGenCalc = async () => {
    setLoading(true);
    const res = await geminiService.calculateGeneratorSurcharge(calcInput.fuel, calcInput.rooms, calcInput.hours);
    setReport(res || "Error calculating surcharge.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">AI Intelligent Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <i className="fa-solid fa-building-shield text-2xl"></i>
            <h3 className="font-bold text-lg">Police Verification Assistant</h3>
          </div>
          <p className="text-sm text-slate-500">Automatically generate formal resident lists formatted for Peshawar local police verification (Form-A/B compliance).</p>
          <button 
            disabled={loading}
            onClick={handlePoliceReport}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-file-export mr-2"></i>}
            Generate Official List
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <i className="fa-solid fa-calculator text-2xl"></i>
            <h3 className="font-bold text-lg">Generator Fuel Surcharge</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Fuel Cost</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded text-sm" 
                value={calcInput.fuel} 
                onChange={e => setCalcInput({...calcInput, fuel: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Rooms</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded text-sm" 
                value={calcInput.rooms}
                onChange={e => setCalcInput({...calcInput, rooms: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Hours</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded text-sm" 
                value={calcInput.hours}
                onChange={e => setCalcInput({...calcInput, hours: Number(e.target.value)})}
              />
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={handleGenCalc}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-wand-sparkles mr-2"></i>}
            Calculate & Draft Notice
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-slate-900 text-emerald-400 p-6 rounded-xl border border-slate-700 font-mono text-sm shadow-xl relative animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setReport('')}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
            <i className="fa-solid fa-robot"></i>
            <span className="font-bold uppercase tracking-widest text-xs">AI Generated Content</span>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">
            {report}
          </div>
          <div className="mt-6 flex gap-3">
             <button className="bg-emerald-600 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase hover:bg-emerald-700">
               <i className="fa-solid fa-copy mr-2"></i> Copy Text
             </button>
             <button className="bg-slate-700 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase hover:bg-slate-600">
               <i className="fa-solid fa-print mr-2"></i> Print Document
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
