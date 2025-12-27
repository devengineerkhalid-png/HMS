
import { createClient } from '@libsql/client';
import { Resident, BillingRecord, Room, Complaint, GatePass, Expense, InventoryItem } from '../types';
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_COMPLAINTS, MOCK_INVENTORY } from '../constants';

const url = (process.env as any).TURSO_URL || "libsql://your-db-name.turso.io";
const authToken = (process.env as any).TURSO_TOKEN || "";

const client = createClient({
  url: url,
  authToken: authToken,
});

// Helper: Convert Base64 to Uint8Array for SQL BLOB
function base64ToUint8Array(base64: string): { data: Uint8Array, mimeType: string } {
  const parts = base64.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { data: bytes, mimeType };
}

// Helper: Convert ArrayBuffer/Uint8Array to Base64 for Browser
function arrayBufferToBase64(buffer: ArrayBuffer, mimeType: string): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

export const dataStore = {
  // Initialize tables including missing complaints and gate_passes
  init: async () => {
    try {
      await client.batch([
        `CREATE TABLE IF NOT EXISTS blobs (
          id TEXT PRIMARY KEY,
          data BLOB,
          mimeType TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS residents (
          id TEXT PRIMARY KEY, name TEXT, cnic TEXT, phone TEXT, email TEXT,
          parentName TEXT, parentPhone TEXT, type TEXT, institutionOrOffice TEXT,
          roomNumber TEXT, status TEXT, admissionDate TEXT, dues REAL,
          profileImageId TEXT, permanentAddress TEXT, currentAddress TEXT,
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
      console.log("Turso Blob Store Initialized");
    } catch (e) {
      console.error("Initialization Failed:", e);
    }
  },

  // Blob Operations
  uploadBlob: async (base64Data: string): Promise<string> => {
    const id = `blob_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { data, mimeType } = base64ToUint8Array(base64Data);
    await client.execute({
      sql: "INSERT INTO blobs (id, data, mimeType) VALUES (?, ?, ?)",
      args: [id, data.buffer, mimeType]
    });
    return id;
  },

  getBlob: async (id: string): Promise<string | null> => {
    const res = await client.execute({
      sql: "SELECT data, mimeType FROM blobs WHERE id = ?",
      args: [id]
    });
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return arrayBufferToBase64(row.data as ArrayBuffer, row.mimeType as string);
  },

  // Residents
  getResidents: async (): Promise<Resident[]> => {
    const res = await client.execute("SELECT * FROM residents ORDER BY admissionDate DESC");
    const residents: Resident[] = [];
    
    for (const row of res.rows) {
      let profileImage = undefined;
      if (row.profileImageId) {
        profileImage = await dataStore.getBlob(row.profileImageId as string) || undefined;
      }
      residents.push({
        ...row,
        dues: Number(row.dues),
        profileImage
      } as unknown as Resident);
    }
    return residents;
  },
  
  addResident: async (res: Resident) => {
    let profileImageId = null;
    if (res.profileImage && res.profileImage.startsWith('data:')) {
      profileImageId = await dataStore.uploadBlob(res.profileImage);
    }

    await client.execute({
      sql: `INSERT INTO residents (id, name, cnic, phone, email, parentName, parentPhone, type, 
            institutionOrOffice, roomNumber, status, admissionDate, dues, profileImageId, 
            permanentAddress, currentAddress, emergencyContactName, emergencyContactPhone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        res.id, res.name, res.cnic, res.phone, res.email || null, res.parentName, res.parentPhone, res.type,
        res.institutionOrOffice, res.roomNumber, res.status, res.admissionDate, res.dues, 
        profileImageId, res.permanentAddress || null, res.currentAddress || null, 
        res.emergencyContactName || null, res.emergencyContactPhone || null
      ]
    });
  },

  updateResident: async (id: string, updates: Partial<Resident>) => {
    let profileImageId = undefined;
    if (updates.profileImage && updates.profileImage.startsWith('data:')) {
      profileImageId = await dataStore.uploadBlob(updates.profileImage);
    }

    const updateFields = Object.keys(updates).filter(k => k !== 'id' && k !== 'profileImage');
    const setClauseParts = updateFields.map(k => `${k} = ?`);
    if (profileImageId) setClauseParts.push('profileImageId = ?');
    const setClause = setClauseParts.join(', ');

    const args = updateFields.map(k => (updates as any)[k]);
    if (profileImageId) args.push(profileImageId);
    args.push(id);

    if (setClause) {
      await client.execute({
        sql: `UPDATE residents SET ${setClause} WHERE id = ?`,
        args
      });
    }
  },

  deleteResident: async (id: string) => {
    const res = await client.execute({ sql: "SELECT profileImageId FROM residents WHERE id = ?", args: [id] });
    const blobId = res.rows[0]?.profileImageId;
    
    await client.execute({ sql: "DELETE FROM residents WHERE id = ?", args: [id] });
    if (blobId) {
      await client.execute({ sql: "DELETE FROM blobs WHERE id = ?", args: [blobId] });
    }
  },

  getRooms: async (): Promise<Room[]> => {
    const res = await client.execute("SELECT * FROM rooms");
    return res.rows.map(row => ({
      ...row,
      features: JSON.parse(row.features as string),
      currentOccupancy: Number(row.currentOccupancy),
      capacity: Number(row.capacity)
    } as unknown as Room));
  },

  setRooms: async (rooms: Room[]) => {
    await client.execute("DELETE FROM rooms");
    for (const r of rooms) {
      await client.execute({
        sql: "INSERT INTO rooms (id, number, type, features, status, currentOccupancy, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [r.id, r.number, r.type, JSON.stringify(r.features), r.status, r.currentOccupancy, r.capacity]
      });
    }
  },

  getBilling: async (): Promise<BillingRecord[]> => {
    const res = await client.execute("SELECT * FROM billing");
    return res.rows as unknown as BillingRecord[];
  },

  getUsers: async () => {
    const res = await client.execute("SELECT * FROM users");
    return res.rows;
  },

  addUser: async (user: any) => {
    await client.execute({
      sql: "INSERT INTO users (identifier, password, role, name, id) VALUES (?, ?, ?, ?, ?)",
      args: [user.identifier, user.password, user.role, user.name, user.id]
    });
  },

  // Fix: Added missing getComplaints method
  getComplaints: async (): Promise<Complaint[]> => {
    const res = await client.execute("SELECT * FROM complaints ORDER BY createdAt DESC");
    return res.rows as unknown as Complaint[];
  },

  // Fix: Added missing getGatePasses method
  getGatePasses: async (): Promise<GatePass[]> => {
    const res = await client.execute("SELECT * FROM gate_passes ORDER BY departureDate DESC");
    return res.rows as unknown as GatePass[];
  },

  // Fix: Added missing setGatePasses method
  setGatePasses: async (passes: GatePass[]) => {
    await client.execute("DELETE FROM gate_passes");
    for (const p of passes) {
      await client.execute({
        sql: "INSERT INTO gate_passes (id, residentId, requestType, destination, departureDate, returnDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [p.id, p.residentId, p.requestType, p.destination, p.departureDate, p.returnDate, p.status]
      });
    }
  },

  // Fix: Added missing execute method proxy for generic SQL queries
  execute: async (stmt: any) => {
    return await client.execute(stmt);
  },

  // Fix: Added missing exportAllData method
  exportAllData: async (): Promise<string> => {
    const residents = await dataStore.getResidents();
    const rooms = await dataStore.getRooms();
    const billing = await dataStore.getBilling();
    const complaints = await dataStore.getComplaints();
    const passes = await dataStore.getGatePasses();
    const users = await dataStore.getUsers();
    
    return JSON.stringify({ residents, rooms, billing, complaints, gate_passes: passes, users }, null, 2);
  },

  // Fix: Added missing importAllData method
  importAllData: async (json: string) => {
    const data = JSON.parse(json);
    await dataStore.wipeAllData();
    
    if (data.residents) {
      for (const r of data.residents) await dataStore.addResident(r);
    }
    if (data.rooms) await dataStore.setRooms(data.rooms);
    if (data.billing) {
      for (const b of data.billing) {
        await client.execute({
          sql: "INSERT INTO billing (id, residentId, amount, type, status, dueDate, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [b.id, b.residentId, b.amount, b.type, b.status, b.dueDate, b.paymentMethod]
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
    if (data.gate_passes) {
      await dataStore.setGatePasses(data.gate_passes);
    }
    if (data.users) {
      for (const u of data.users) await dataStore.addUser(u);
    }
  },

  // Fix: Added missing wipeAllData method
  wipeAllData: async () => {
    await client.batch([
      "DELETE FROM residents",
      "DELETE FROM rooms",
      "DELETE FROM billing",
      "DELETE FROM users WHERE role != 'SUPER_ADMIN'",
      "DELETE FROM complaints",
      "DELETE FROM gate_passes",
      "DELETE FROM blobs"
    ], "write");
  },

  // Fix: Added missing resetToDefaults method
  resetToDefaults: async () => {
    await dataStore.wipeAllData();
    // Re-insert mock data for demonstration
    for (const r of MOCK_RESIDENTS) await dataStore.addResident(r);
    await dataStore.setRooms([
      { id: 'rm1', number: '102-A', type: 'AC_2', features: ['AC', 'Attached Bath'], status: 'AVAILABLE', currentOccupancy: 1, capacity: 2 },
      { id: 'rm2', number: '305-B', type: 'NON_AC_3', features: ['Fan', 'Locker'], status: 'AVAILABLE', currentOccupancy: 1, capacity: 3 }
    ]);
    for (const b of MOCK_BILLING) {
      await client.execute({
        sql: "INSERT INTO billing (id, residentId, amount, type, status, dueDate, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [b.id, b.residentId, b.amount, b.type, b.status, b.dueDate, b.paymentMethod]
      });
    }
    for (const c of MOCK_COMPLAINTS) {
      await client.execute({
        sql: "INSERT INTO complaints (id, residentId, title, category, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        args: [c.id, c.residentId, c.title, c.category, c.status, c.createdAt]
      });
    }
  }
};
