
import React, { useState, useRef } from 'react';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';
import StatCard from '../components/StatCard';
import { Complaint, Resident } from '../types';

const ResidentPortal: React.FC<{ residentId: string }> = ({ residentId }) => {
  const [resident, setResident] = useState<Resident>(
    MOCK_RESIDENTS.find(r => r.id === residentId) || MOCK_RESIDENTS[0]
  );
  const [complaints, setComplaints] = useState<Complaint[]>(
    MOCK_COMPLAINTS.filter(c => c.residentId === residentId)
  );
  const [myBills, setMyBills] = useState(MOCK_BILLING.filter(b => b.residentId === residentId));
  
  const [activeModal, setActiveModal] = useState<'PAY' | 'COMPLAINT' | 'PROFILE' | 'ROOM_CHANGE' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalDues = myBills.filter(b => b.status === 'UNPAID').reduce((acc, b) => acc + b.amount, 0);

  // Modal State Handlers
  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setResident(prev => ({
      ...prev,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      parentPhone: formData.get('parentPhone') as string,
      institutionOrOffice: formData.get('institution') as string,
    }));
    setActiveModal(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResident(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLodgeComplaint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      residentId: resident.id,
      title: formData.get('title') as string,
      category: formData.get('category') as any,
      status: 'OPEN',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setComplaints([newComplaint, ...complaints]);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload}
      />

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="relative group">
            <img 
              src={resident.profileImage || `https://ui-avatars.com/api/?name=${resident.name}&background=10b981&color=fff&size=256`} 
              className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white group-hover:brightness-90 transition-all cursor-pointer" 
              alt="Profile" 
              onClick={() => fileInputRef.current?.click()}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <i className="fa-solid fa-camera text-white text-xl"></i>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-slate-900 text-white p-2 rounded-full shadow-md hover:bg-slate-800"
            >
              <i className="fa-solid fa-camera text-xs"></i>
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900">{resident.name}</h2>
            <p className="text-slate-500 font-medium">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2">{resident.type}</span>
              {resident.institutionOrOffice}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveModal('PROFILE')}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <i className="fa-solid fa-user-pen mr-2"></i> Update Profile
            </button>
            <button 
              onClick={() => setActiveModal('ROOM_CHANGE')}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              <i className="fa-solid fa-shuffle mr-2"></i> Apply Room Change
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Billing Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Dues</p>
              <h3 className={`text-3xl font-black mt-1 ${totalDues > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                Rs. {totalDues.toLocaleString()}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totalDues > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <i className={`fa-solid ${totalDues > 0 ? 'fa-triangle-exclamation' : 'fa-check-circle'}`}></i>
            </div>
          </div>
          <button 
            disabled={totalDues <= 0}
            onClick={() => setActiveModal('PAY')}
            className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${
              totalDues > 0 
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {totalDues > 0 ? 'Clear All Dues' : 'No Pending Dues'}
          </button>
        </div>

        {/* Room Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Room</p>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Occupied</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{resident.roomNumber}</h3>
            <p className="text-xs text-slate-500 mt-1">Wing A • Premium 2-Seater</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
            {resident.inventory?.map(item => (
              <span key={item} className="whitespace-nowrap bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded text-[10px] font-bold">
                <i className="fa-solid fa-tag mr-1 opacity-50"></i> {item}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Hostel Alerts</p>
          <div className="space-y-3">
             {totalDues > 0 && (
               <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                  <div>
                    <p className="text-xs font-bold text-red-800">Payment Reminder</p>
                    <p className="text-[10px] text-red-600">Late fine of Rs. 200 will apply after the 5th.</p>
                  </div>
               </div>
             )}
             <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <i className="fa-solid fa-bolt text-amber-500 mt-0.5"></i>
                <div>
                  <p className="text-xs font-bold text-amber-800">Load Shedding Update</p>
                  <p className="text-[10px] text-amber-600">PESCO outage expected at 6:00 PM today.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">My Maintenance Tickets</h3>
                <p className="text-[10px] text-slate-400 font-medium">{complaints.length} tickets raised</p>
            </div>
            <button 
              onClick={() => setActiveModal('COMPLAINT')}
              className="bg-white border border-slate-200 text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-50 transition-all"
            >
              <i className="fa-solid fa-plus mr-1"></i> Lodge New
            </button>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {complaints.length > 0 ? complaints.map(c => (
              <div key={c.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    <i className={`fa-solid ${c.status === 'RESOLVED' ? 'fa-check' : 'fa-wrench'}`}></i>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{c.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{c.createdAt} • {c.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 
                  c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400">
                <i className="fa-solid fa-envelope-open text-3xl mb-3 opacity-20"></i>
                <p className="text-sm">No complaints logged yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Billing History</h3>
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline">Download Ledger</button>
           </div>
           <div className="space-y-4 overflow-y-auto max-h-[400px]">
             {myBills.map(b => (
               <div key={b.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-all">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      b.status === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'
                    }`}>
                       <i className={`fa-solid ${b.status === 'PAID' ? 'fa-receipt' : 'fa-clock'}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{b.type} {b.status === 'PAID' ? 'Payment' : 'Due'}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{b.dueDate}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900">Rs. {b.amount.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold ${b.status === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`}>{b.status}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Payment Modal */}
      {activeModal === 'PAY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl space-y-6 relative m-4">
             <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                    <i className="fa-solid fa-wallet"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900">Secure Payment</h3>
                <p className="text-sm text-slate-500">Pay your dues via local mobile wallets</p>
             </div>
             <div className="flex gap-4 justify-center">
                <button className="flex-1 border-2 border-slate-100 p-4 rounded-2xl hover:border-emerald-500 transition-all flex flex-col items-center gap-2 bg-slate-50/50">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/EasyPaisa_Logo.png" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" alt="Easypaisa" />
                   <span className="text-[10px] font-bold uppercase text-slate-400">Easypaisa</span>
                </button>
                <button className="flex-1 border-2 border-slate-100 p-4 rounded-2xl hover:border-emerald-500 transition-all flex flex-col items-center gap-2 bg-slate-50/50">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jazz_Logo.svg/1200px-Jazz_Logo.svg.png" className="h-6 object-contain grayscale hover:grayscale-0 transition-all" alt="JazzCash" />
                   <span className="text-[10px] font-bold uppercase text-slate-400">JazzCash</span>
                </button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                    <input type="text" placeholder="03XX-XXXXXXX" className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <div className="bg-emerald-900 p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-emerald-900/20">
                   <span className="text-sm font-bold text-emerald-200">Total Payable</span>
                   <span className="text-xl font-black text-white underline decoration-emerald-500 underline-offset-4">Rs. {totalDues.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => {
                      // Mock payment completion
                      setMyBills(myBills.map(b => ({...b, status: 'PAID'})));
                      setActiveModal(null);
                  }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm & Pay
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Complaint Modal */}
      {activeModal === 'COMPLAINT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <form onSubmit={handleLodgeComplaint} className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl space-y-6 relative m-4">
             <button type="button" onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Maintenance Request</h3>
                <p className="text-sm text-slate-500">Describe the issue and staff will be assigned shortly.</p>
             </div>
             <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select name="category" required className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30">
                        <option value="PLUMBING">Plumbing (Water/Taps)</option>
                        <option value="ELECTRICAL">Electrical (Fan/Lights)</option>
                        <option value="INTERNET">WiFi / Internet</option>
                        <option value="CLEANING">Cleaning Service</option>
                        <option value="OTHER">Other Issues</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Brief Title</label>
                    <input name="title" required type="text" placeholder="e.g. Fan making noise" className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">
                  Submit Ticket
                </button>
             </div>
           </form>
        </div>
      )}

      {/* Update Profile Modal */}
      {activeModal === 'PROFILE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-lg p-8 rounded-[32px] shadow-2xl space-y-6 relative m-4">
             <button type="button" onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Edit Profile Details</h3>
                <p className="text-sm text-slate-500">Keep your records updated for security verification.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input name="name" defaultValue={resident.name} required type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Contact Phone</label>
                    <input name="phone" defaultValue={resident.phone} required type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Parent Contact</label>
                    <input name="parentPhone" defaultValue={resident.parentPhone} required type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Institution / Office</label>
                    <input name="institution" defaultValue={resident.institutionOrOffice} required type="text" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-emerald-500 outline-none text-sm font-medium bg-slate-50/30" />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Profile Photo</label>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 p-4 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-slate-500 text-xs font-bold"
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      {resident.profileImage ? 'Change Current Photo' : 'Upload New Photo'}
                    </button>
                </div>
             </div>
             <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
               Save Changes
             </button>
           </form>
        </div>
      )}

      {/* Room Change Modal */}
      {activeModal === 'ROOM_CHANGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl space-y-6 relative m-4">
             <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Room Relocation Request</h3>
                <p className="text-sm text-slate-500">Requesting a move to a different room type or wing.</p>
             </div>
             <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                    {['AC Premium (2-Seater)', 'Non-AC Economy (3-Seater)', 'Single Room (Professional)'].map(type => (
                        <label key={type} className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 cursor-pointer transition-all has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/50">
                            <span className="text-sm font-bold text-slate-700">{type}</span>
                            <input type="radio" name="room_type" className="accent-emerald-600 w-4 h-4" />
                        </label>
                    ))}
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mb-1">Process Note</p>
                    <p className="text-[10px] text-blue-600 leading-relaxed">Room changes are subject to availability and Warden approval. Security deposit adjustments may apply.</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all"
                >
                  Send Request
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResidentPortal;
