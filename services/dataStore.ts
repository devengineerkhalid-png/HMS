
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';
import { Resident, BillingRecord, Room, Complaint, GatePass, UserRole, UserAccount } from '../types';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';

const SUPABASE_URL = (process.env as any).SUPABASE_URL;
const SUPABASE_ANON_KEY = (process.env as any).SUPABASE_ANON_KEY;
const BLOB_TOKEN = (process.env as any).BLOB_READ_WRITE_TOKEN;

let supabase: SupabaseClient | null = null;
let isOfflineMode = false;

const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_URL !== "" && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "";
};

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
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

const ls = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
  return new Blob([uInt8Array], { type: contentType });
}

export const dataStore = {
  isOffline: () => isOfflineMode,

  init: async () => {
    if (isOfflineMode || !supabase) {
      if (!localStorage.getItem(LS_KEYS.USERS)) {
        ls.set(LS_KEYS.USERS, [{ identifier: 'admin', password: 'admin123', role: 'SUPER_ADMIN', name: 'Super Admin', id: 'admin_001' }]);
      }
      return;
    }

    try {
      // Test connectivity
      const { data, error } = await supabase.from('users').select('identifier').limit(1);
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Seed first admin if no users exist
        await supabase.from('users').insert({
          identifier: 'admin',
          password: 'admin123',
          role: 'SUPER_ADMIN',
          name: 'Super Admin',
          id: 'admin_001'
        });
      }
    } catch (e) {
      console.warn("Supabase connectivity issue. Using Local Storage fallback.");
      isOfflineMode = true;
    }
  },

  uploadBlob: async (base64Data: string): Promise<string> => {
    if (!BLOB_TOKEN || BLOB_TOKEN === "") return base64Data;
    try {
      const blob = base64ToBlob(base64Data);
      const { url } = await put(`res_${Date.now()}.png`, blob, { access: 'public', token: BLOB_TOKEN });
      return url;
    } catch (e) { return base64Data; }
  },

  getResidents: async (): Promise<Resident[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    const { data, error } = await supabase.from('residents').select('*').order('admissionDate', { ascending: false });
    if (error) return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    return (data || []).map(r => ({ ...r, dues: Number(r.dues), profileImage: r.profileImageUrl }));
  },

  addResident: async (res: Resident, login?: { identifier: string, password: string }) => {
    let profileImageUrl = res.profileImage;
    if (res.profileImage && res.profileImage.startsWith('data:')) {
      profileImageUrl = await dataStore.uploadBlob(res.profileImage);
    }

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

    if (isOfflineMode || !supabase) {
      const residents = ls.get<Resident[]>(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, [{ ...res, profileImage: profileImageUrl }, ...residents]);
      const users = ls.get<any[]>(LS_KEYS.USERS, []);
      ls.set(LS_KEYS.USERS, [...users, userData]);
      return;
    }

    await supabase.from('residents').insert(residentData);
    await supabase.from('users').insert(userData);
  },

  updateCredentials: async (residentId: string, login: { identifier: string, password: string }) => {
    if (isOfflineMode || !supabase) {
      const users = ls.get<any[]>(LS_KEYS.USERS, []);
      ls.set(LS_KEYS.USERS, users.map(u => u.id === residentId ? { ...u, identifier: login.identifier, password: login.password } : u));
      return;
    }
    await supabase.from('users').update({
      identifier: login.identifier,
      password: login.password
    }).eq('id', residentId);
  },

  updateResident: async (id: string, updates: Partial<Resident>) => {
    let profileImageUrl = updates.profileImage;
    if (updates.profileImage && updates.profileImage.startsWith('data:')) {
      profileImageUrl = await dataStore.uploadBlob(updates.profileImage);
    }

    const supabaseUpdates: any = { ...updates };
    delete supabaseUpdates.profileImage;
    if (profileImageUrl) supabaseUpdates.profileImageUrl = profileImageUrl;

    if (isOfflineMode || !supabase) {
      const data = ls.get<Resident[]>(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, data.map(r => r.id === id ? { ...r, ...updates, profileImage: profileImageUrl || r.profileImage } : r));
      return;
    }

    await supabase.from('residents').update(supabaseUpdates).eq('id', id);
  },

  deleteResident: async (id: string) => {
    if (isOfflineMode || !supabase) {
      ls.set(LS_KEYS.RESIDENTS, ls.get<Resident[]>(LS_KEYS.RESIDENTS, []).filter(r => r.id !== id));
      ls.set(LS_KEYS.USERS, ls.get<any[]>(LS_KEYS.USERS, []).filter(u => u.id !== id));
      return;
    }
    await supabase.from('residents').delete().eq('id', id);
    await supabase.from('users').delete().eq('id', id);
  },

  getRooms: async (): Promise<Room[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.ROOMS, []);
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) return ls.get(LS_KEYS.ROOMS, []);
    return (data || []).map(r => ({ ...r, features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features }));
  },

  setRooms: async (rooms: Room[]) => {
    if (isOfflineMode || !supabase) { ls.set(LS_KEYS.ROOMS, rooms); return; }
    await supabase.from('rooms').delete().neq('id', 'void');
    await supabase.from('rooms').insert(rooms.map(r => ({ ...r, features: JSON.stringify(r.features) })));
  },

  getBilling: async (): Promise<BillingRecord[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.BILLING, MOCK_BILLING);
    const { data, error } = await supabase.from('billing').select('*');
    if (error) return ls.get(LS_KEYS.BILLING, MOCK_BILLING);
    return data || [];
  },

  getUsers: async () => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.USERS, []);
    const { data, error } = await supabase.from('users').select('*');
    if (error) return ls.get(LS_KEYS.USERS, []);
    return data || [];
  },

  addUser: async (user: any) => {
    if (isOfflineMode || !supabase) {
      ls.set(LS_KEYS.USERS, [...ls.get<any[]>(LS_KEYS.USERS, []), user]);
      return;
    }
    await supabase.from('users').insert(user);
  },

  getComplaints: async (): Promise<Complaint[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    const { data, error } = await supabase.from('complaints').select('*').order('createdAt', { ascending: false });
    if (error) return ls.get(LS_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    return data || [];
  },

  getGatePasses: async (): Promise<GatePass[]> => {
    if (isOfflineMode || !supabase) return ls.get(LS_KEYS.GATE_PASSES, []);
    const { data, error } = await supabase.from('gate_passes').select('*').order('departureDate', { ascending: false });
    if (error) return ls.get(LS_KEYS.GATE_PASSES, []);
    return data || [];
  },

  setGatePasses: async (passes: GatePass[]) => {
    if (isOfflineMode || !supabase) { ls.set(LS_KEYS.GATE_PASSES, passes); return; }
    await supabase.from('gate_passes').delete().neq('id', 'void');
    await supabase.from('gate_passes').insert(passes);
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
    if (isOfflineMode || !supabase) {
      if (data.residents) ls.set(LS_KEYS.RESIDENTS, data.residents);
      if (data.rooms) ls.set(LS_KEYS.ROOMS, data.rooms);
      if (data.billing) ls.set(LS_KEYS.BILLING, data.billing);
      if (data.complaints) ls.set(LS_KEYS.COMPLAINTS, data.complaints);
      if (data.gate_passes) ls.set(LS_KEYS.GATE_PASSES, data.gate_passes);
      if (data.users) ls.set(LS_KEYS.USERS, data.users);
      return;
    }
    
    await dataStore.wipeAllData();
    
    if (data.residents) {
      const residents = data.residents.map((r: any) => ({
        id: r.id, name: r.name, cnic: r.cnic, phone: r.phone, email: r.email,
        parentName: r.parentName, parentPhone: r.parentPhone, type: r.type,
        institutionOrOffice: r.institutionOrOffice, roomNumber: r.roomNumber,
        status: r.status, admissionDate: r.admissionDate, dues: r.dues,
        profileImageUrl: r.profileImageUrl || r.profileImage,
        permanentAddress: r.permanentAddress, currentAddress: r.currentAddress,
        emergencyContactName: r.emergencyContactName, emergencyContactPhone: r.emergencyContactPhone
      }));
      await supabase.from('residents').insert(residents);
    }
    if (data.rooms) await dataStore.setRooms(data.rooms);
    if (data.billing) await supabase.from('billing').insert(data.billing);
    if (data.complaints) await supabase.from('complaints').insert(data.complaints);
    if (data.gate_passes) await dataStore.setGatePasses(data.gate_passes);
    if (data.users) {
      // Filter out existing super admin to avoid conflict
      const usersToImport = data.users.filter((u: any) => u.identifier !== 'admin');
      await supabase.from('users').insert(usersToImport);
    }
  },

  wipeAllData: async () => {
    if (isOfflineMode || !supabase) {
      Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
      return;
    }
    await supabase.from('residents').delete().neq('id', 'void');
    await supabase.from('rooms').delete().neq('id', 'void');
    await supabase.from('billing').delete().neq('id', 'void');
    await supabase.from('complaints').delete().neq('id', 'void');
    await supabase.from('gate_passes').delete().neq('id', 'void');
    await supabase.from('users').delete().neq('role', 'SUPER_ADMIN');
  },

  resetToDefaults: async () => {
    await dataStore.wipeAllData();
    for (const r of MOCK_RESIDENTS) await dataStore.addResident(r);
  }
};
