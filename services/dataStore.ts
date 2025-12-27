
import { createClient, Client } from '@libsql/client';
import { put } from '@vercel/blob';
import { Resident, BillingRecord, Room, Complaint, GatePass, UserRole, UserAccount } from '../types';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';

const TURSO_URL = (process.env as any).TURSO_URL;
const TURSO_TOKEN = (process.env as any).TURSO_TOKEN;
const BLOB_TOKEN = (process.env as any).BLOB_READ_WRITE_TOKEN;

let client: Client | null = null;
let isOfflineMode = false;

const isTursoConfigured = () => {
  return TURSO_URL && TURSO_URL !== "" && TURSO_URL !== "libsql://your-db-name.turso.io";
};

if (isTursoConfigured()) {
  try {
    client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || "" });
  } catch (e) { isOfflineMode = true; }
} else { isOfflineMode = true; }

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
    if (isOfflineMode || !client) {
      if (!localStorage.getItem(LS_KEYS.USERS)) {
        ls.set(LS_KEYS.USERS, [{ identifier: 'admin', password: 'admin123', role: 'SUPER_ADMIN', name: 'Super Admin', id: 'admin_001' }]);
      }
      return;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
      await Promise.race([client.execute("SELECT 1"), timeoutPromise]);
      
      await client.batch([
        `CREATE TABLE IF NOT EXISTS residents (
          id TEXT PRIMARY KEY, name TEXT, cnic TEXT, phone TEXT, email TEXT,
          parentName TEXT, parentPhone TEXT, type TEXT, institutionOrOffice TEXT,
          roomNumber TEXT, status TEXT, admissionDate TEXT, dues REAL,
          profileImageUrl TEXT, permanentAddress TEXT, currentAddress TEXT,
          emergencyContactName TEXT, emergencyContactPhone TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY, number TEXT, type TEXT, features TEXT,
          status TEXT, currentOccupancy INTEGER, capacity INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS billing (
          id TEXT PRIMARY KEY, residentId TEXT, amount REAL, type TEXT,
          status TEXT, dueDate TEXT, paymentMethod TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS complaints (
          id TEXT PRIMARY KEY, residentId TEXT, title TEXT, category TEXT,
          status TEXT, createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS gate_passes (
          id TEXT PRIMARY KEY, residentId TEXT, requestType TEXT, destination TEXT,
          departureDate TEXT, returnDate TEXT, status TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          identifier TEXT PRIMARY KEY, password TEXT, role TEXT, name TEXT, id TEXT
        )`
      ], "write");

      const userCheck = await client.execute("SELECT COUNT(*) as count FROM users");
      if (Number(userCheck.rows[0].count) === 0) {
        await client.execute({
          sql: "INSERT INTO users (identifier, password, role, name, id) VALUES (?, ?, ?, ?, ?)",
          args: ['admin', 'admin123', 'SUPER_ADMIN', 'Super Admin', 'admin_001']
        });
      }
    } catch (e) {
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
    if (isOfflineMode || !client) return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    const res = await client.execute("SELECT * FROM residents ORDER BY admissionDate DESC");
    return res.rows.map(row => ({ ...row, dues: Number(row.dues), profileImage: row.profileImageUrl } as unknown as Resident));
  },

  addResident: async (res: Resident, login?: { identifier: string, password: string }) => {
    let profileImageUrl = res.profileImage;
    if (res.profileImage && res.profileImage.startsWith('data:')) {
      profileImageUrl = await dataStore.uploadBlob(res.profileImage);
    }

    if (isOfflineMode || !client) {
      const residents = ls.get<Resident[]>(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, [{ ...res, profileImage: profileImageUrl }, ...residents]);
      const users = ls.get<any[]>(LS_KEYS.USERS, []);
      ls.set(LS_KEYS.USERS, [...users, { 
        identifier: login?.identifier || res.cnic, 
        password: login?.password || res.phone, 
        role: UserRole.RESIDENT, 
        name: res.name, 
        id: res.id 
      }]);
      return;
    }

    await client.batch([
      {
        sql: `INSERT INTO residents (id, name, cnic, phone, email, parentName, parentPhone, type, 
              institutionOrOffice, roomNumber, status, admissionDate, dues, profileImageUrl, 
              permanentAddress, currentAddress, emergencyContactName, emergencyContactPhone) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          res.id, res.name, res.cnic, res.phone, res.email || null, res.parentName, res.parentPhone, res.type,
          res.institutionOrOffice, res.roomNumber, res.status, res.admissionDate, res.dues, 
          profileImageUrl, res.permanentAddress || null, res.currentAddress || null, 
          res.emergencyContactName || null, res.emergencyContactPhone || null
        ]
      },
      {
        sql: "INSERT INTO users (identifier, password, role, name, id) VALUES (?, ?, ?, ?, ?)",
        args: [login?.identifier || res.cnic, login?.password || res.phone, UserRole.RESIDENT, res.name, res.id]
      }
    ], "write");
  },

  updateCredentials: async (residentId: string, login: { identifier: string, password: string }) => {
    if (isOfflineMode || !client) {
      const users = ls.get<any[]>(LS_KEYS.USERS, []);
      ls.set(LS_KEYS.USERS, users.map(u => u.id === residentId ? { ...u, identifier: login.identifier, password: login.password } : u));
      return;
    }
    await client.execute({
      sql: "UPDATE users SET identifier = ?, password = ? WHERE id = ?",
      args: [login.identifier, login.password, residentId]
    });
  },

  updateResident: async (id: string, updates: Partial<Resident>) => {
    let profileImageUrl = updates.profileImage;
    if (updates.profileImage && updates.profileImage.startsWith('data:')) {
      profileImageUrl = await dataStore.uploadBlob(updates.profileImage);
    }

    if (isOfflineMode || !client) {
      const data = ls.get<Resident[]>(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, data.map(r => r.id === id ? { ...r, ...updates, profileImage: profileImageUrl || r.profileImage } : r));
      return;
    }

    const updateFields = Object.keys(updates).filter(k => k !== 'id' && k !== 'profileImage');
    const setClauseParts = updateFields.map(k => `${k} = ?`);
    if (profileImageUrl) setClauseParts.push('profileImageUrl = ?');
    const setClause = setClauseParts.join(', ');
    const args = updateFields.map(k => (updates as any)[k]);
    if (profileImageUrl) args.push(profileImageUrl);
    args.push(id);

    if (setClause) {
      await client.execute({ sql: `UPDATE residents SET ${setClause} WHERE id = ?`, args });
    }
  },

  deleteResident: async (id: string) => {
    if (isOfflineMode || !client) {
      ls.set(LS_KEYS.RESIDENTS, ls.get<Resident[]>(LS_KEYS.RESIDENTS, []).filter(r => r.id !== id));
      ls.set(LS_KEYS.USERS, ls.get<any[]>(LS_KEYS.USERS, []).filter(u => u.id !== id));
      return;
    }
    await client.batch([
      { sql: "DELETE FROM residents WHERE id = ?", args: [id] },
      { sql: "DELETE FROM users WHERE id = ?", args: [id] }
    ], "write");
  },

  getRooms: async (): Promise<Room[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.ROOMS, []);
    const res = await client.execute("SELECT * FROM rooms");
    return res.rows.map(row => ({ ...row, features: JSON.parse(row.features as string), currentOccupancy: Number(row.currentOccupancy), capacity: Number(row.capacity) } as unknown as Room));
  },

  setRooms: async (rooms: Room[]) => {
    if (isOfflineMode || !client) { ls.set(LS_KEYS.ROOMS, rooms); return; }
    await client.execute("DELETE FROM rooms");
    for (const r of rooms) {
      await client.execute({
        sql: "INSERT INTO rooms (id, number, type, features, status, currentOccupancy, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [r.id, r.number, r.type, JSON.stringify(r.features), r.status, r.currentOccupancy, r.capacity]
      });
    }
  },

  getBilling: async (): Promise<BillingRecord[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.BILLING, MOCK_BILLING);
    const res = await client.execute("SELECT * FROM billing");
    return res.rows as unknown as BillingRecord[];
  },

  getUsers: async () => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.USERS, []);
    const res = await client.execute("SELECT * FROM users");
    return res.rows;
  },

  addUser: async (user: any) => {
    if (isOfflineMode || !client) {
      ls.set(LS_KEYS.USERS, [...ls.get<any[]>(LS_KEYS.USERS, []), user]);
      return;
    }
    await client.execute({
      sql: "INSERT INTO users (identifier, password, role, name, id) VALUES (?, ?, ?, ?, ?)",
      args: [user.identifier, user.password, user.role, user.name, user.id]
    });
  },

  getComplaints: async (): Promise<Complaint[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
    const res = await client.execute("SELECT * FROM complaints ORDER BY createdAt DESC");
    return res.rows as unknown as Complaint[];
  },

  getGatePasses: async (): Promise<GatePass[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.GATE_PASSES, []);
    const res = await client.execute("SELECT * FROM gate_passes ORDER BY departureDate DESC");
    return res.rows as unknown as GatePass[];
  },

  setGatePasses: async (passes: GatePass[]) => {
    if (isOfflineMode || !client) { ls.set(LS_KEYS.GATE_PASSES, passes); return; }
    await client.execute("DELETE FROM gate_passes");
    for (const p of passes) {
      await client.execute({
        sql: "INSERT INTO gate_passes (id, residentId, requestType, destination, departureDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.residentId, p.requestType, p.destination, p.departureDate, p.returnDate, p.status]
      });
    }
  },

  execute: async (stmt: any) => {
    if (isOfflineMode || !client) return { rows: [] };
    return await client.execute(stmt);
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
    if (isOfflineMode || !client) {
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
      for (const res of data.residents) {
        await client.execute({
          sql: `INSERT INTO residents (id, name, cnic, phone, email, parentName, parentPhone, type, 
                institutionOrOffice, roomNumber, status, admissionDate, dues, profileImageUrl, 
                permanentAddress, currentAddress, emergencyContactName, emergencyContactPhone) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            res.id, res.name, res.cnic, res.phone, res.email || null, res.parentName, res.parentPhone, res.type,
            res.institutionOrOffice, res.roomNumber, res.status, res.admissionDate, res.dues, 
            res.profileImageUrl || res.profileImage || null, res.permanentAddress || null, res.currentAddress || null, 
            res.emergencyContactName || null, res.emergencyContactPhone || null
          ]
        });
      }
    }
    if (data.rooms) await dataStore.setRooms(data.rooms);
    if (data.billing) {
      for (const b of data.billing) {
        await client.execute({
          sql: "INSERT INTO billing (id, residentId, amount, type, status, dueDate, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [b.id, b.residentId, b.amount, b.type, b.status, b.dueDate, b.paymentMethod || null]
        });
      }
    }
    if (data.complaints) {
      for (const c of data.complaints) {
        await client.execute({
          sql: "INSERT INTO complaints (id, residentId, title, category, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
          args: [c.id, c.residentId, c.title, c.category, c.status, c.createdAt]
        });
      }
    }
    if (data.gate_passes) await dataStore.setGatePasses(data.gate_passes);
    if (data.users) {
      for (const u of data.users) {
        if (u.role === 'SUPER_ADMIN') {
          const check = await client.execute({ sql: "SELECT identifier FROM users WHERE identifier = ?", args: [u.identifier] });
          if (check.rows.length > 0) continue;
        }
        await client.execute({
          sql: "INSERT INTO users (identifier, password, role, name, id) VALUES (?, ?, ?, ?, ?)",
          args: [u.identifier, u.password, u.role, u.name, u.id]
        });
      }
    }
  },

  wipeAllData: async () => {
    if (isOfflineMode || !client) { Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k)); return; }
    await client.batch([
      "DELETE FROM residents", "DELETE FROM rooms", "DELETE FROM billing", 
      "DELETE FROM users WHERE role != 'SUPER_ADMIN'", "DELETE FROM complaints", "DELETE FROM gate_passes"
    ], "write");
  },

  resetToDefaults: async () => {
    await dataStore.wipeAllData();
    for (const r of MOCK_RESIDENTS) await dataStore.addResident(r);
  }
};
