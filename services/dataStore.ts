
import { createClient, Client } from '@libsql/client';
import { put } from '@vercel/blob';
import { Resident, BillingRecord, Room, Complaint, GatePass, Expense, InventoryItem } from '../types';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS } from '../constants';

const TURSO_URL = (process.env as any).TURSO_URL;
const TURSO_TOKEN = (process.env as any).TURSO_TOKEN;
const BLOB_TOKEN = (process.env as any).BLOB_READ_WRITE_TOKEN;

let client: Client | null = null;
let isOfflineMode = false;

// Helper: Check if Turso is properly configured
const isTursoConfigured = () => {
  return TURSO_URL && 
         TURSO_URL !== "" && 
         TURSO_URL !== "libsql://your-db-name.turso.io";
};

if (isTursoConfigured()) {
  client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN || "",
  });
} else {
  isOfflineMode = true;
}

// LocalStorage Keys
const LS_KEYS = {
  RESIDENTS: 'pesh_hms_residents',
  ROOMS: 'pesh_hms_rooms',
  BILLING: 'pesh_hms_billing',
  COMPLAINTS: 'pesh_hms_complaints',
  GATE_PASSES: 'pesh_hms_gate_passes',
  USERS: 'pesh_hms_users'
};

// Helper: LocalStorage CRUD
const ls = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Helper: Convert Base64 to Blob
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

export const dataStore = {
  isOffline: () => isOfflineMode,

  init: async () => {
    if (isOfflineMode || !client) {
      console.warn("HMS running in Local Storage mode (Turso not configured)");
      // Ensure local defaults exist
      if (!localStorage.getItem(LS_KEYS.USERS)) {
        ls.set(LS_KEYS.USERS, [{ identifier: 'admin', password: 'admin123', role: 'SUPER_ADMIN', name: 'Super Admin', id: 'admin_001' }]);
      }
      return;
    }

    try {
      // Test connection with a simple query before running batch
      await client.execute("SELECT 1");
      
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
      console.error("Turso Connection Failed. Falling back to Local Storage.", e);
      isOfflineMode = true;
    }
  },

  uploadBlob: async (base64Data: string): Promise<string> => {
    if (!BLOB_TOKEN || BLOB_TOKEN === "") {
      console.warn("Vercel Blob token missing, using base64 directly");
      return base64Data;
    }
    try {
      const blob = base64ToBlob(base64Data);
      const filename = `resident_${Date.now()}.png`;
      const { url } = await put(filename, blob, { access: 'public', token: BLOB_TOKEN });
      return url;
    } catch (e) {
      console.error("Blob upload failed", e);
      return base64Data;
    }
  },

  getResidents: async (): Promise<Resident[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
    const res = await client.execute("SELECT * FROM residents ORDER BY admissionDate DESC");
    return res.rows.map(row => ({ ...row, dues: Number(row.dues), profileImage: row.profileImageUrl } as unknown as Resident));
  },

  addResident: async (res: Resident) => {
    let profileImageUrl = res.profileImage;
    if (res.profileImage && res.profileImage.startsWith('data:')) {
      profileImageUrl = await dataStore.uploadBlob(res.profileImage);
    }

    if (isOfflineMode || !client) {
      const data = ls.get(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, [{ ...res, profileImage: profileImageUrl }, ...data]);
      return;
    }

    await client.execute({
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
      const data = ls.get<Resident[]>(LS_KEYS.RESIDENTS, MOCK_RESIDENTS);
      ls.set(LS_KEYS.RESIDENTS, data.filter(r => r.id !== id));
      return;
    }
    await client.execute({ sql: "DELETE FROM residents WHERE id = ?", args: [id] });
  },

  getRooms: async (): Promise<Room[]> => {
    if (isOfflineMode || !client) return ls.get(LS_KEYS.ROOMS, []);
    const res = await client.execute("SELECT * FROM rooms");
    return res.rows.map(row => ({ ...row, features: JSON.parse(row.features as string), currentOccupancy: Number(row.currentOccupancy), capacity: Number(row.capacity) } as unknown as Room));
  },

  setRooms: async (rooms: Room[]) => {
    if (isOfflineMode || !client) {
      ls.set(LS_KEYS.ROOMS, rooms);
      return;
    }
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
      const data = ls.get(LS_KEYS.USERS, []);
      ls.set(LS_KEYS.USERS, [...data, user]);
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
    if (isOfflineMode || !client) {
      ls.set(LS_KEYS.GATE_PASSES, passes);
      return;
    }
    await client.execute("DELETE FROM gate_passes");
    for (const p of passes) {
      await client.execute({
        sql: "INSERT INTO gate_passes (id, residentId, requestType, destination, departureDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.residentId, p.requestType, p.destination, p.departureDate, p.returnDate, p.status]
      });
    }
  },

  execute: async (stmt: any) => {
    if (isOfflineMode || !client) {
      console.warn("Manual SQL execution not supported in Offline Mode");
      return { rows: [] };
    }
    return await client.execute(stmt);
  },

  exportAllData: async (): Promise<string> => {
    const residents = await dataStore.getResidents();
    const rooms = await dataStore.getRooms();
    const billing = await dataStore.getBilling();
    const complaints = await dataStore.getComplaints();
    const passes = await dataStore.getGatePasses();
    const users = await dataStore.getUsers();
    return JSON.stringify({ residents, rooms, billing, complaints, gate_passes: passes, users }, null, 2);
  },

  importAllData: async (json: string) => {
    const data = JSON.parse(json);
    await dataStore.wipeAllData();
    if (data.residents) for (const r of data.residents) await dataStore.addResident(r);
    if (data.rooms) await dataStore.setRooms(data.rooms);
    if (data.billing) {
      if (isOfflineMode || !client) {
        ls.set(LS_KEYS.BILLING, data.billing);
      } else {
        for (const b of data.billing) {
          await client.execute({
            sql: "INSERT INTO billing (id, residentId, amount, type, status, dueDate, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [b.id, b.residentId, b.amount, b.type, b.status, b.dueDate, b.paymentMethod]
          });
        }
      }
    }
    if (data.complaints) {
      if (isOfflineMode || !client) {
        ls.set(LS_KEYS.COMPLAINTS, data.complaints);
      } else {
        for (const c of data.complaints) {
          await client.execute({
            sql: "INSERT INTO complaints (id, residentId, title, category, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            args: [c.id, c.residentId, c.title, c.category, c.status, c.createdAt]
          });
        }
      }
    }
    if (data.gate_passes) await dataStore.setGatePasses(data.gate_passes);
    if (data.users) {
      if (isOfflineMode || !client) {
        ls.set(LS_KEYS.USERS, data.users);
      } else {
        for (const u of data.users) await dataStore.addUser(u);
      }
    }
  },

  wipeAllData: async () => {
    if (isOfflineMode || !client) {
      Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
      return;
    }
    await client.batch([
      "DELETE FROM residents",
      "DELETE FROM rooms",
      "DELETE FROM billing",
      "DELETE FROM users WHERE role != 'SUPER_ADMIN'",
      "DELETE FROM complaints",
      "DELETE FROM gate_passes"
    ], "write");
  },

  resetToDefaults: async () => {
    await dataStore.wipeAllData();
    for (const r of MOCK_RESIDENTS) await dataStore.addResident(r);
    await dataStore.setRooms([
      { id: 'rm1', number: '102-A', type: 'AC_2', features: ['AC', 'Attached Bath'], status: 'AVAILABLE', currentOccupancy: 1, capacity: 2 },
      { id: 'rm2', number: '305-B', type: 'NON_AC_3', features: ['Fan', 'Locker'], status: 'AVAILABLE', currentOccupancy: 1, capacity: 3 }
    ]);
  }
};
