
import React, { useState, useEffect } from 'react';
import { UserRole, ResidentType } from '../types';
import { dataStore } from '../services/dataStore';

interface GuestViewProps {
  onLogin: (user: any) => void;
}

const GuestView: React.FC<GuestViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCloud, setIsCloud] = useState(false);

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  useEffect(() => {
    setIsCloud(!dataStore.isOffline());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const users = await dataStore.getUsers();
      const user = users.find((u: any) => u.identifier === loginData.identifier && u.password === loginData.password);

      if (user) {
        localStorage.setItem('pesh_hms_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Verification Failed: Incorrect CNIC or Keyphrase.');
      }
    } catch (err) {
      setError('System Busy: Unable to reach verification server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[60px] shadow-2xl overflow-hidden min-h-[700px]">
        
        <div className="hidden lg:flex flex-col justify-between p-20 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 font-black">P</div>
              <span className="font-black text-xl tracking-tighter">Frontier HMS</span>
            </div>
            <h1 className="text-6xl font-black mb-8 leading-[0.9] tracking-tighter">
              Manage. <br/> <span className="text-emerald-400">Sync.</span> <br/> Secure.
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed max-w-xs">Digital hub for Peshawar's premier hostels. Smart synchronization between Warden and Resident.</p>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl self-start border text-[10px] font-black uppercase tracking-widest ${isCloud ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isCloud ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            {isCloud ? 'Cloud Sync Active' : 'Local Node Active'}
          </div>
        </div>

        <div className="p-12 md:p-24 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Peshawar Gateway</h2>
            <p className="text-slate-500 font-medium italic">Authenticate to enter your digital quarter.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CNIC or Admin ID</label>
              <input required placeholder="17301-XXXXXXX-X" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-emerald-500 text-sm font-black transition-all" value={loginData.identifier} onChange={e => setLoginData({...loginData, identifier: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Keyphrase (Phone No.)</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-3xl outline-none focus:border-emerald-500 text-sm font-black transition-all" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
            </div>
            <button disabled={isLoading} className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
              {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Verify Credentials'}
            </button>
          </form>

          <div className="mt-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Notice for Students</p>
             <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Logins are created by the Hostel Warden during admission. Please use your CNIC and the mobile number provided at the time of entry.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestView;
