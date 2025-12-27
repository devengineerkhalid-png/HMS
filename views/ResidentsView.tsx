
import React, { useState, useEffect } from 'react';
import { Resident, ResidentType, Room } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

const ResidentsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'RESIDENTS' | 'ROOMS'>('RESIDENTS');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'ADD_RES' | 'EDIT_RES' | 'ADD_ROOM' | 'DELETE_RES' | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setResidents(dataStore.getResidents());
    setRooms(dataStore.getRooms());
  }, []);

  const handleOpenAddRes = () => {
    setFormData({ 
      name: '', 
      cnic: '', 
      phone: '', 
      parentName: '', 
      parentPhone: '', 
      type: ResidentType.STUDENT, 
      institutionOrOffice: '',
      roomNumber: '',
      status: 'ACTIVE', 
      admissionDate: new Date().toISOString().split('T')[0], 
      dues: 0 
    });
    setActiveModal('ADD_RES');
  };

  const saveResident = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes = { ...formData, id: `res_${Date.now()}` } as Resident;
    const updated = [newRes, ...residents];
    setResidents(updated);
    dataStore.setResidents(updated);
    
    if (formData.roomNumber) {
      const roomUpdate = rooms.map(rm => rm.number === formData.roomNumber 
        ? { ...rm, currentOccupancy: rm.currentOccupancy + 1, status: rm.currentOccupancy + 1 >= rm.capacity ? 'OCCUPIED' : 'AVAILABLE' } as Room 
        : rm
      );
      setRooms(roomUpdate);
      dataStore.setRooms(roomUpdate);
    }
    
    setActiveModal(null);
  };

  const deleteResident = (id: string) => {
    const updated = residents.filter(r => r.id !== id);
    setResidents(updated);
    dataStore.setResidents(updated);
  };

  const saveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom = { ...formData, id: `rm_${Date.now()}`, currentOccupancy: 0 } as Room;
    const updated = [newRoom, ...rooms];
    setRooms(updated);
    dataStore.setRooms(updated);
    setActiveModal(null);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.cnic.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Management Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Full control over residents and accommodation inventory.</p>
        </div>
        
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          <button onClick={() => setViewMode('RESIDENTS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'RESIDENTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Residents</button>
          <button onClick={() => setViewMode('ROOMS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ROOMS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Rooms</button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"></i>
          <input 
            type="text" 
            placeholder={viewMode === 'RESIDENTS' ? "Name or CNIC..." : "Room Number..."} 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={viewMode === 'RESIDENTS' ? handleOpenAddRes : () => { setFormData({ number: '', type: 'AC_2', features: [], status: 'AVAILABLE', capacity: 2 }); setActiveModal('ADD_ROOM'); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> {viewMode === 'RESIDENTS' ? 'Add Resident' : 'Add Room'}
        </button>
      </div>

      {viewMode === 'RESIDENTS' ? (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Profile</th>
                <th className="px-8 py-5">Room</th>
                <th className="px-8 py-5">Dues</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">{r.name.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1">{r.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{r.cnic}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">{r.roomNumber || 'Unassigned'}</td>
                  <td className="px-8 py-5 text-sm font-black text-red-500">Rs. {r.dues.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">{r.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => deleteResident(r.id)} className="text-slate-300 hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group">
              <div className="flex justify-between mb-4">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{room.status}</span>
                <i className="fa-solid fa-door-open text-slate-100 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Room {room.number}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{room.type}</p>
            </div>
          ))}
        </div>
      )}

      {activeModal === 'ADD_RES' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <form onSubmit={saveResident} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl p-10">
             <h3 className="text-2xl font-black text-slate-900 mb-8">New Admission</h3>
             <div className="grid grid-cols-2 gap-6">
                <input required placeholder="Full Name" className="w-full bg-slate-50 p-4 rounded-2xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required placeholder="CNIC" className="w-full bg-slate-50 p-4 rounded-2xl" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
             </div>
             <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl">Register</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResidentsView;
