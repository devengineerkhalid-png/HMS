
import React, { useState } from 'react';
import { UserRole, ResidentType } from '../types';
import { dataStore } from '../services/dataStore';

interface GuestViewProps {
  onLogin: (user: any) => void;
}

const GuestView: React.FC<GuestViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'APPLY'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    cnic: '',
    password: '',
    phone: '',
    type: ResidentType.STUDENT,
    institution: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const users = dataStore.getUsers();
      const user = users.find((u: any) => u.identifier === loginData.identifier && u.password === loginData.password);

      if (user) {
        localStorage.setItem('pesh_hms_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Authentication Failed: Invalid ID or Keyphrase.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.cnic || !signupData.password) {
      setError('Regulatory compliance requires all fields.');
      return;
    }
    
    // Register the user in the "Auth Database"
    const newUser = {
      identifier: signupData.cnic,
      password: signupData.password,
      role: UserRole.RESIDENT,
      name: signupData.name,
      id: `res_${Date.now()}`
    };
    
    dataStore.addUser(newUser);
    
    // Auto-login after signup
    localStorage.setItem('pesh_hms_user', JSON.stringify(newUser));
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden">
        
        {/* Branding Sidebar */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 text-xl font-black shadow-lg shadow-emerald-500/20">P</div>
              <span className="text-2xl font-black tracking-tighter">Frontier HMS</span>
            </div>
            <h1 className="text-6xl font-black mb-8 leading-[0.95] tracking-tight">
              Frontier <br/> <span className="text-emerald-400">Smart Living.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed font-medium">Standardized hostel management for Hayatabad & Peshawar's top academic districts.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                <i className="fa-solid fa-shield-check text-emerald-500"></i>
            </div>
            Police Verified v3.1 PRO
          </div>
        </div>

        {/* Auth Forms */}
        <div className="p-8 md:p-24 flex flex-col justify-center bg-white">
          {mode === 'LOGIN' ? (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Assalam-o-Alaikum</h2>
                <p className="text-slate-500 font-medium italic">Enter credentials to access the HMS Hub.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNIC or Admin ID</label>
                  <input required placeholder="e.g. admin or 17301-XXXXXXX-X" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-[28px] outline-none focus:border-emerald-500 text-sm font-black" value={loginData.identifier} onChange={e => setLoginData({...loginData, identifier: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Keyphrase</label>
                  <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-[28px] outline-none focus:border-emerald-500 text-sm font-black tracking-widest" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                </div>
                <button disabled={isLoading} className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                  {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Authenticate Access'}
                </button>
              </form>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Admin Credentials</p>
                <code className="text-[10px] font-bold text-slate-600">ID: admin | PW: admin123</code>
              </div>

              <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                New student? <button onClick={() => setMode('SIGNUP')} className="text-emerald-600 font-black hover:underline ml-2">Register Admissions</button>
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <button onClick={() => setMode('LOGIN')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4 hover:text-slate-900">
                <i className="fa-solid fa-arrow-left mr-2"></i> Return to Login
              </button>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hostel Enrollment</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <input required placeholder="Legal Full Name" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border" value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} />
                <input required placeholder="CNIC (User Identity)" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border" value={signupData.cnic} onChange={e => setSignupData({...signupData, cnic: e.target.value})} />
                <input required type="password" placeholder="Set Secure Password" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border" value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} />
                <input required placeholder="Phone Contact" className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold border" value={signupData.phone} onChange={e => setSignupData({...signupData, phone: e.target.value})} />
                <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 mt-4">Complete Registration</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestView;
