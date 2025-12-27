
import React, { useState } from 'react';
import { UserRole, ResidentType } from '../types';

interface GuestViewProps {
  onLogin: (user: any) => void;
}

const GuestView: React.FC<GuestViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'APPLY' | 'FORGOT'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    cnic: '',
    phone: '',
    type: ResidentType.STUDENT,
    institution: ''
  });
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);

  // Regex patterns for strict Peshawar market validation
  const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
  const PHONE_REGEX = /^03\d{2}-\d{7}$/;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const id = loginData.identifier.toLowerCase();
      if (!id || !loginData.password) {
        setError('Please enter both identifier and password.');
        setIsLoading(false);
        return;
      }

      // If it looks like a CNIC, validate it
      if (id.includes('-') && !CNIC_REGEX.test(id)) {
        setError('Invalid CNIC format. Expected: 17301-XXXXXXX-X');
        setIsLoading(false);
        return;
      }

      let role = UserRole.RESIDENT;
      let name = 'Ahmad Khan';
      let userId = '1';

      if (id === 'admin') {
        role = UserRole.SUPER_ADMIN;
        name = 'Super Admin';
      } else if (id === 'warden') {
        role = UserRole.WARDEN;
        name = 'Warden Ali';
      }

      const userData = { role, name, id: userId };
      localStorage.setItem('pesh_hms_user', JSON.stringify(userData));
      onLogin(userData);
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.cnic || !signupData.phone || !signupData.institution) {
      setError('Please fill all mandatory fields.');
      return;
    }

    if (!CNIC_REGEX.test(signupData.cnic)) {
      setError('Invalid CNIC format. Format must be: 12345-1234567-1');
      return;
    }

    if (!PHONE_REGEX.test(signupData.phone)) {
      setError('Invalid Phone. Format must be: 03XX-XXXXXXX');
      return;
    }

    setMode('APPLY');
  };

  const handleSubmitApplication = () => {
    if (!selectedRoomType) {
      setError('Please select a room type to proceed.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const userData = { 
        role: UserRole.RESIDENT, 
        name: signupData.name, 
        id: 'new_' + Date.now(),
        roomType: selectedRoomType
      };
      localStorage.setItem('pesh_hms_user', JSON.stringify(userData));
      onLogin(userData);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden border border-white/20">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full -mr-64 -mt-64 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <i className="fa-solid fa-hotel text-slate-900 text-xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter">Peshawar HMS</span>
            </div>
            <h1 className="text-5xl font-black mb-6 leading-[1.1]">
              Smart Living for <br/> 
              <span className="text-emerald-400 underline decoration-slate-700 underline-offset-8">The Frontier.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Standardized hostel management for Hayatabad, University Road, and Peshawar's top academic districts.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compliance & Security</p>
            <div className="flex gap-4 items-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Government_of_Khyber_Pakhtunkhwa_Logo.png" className="h-10 grayscale opacity-50" alt="KP Govt" />
              <div className="h-8 w-[1px] bg-slate-800"></div>
              <p className="text-xs text-slate-500">Approved by KP IT Board & Local Police Liaison.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 md:p-20 flex flex-col justify-center bg-white">
          
          {mode === 'LOGIN' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
                <p className="text-slate-500 font-medium text-sm">Access your billing and maintenance portal.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                  <i className="fa-solid fa-triangle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNIC / ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="17301-XXXXXXX-X" 
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
                    value={loginData.identifier}
                    onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-medium"
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Enter Portal'}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500 font-medium">
                  New resident? <button onClick={() => setMode('SIGNUP')} className="text-emerald-600 font-black hover:underline">Apply for Admission</button>
                </p>
              </div>
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
              <div>
                <button onClick={() => setMode('LOGIN')} className="text-slate-400 hover:text-slate-900 mb-6 transition-colors">
                  <i className="fa-solid fa-arrow-left mr-2"></i> Back to Login
                </button>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Resident Application</h2>
                <p className="text-slate-500 font-medium text-sm">Fill in your details for verification.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    required
                    placeholder="Full Legal Name"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm"
                    value={signupData.name}
                    onChange={e => setSignupData({...signupData, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    required
                    placeholder="CNIC (e.g. 17301-1234567-1)"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm"
                    value={signupData.cnic}
                    onChange={e => setSignupData({...signupData, cnic: e.target.value})}
                  />
                  <input 
                    type="text" 
                    required
                    placeholder="Phone (e.g. 0345-1234567)"
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm"
                    value={signupData.phone}
                    onChange={e => setSignupData({...signupData, phone: e.target.value})}
                  />
                  <div className="flex gap-2">
                    {Object.values(ResidentType).map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setSignupData({...signupData, type})}
                        className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${signupData.type === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                         {type}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder={signupData.type === ResidentType.STUDENT ? "University / Dept" : "Office / Company"}
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm"
                    value={signupData.institution}
                    onChange={e => setSignupData({...signupData, institution: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all">
                  Next: Room Selection
                </button>
              </form>
            </div>
          )}

          {mode === 'APPLY' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
               <h2 className="text-3xl font-black text-slate-900 mb-2">Room Choice</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: 'AC-2 Seater', price: '25,000', icon: 'fa-snowflake' },
                  { type: 'AC-3 Seater', price: '20,000', icon: 'fa-snowflake' },
                  { type: 'Non-AC 2 Seater', price: '18,000', icon: 'fa-fan' },
                  { type: 'Non-AC 3 Seater', price: '15,000', icon: 'fa-fan' }
                ].map(room => (
                  <div 
                    key={room.type} 
                    onClick={() => setSelectedRoomType(room.type)}
                    className={`group border-2 p-6 rounded-[32px] cursor-pointer transition-all bg-white hover:shadow-xl ${selectedRoomType === room.type ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-100 hover:border-emerald-300'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedRoomType === room.type ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <i className={`fa-solid ${room.icon}`}></i>
                      </div>
                    </div>
                    <p className="font-black text-slate-900 text-sm">{room.type}</p>
                    <p className="text-emerald-600 font-bold text-xs">Rs. {room.price}/mo</p>
                  </div>
                ))}
              </div>
              <button 
                disabled={isLoading || !selectedRoomType}
                onClick={handleSubmitApplication}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all"
              >
                {isLoading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestView;
