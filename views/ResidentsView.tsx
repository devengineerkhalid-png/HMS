
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'ADD_RES' | 'EDIT_RES' | 'ADD_ROOM' | 'DELETE_RES' | null>(null);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      dues: 0,
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
      capacity: 2 
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

  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || [];
    if (currentFeatures.includes(feature)) {
      setFormData({
        ...formData,
        features: currentFeatures.filter((f: string) => f !== feature)
      });
    } else {
      setFormData({
        ...formData,
        features: [...currentFeatures, feature]
      });
    }
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
          onClick={viewMode === 'RESIDENTS' ? handleOpenAddRes : handleOpenAddRoom}
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
              
              {room.features && room.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.features.map((feature, i) => (
                    <span key={i} className="text-[8px] font-black bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-600">{room.currentOccupancy} / {room.capacity} Beds</span>
                 <button className="text-[9px] font-black text-emerald-600 uppercase">View Log</button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && <div className="col-span-full p-20 text-center text-slate-400 font-black text-xs uppercase bg-white rounded-[40px] border border-slate-100">No Rooms Configured</div>}
        </div>
      )}

      {/* Add Resident Modal */}
      {activeModal === 'ADD_RES' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <form onSubmit={saveResident} className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl p-10 animate-in zoom-in max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Formal Resident Enrollment</h3>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Official Verification Data Entry</p>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="text-slate-300 hover:text-slate-900 transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Profile Photo Column */}
                <div className="flex flex-col items-center gap-4">
                   <div className="w-48 h-48 rounded-[40px] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} className="w-full h-full object-cover" alt="Upload Preview" />
                      ) : (
                        <div className="text-center">
                           <i className="fa-solid fa-camera text-4xl text-slate-200 mb-2"></i>
                           <p className="text-[10px] font-black text-slate-300 uppercase">Profile Photo</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Browse File</button>
                      </div>
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   <p className="text-[10px] text-slate-400 text-center font-bold px-4">Requirement: Front-facing clear portrait as per district verification standards.</p>
                </div>

                {/* Form Data Column */}
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                   <div className="col-span-2 border-b border-slate-50 pb-2 mb-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Personal Information</p>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Full Legal Name</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none focus:bg-white border focus:border-emerald-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">CNIC (Identity Card)</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mobile Primary</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Profession (Category)</label>
                      <select required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                         <option value={ResidentType.STUDENT}>Student</option>
                         <option value={ResidentType.EMPLOYEE}>Working Professional</option>
                      </select>
                   </div>

                   <div className="col-span-2 border-b border-slate-50 pb-2 mt-4 mb-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Affiliation & Local Presence</p>
                   </div>
                   <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Institution or Office Name</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.institutionOrOffice} onChange={e => setFormData({...formData, institutionOrOffice: e.target.value})} />
                   </div>
                   <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Permanent Home Address</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} />
                   </div>
                   <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Local Address (Peshawar Branch)</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} />
                   </div>

                   <div className="col-span-2 border-b border-slate-50 pb-2 mt-4 mb-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Emergency & Guardianship</p>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Emergency Contact Person</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Emergency Phone (Mobile)</label>
                      <input required className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} />
                   </div>

                   <div className="col-span-2 border-b border-slate-50 pb-2 mt-4 mb-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Logistics & Accounts</p>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Assigned Room Unit</label>
                      <select className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none border" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})}>
                        <option value="">Pending Assignment</option>
                        {rooms.filter(r => r.status !== 'OCCUPIED').map(r => <option key={r.id} value={r.number}>{r.number} ({r.currentOccupancy}/{r.capacity})</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Enrollment Total Fee (Dues)</label>
                      <input required type="number" className="w-full bg-emerald-50 p-4 rounded-2xl text-sm font-black text-emerald-700 outline-none border border-emerald-100" value={formData.dues} onChange={e => setFormData({...formData, dues: Number(e.target.value)})} />
                   </div>
                </div>
             </div>

             <div className="mt-12 flex gap-4 pt-8 border-t border-slate-50">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-5 bg-slate-100 rounded-3xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel Enrollment</button>
                <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                   <i className="fa-solid fa-file-signature text-emerald-400"></i>
                   Authorize Global Registry Entry
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Add Room Modal */}
      {activeModal === 'ADD_ROOM' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <form onSubmit={saveRoom} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl p-10 animate-in zoom-in overflow-y-auto max-h-[90vh] custom-scrollbar">
             <h3 className="text-2xl font-black text-slate-900 mb-8">Register Room Inventory</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Room Number</label>
                  <input required placeholder="e.g. 405-C" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border outline-none focus:border-slate-900" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Room Category</label>
                  <select className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border outline-none focus:border-slate-900" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="AC_2">AC - 2 Seater</option>
                    <option value="AC_3">AC - 3 Seater</option>
                    <option value="NON_AC_2">Non-AC - 2 Seater</option>
                    <option value="NON_AC_3">Non-AC - 3 Seater</option>
                    <option value="HALL">Dormitory Hall</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bed Capacity</label>
                  <input required type="number" min="1" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border outline-none focus:border-slate-900" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                </div>
             </div>

             <div className="mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Room Features & Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {COMMON_FEATURES.map(feature => (
                     <label key={feature} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.features?.includes(feature) ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={formData.features?.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.features?.includes(feature) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                           {formData.features?.includes(feature) && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                        </div>
                        <span className="text-xs font-black uppercase tracking-tighter">{feature}</span>
                     </label>
                   ))}
                </div>
             </div>

             <div className="mt-8 flex gap-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase">Discard</button>
                <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Confirm Room Registration</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResidentsView;
