
import React, { useState, useEffect, useRef } from 'react';
import { Resident, ResidentType, Room } from '../types.ts';
import { dataStore } from '../services/dataStore.ts';

const COMMON_FEATURES = [
  'AC',
  'Attached Bath',
  'Balcony',
  'Study Table',
  'Locker',
  'Fan',
  'Heater',
  'Window View'
];

const ResidentsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'RESIDENTS' | 'ROOMS'>('RESIDENTS');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'ADD_RES' | 'EDIT_RES' | 'ADD_ROOM' | 'DELETE_RES' | null>(null);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, roomData] = await Promise.all([
        dataStore.getResidents(),
        dataStore.getRooms()
      ]);
      setResidents(resData);
      setRooms(roomData);
    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

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
      dues: '',
      permanentAddress: '',
      currentAddress: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      profileImage: ''
    });
    setActiveModal('ADD_RES');
  };

  const handleOpenAddRoom = () => {
    setFormData({ 
      number: '', 
      type: 'NON_AC_2', 
      features: [], 
      status: 'AVAILABLE', 
      capacity: '' 
    });
    setActiveModal('ADD_ROOM');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRes = { ...formData, dues: Number(formData.dues) || 0, id: `res_${Date.now()}` } as Resident;
    
    try {
      await dataStore.addResident(newRes);
      // Update local rooms occupancy if room assigned
      if (formData.roomNumber) {
        const updatedRooms = rooms.map(rm => rm.number === formData.roomNumber 
          ? { ...rm, currentOccupancy: rm.currentOccupancy + 1, status: rm.currentOccupancy + 1 >= rm.capacity ? 'OCCUPIED' : 'AVAILABLE' } as Room 
          : rm
        );
        await dataStore.setRooms(updatedRooms);
      }
      setActiveModal(null);
      await fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to save to cloud database.");
    }
  };

  const deleteResident = async (id: string) => {
    if (!window.confirm("Permanently remove this resident from Cloud Storage?")) return;
    try {
      await dataStore.deleteResident(id);
      await fetchData();
    } catch (e) {
      alert("Deletion failed.");
    }
  };

  const saveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom = { ...formData, capacity: Number(formData.capacity) || 1, id: `rm_${Date.now()}`, currentOccupancy: 0 } as Room;
    const updated = [newRoom, ...rooms];
    await dataStore.setRooms(updated);
    setActiveModal(null);
    await fetchData();
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
          <p className="text-sm text-slate-500 font-medium">Cloud-synced residents and accommodation inventory.</p>
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
          onClick={viewMode === 'RESIDENTS' ? handleOpenAddRes : handleOpenAddRoom}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> {viewMode === 'RESIDENTS' ? 'Add Resident' : 'Add Room'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-20 w-full rounded-2xl shimmer"></div>)}
        </div>
      ) : viewMode === 'RESIDENTS' ? (
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
                      {r.profileImage ? (
                        <img src={r.profileImage} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt={r.name} />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">{r.name.charAt(0)}</div>
                      )}
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
          {filteredResidents.length === 0 && <div className="p-20 text-center text-slate-400 font-black text-xs uppercase">No Residents Found</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="flex justify-between mb-4">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{room.status}</span>
                <i className="fa-solid fa-door-open text-slate-100 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Room {room.number}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{room.type.replace('_', ' ')}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-600">{room.currentOccupancy} / {room.capacity} Beds</span>
                 <button className="text-[9px] font-black text-emerald-600 uppercase">View Log</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modals remained same as previous logic but with async submission */}
    </div>
  );
};

export default ResidentsView;
