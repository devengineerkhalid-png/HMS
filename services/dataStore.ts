import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resident, BillingRecord, Room, Complaint, GatePass, UserRole, UserAccount } from '../types';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';

// Fix: Access environment variables directly from process.env instead of window.process
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
let isOfflineMode = false;

const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
};

if (isSupabaseConfigured()) {
  try {
    // Fix: Assert non-null as isSupabaseConfigured checks for existence
    supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  } catch (e) {
    console.error("Supabase Client Init Error:", e);
    isOfflineMode = true;
  }
} else {
  isOfflineMode = true;
}

const LS_KEYS = {
  RESIDENTS: 'pesh_hms_residents',
  ROOMS: 'pesh_hms_rooms',
  BILLING: 'pesh_hms_billing',
  COMPLAINTS: 'pesh_hms_complaints',
  GATE_PASSES: 'pesh_hms_gate_passes',
  USERS: 'pesh_hms_users'
};

const DEFAULT_ADMIN: UserAccount = { 
  identifier: 'admin', 
  password: 'admin123', 
  role: UserRole.SUPER_ADMIN, 
  name: 'Super Admin', 
  id: 'admin_001' 
};

const ls = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

function base64ToBlob(base64: string): { blob: Blob, mime: string } {
  const parts = base64.split(';base64,');
  const mime = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
  return { blob: new Blob([uInt8Array], { type: mime }), mime };
}

export const dataStore = {
  isOffline: () => isOfflineMode,

  init: async () => {
    // 1. ALWAYS seed local storage with default admin if it doesn't exist
    // This provides a "safety net" if Supabase is down or empty.
    const localUsers = ls.get<UserAccount[]>(LS_KEYS.USERS, []);
    if (!localUsers.find(u => u.identifier === 'admin')) {
      ls.set(LS_KEYS.USERS, [DEFAULT_ADMIN, ...localUsers]);
    }

    if (isOfflineMode || !supabase) return;

    try {
      // 2. Check if tables exist by querying users
      const { data, error } = await supabase.from('users').select('identifier').limit(1);
      
      if (error) {
        // Table doesn't exist - we don't crash, we just let the app handle the missing table later
        console.warn("Supabase 'users' table missing. Using local accounts fallback.");
        return;
      }
      
      // 3. If cloud table is empty, seed it with the default admin
      if (!data || data.length === 0) {
        await supabase.from('users').insert(DEFAULT_ADMIN);
      }
    } catch (e) {
      console.warn("Supabase Connection unstable. Local fallback ready.");
    }
  },

  uploadBlob: async (base64Data: string): Promise<string> => {
    if (isOfflineMode || !supabase || !base64Data.startsWith('data:')) return base64Data;

    try {
      const { blob, mime } = base64ToBlob(base64Data);
      const fileName = `profiles/${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
      
      const { data, error } = await supabase.storage
        .from('hms_assets')
        .upload(fileName, blob, {
          contentType: mime,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('hms_assets').getPublicUrl(data.path);
      return publicUrl;
    } catch (e) {
      console.error("Supabase Storage Upload Failed:", e);
      return base64Data;
    }
  },

  getResidents: async (): Promise<Resident[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    try {
      const { data, error } = await supabase.from('residents').select('*').order('admissionDate', { ascending: false });
      if (error) throw error;
      return (data || []).map(r => ({ ...r, dues: Number(r.dues), profileImage: r.profileImageUrl }));
    } catch (e) {
      return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    }
  },

  getUsers: async (): Promise<UserAccount[]> => {
    const localUsers = ls.get<UserAccount[]>(LS_KEYS.USERS, [DEFAULT_ADMIN]);
    
    if (isOfflineMode || !supabase) return localUsers;
    
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      
      const cloudUsers = data || [];
      // Ensure admin is in the list if cloud is empty
      if (cloudUsers.length === 0) return localUsers;
      
      return cloudUsers;
    } catch (e) {
      // Fallback to local storage if cloud table is missing
      return localUsers;
    }
  },

  addResident: async (res: Resident, login?: { identifier: string, password: string }) => {
    const profileImageUrl = await dataStore.uploadBlob(res.profileImage || '');

    const residentData = {
      id: res.id,
      name: res.name,
      cnic: res.cnic,
      phone: res.phone,
      email: res.email || null,
      parentName: res.parentName,
      parentPhone: res.parentPhone,
      type: res.type,
      institutionOrOffice: res.institutionOrOffice,
      roomNumber: res.roomNumber,
      status: res.status,
      admissionDate: res.admissionDate,
      dues: res.dues,
      profileImageUrl: profileImageUrl,
      permanentAddress: res.permanentAddress || null,
      currentAddress: res.currentAddress || null,
      emergencyContactName: res.emergencyContactName || null,
      emergencyContactPhone: res.emergencyContactPhone || null
    };

    const userData = {
      identifier: login?.identifier || res.cnic,
      password: login?.password || res.phone,
      role: UserRole.RESIDENT,
      name: res.name,
      id: res.id
    };

    // Update Local First
    const residents = ls.get<Resident[]>(LS_KEYS.RESIDENTS, []);
    ls.set(LS_KEYS.RESIDENTS, [{ ...res, profileImage: profileImageUrl }, ...residents]);
    const users = ls.get<UserAccount[]>(LS_KEYS.USERS, []);
    ls.set(LS_KEYS.USERS, [...users, userData]);

    if (!isOfflineMode && supabase) {
      try {
        await supabase.from('residents').insert(residentData);
        await supabase.from('users').insert(userData);
      } catch (err) {
        console.error("Cloud insertion failed, data kept in local cache.");
      }
    }
  },

  deleteResident: async (id: string) => {
    const residents = ls.get<Resident[]>(LS_KEYS.RESIDENTS, []);
    ls.set(LS_KEYS.RESIDENTS, residents.filter(r => r.id !== id));
    const users = ls.get<UserAccount[]>(LS_KEYS.USERS, []);
    ls.set(LS_KEYS.USERS, users.filter(u => u.id !== id));

    if (!isOfflineMode && supabase) {
      await supabase.from('residents').delete().eq('id', id);
      await supabase.from('users').delete().eq('id', id);
    }
  },

  updateCredentials: async (residentId: string, login: { identifier: string, password: string }) => {
    const users = ls.get<UserAccount[]>(LS_KEYS.USERS, []);
    ls.set(LS_KEYS.USERS, users.map(u => u.id === residentId ? { ...u, identifier: login.identifier, password: login.password } : u));

    if (!isOfflineMode && supabase) {
      await supabase.from('users').update({
        identifier: login.identifier,
        password: login.password
      }).eq('id', residentId);
    }
  },

  getRooms: async (): Promise<Room[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.ROOMS, []);
    try {
      const { data, error } = await supabase.from('rooms').select('*');
      if (error) throw error;
      return (data || []).map(r => ({ ...r, features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features }));
    } catch (e) {
      return ls.get(LS_KEYS.ROOMS, []);
    }
  },

  setRooms: async (rooms: Room[]) => {
    ls.set(LS_KEYS.ROOMS, rooms);
    if (!isOfflineMode && supabase) {
      await supabase.from('rooms').delete().neq('id', 'void');
      await supabase.from('rooms').insert(rooms.map(r => ({ ...r, features: JSON.stringify(r.features) })));
    }
  },

  getBilling: async (): Promise<BillingRecord[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.BILLING, MOCK_BILLING);
    try {
      const { data, error } = await supabase.from('billing').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      return ls.get(LS_KEYS.BILLING, MOCK_BILLING);
    }
  },

  getComplaints: async (): Promise<Complaint[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    try {
      const { data, error } = await supabase.from('complaints').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return ls.get(LS_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    }
  },

  getGatePasses: async (): Promise<GatePass[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.GATE_PASSES, []);
    try {
      const { data, error } = await supabase.from('gate_passes').select('*').order('departureDate', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return ls.get(LS_KEYS.GATE_PASSES, []);
    }
  },

  setGatePasses: async (passes: GatePass[]) => {
    ls.set(LS_KEYS.GATE_PASSES, passes);
    if (!isOfflineMode && supabase) {
      await supabase.from('gate_passes').delete().neq('id', 'void');
      await supabase.from('gate_passes').insert(passes);
    }
  },

  exportAllData: async () => {
    return JSON.stringify({ 
      residents: await dataStore.getResidents(), 
      rooms: await dataStore.getRooms(), 
      billing: await dataStore.getBilling(), 
      complaints: await dataStore.getComplaints(), 
      gate_passes: await dataStore.getGatePasses(), 
      users: await dataStore.getUsers() 
    }, null, 2);
  },

  importAllData: async (json: string) => {
    const data = JSON.parse(json);
    if (data.residents) ls.set(LS_KEYS.RESIDENTS, data.residents);
    if (data.rooms) ls.set(LS_KEYS.ROOMS, data.rooms);
    if (data.billing) ls.set(LS_KEYS.BILLING, data.billing);
    if (data.complaints) ls.set(LS_KEYS.COMPLAINTS, data.complaints);
    if (data.gate_passes) ls.set(LS_KEYS.GATE_PASSES, data.gate_passes);
    if (data.users) ls.set(LS_KEYS.USERS, data.users);

    if (!isOfflineMode && supabase) {
      await dataStore.wipeAllData();
      if (data.residents) {
        const residents = data.residents.map((r: any) => ({
          id: r.id, name: r.name, cnic: r.cnic, phone: r.phone, email: r.email,
          parentName: r.parentName, parentPhone: r.parentPhone, type: r.type,
          institutionOrOffice: r.institutionOrOffice, roomNumber: r.roomNumber,
          status: r.status, admissionDate: r.admissionDate, dues: r.dues,
          profile_image_url: r.profileImageUrl || r.profileImage
        }));
        await supabase.from('residents').insert(residents);
      }
      if (data.users) {
        const usersToImport = data.users.filter((u: any) => u.identifier !== 'admin');
        await supabase.from('users').insert(usersToImport);
      }
    }
  },

  wipeAllData: async () => {
    Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
    ls.set(LS_KEYS.USERS, [DEFAULT_ADMIN]);

    if (!isOfflineMode && supabase) {
      await supabase.from('residents').delete().neq('id', 'void');
      await supabase.from('rooms').delete().neq('id', 'void');
      await supabase.from('billing').delete().neq('id', 'void');
      await supabase.from('complaints').delete().neq('id', 'void');
      await supabase.from('gate_passes').delete().neq('id', 'void');
      await supabase.from('users').delete().neq('role', 'SUPER_ADMIN');
    }
  },

  resetToDefaults: async () => {
    await dataStore.wipeAllData();
    for (const r of MOCK_RESIDENTS) await dataStore.addResident(r);
  }
};
