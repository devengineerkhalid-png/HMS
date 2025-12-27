
import React, { useState } from 'react';
import { MOCK_RESIDENTS } from '../constants';
import { ResidentType } from '../types';

const ResidentsView: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | ResidentType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MOCK_RESIDENTS.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.cnic.includes(searchTerm);
    const matchesType = filter === 'ALL' || r.type === filter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Resident Directory</h2>
        <div className="flex flex-wrap gap-2">
           <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search Name or CNIC..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
             className="border border-slate-200 px-4 py-2 rounded-lg text-sm focus:outline-none"
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
           >
             <option value="ALL">All Profiles</option>
             <option value={ResidentType.STUDENT}>Students Only</option>
             <option value={ResidentType.EMPLOYEE}>Working Professionals</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Resident</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Room</th>
              <th className="px-6 py-4 font-semibold">Institution/Office</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((resident) => (
              <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {resident.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{resident.name}</p>
                      <p className="text-xs text-slate-500">{resident.cnic}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    resident.type === ResidentType.STUDENT ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {resident.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{resident.roomNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{resident.institutionOrOffice}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {resident.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-slate-400 hover:text-emerald-600 transition-colors"><i className="fa-solid fa-eye"></i></button>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button className="text-slate-400 hover:text-red-600 transition-colors"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <i className="fa-solid fa-user-slash text-4xl mb-3"></i>
            <p>No residents found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentsView;
