
import { MOCK_RESIDENTS, MOCK_BILLING, MOCK_EXPENSES, MOCK_COMPLAINTS, MOCK_GATE_PASSES, MOCK_INVENTORY } from '../constants';
import { Resident, BillingRecord, Room, Complaint, GatePass, Expense, InventoryItem } from '../types';

const KEYS = {
  RESIDENTS: 'pesh_hms_residents',
  BILLING: 'pesh_hms_billing',
  EXPENSES: 'pesh_hms_expenses',
  COMPLAINTS: 'pesh_hms_complaints',
  GATE_PASSES: 'pesh_hms_gate_passes',
  ROOMS: 'pesh_hms_rooms',
  INVENTORY: 'pesh_hms_inventory',
  USERS: 'pesh_hms_auth_users'
};

const INITIAL_ROOMS: Room[] = [
  { id: 'rm1', number: '101-A', type: 'AC_2', features: ['AC', 'Locker', 'Attached Bath'], status: 'OCCUPIED', currentOccupancy: 2, capacity: 2 },
  { id: 'rm2', number: '102-A', type: 'AC_2', features: ['AC', 'Locker'], status: 'OCCUPIED', currentOccupancy: 1, capacity: 2 },
  { id: 'rm3', number: '201-B', type: 'NON_AC_3', features: ['Fan', 'Common Bath'], status: 'AVAILABLE', currentOccupancy: 1, capacity: 3 },
  { id: 'rm4', number: '202-B', type: 'NON_AC_3', features: ['Fan'], status: 'AVAILABLE', currentOccupancy: 0, capacity: 3 },
];

export const dataStore = {
  init: () => {
    if (!localStorage.getItem(KEYS.RESIDENTS)) localStorage.setItem(KEYS.RESIDENTS, JSON.stringify(MOCK_RESIDENTS));
    if (!localStorage.getItem(KEYS.BILLING)) localStorage.setItem(KEYS.BILLING, JSON.stringify(MOCK_BILLING));
    if (!localStorage.getItem(KEYS.EXPENSES)) localStorage.setItem(KEYS.EXPENSES, JSON.stringify(MOCK_EXPENSES));
    if (!localStorage.getItem(KEYS.COMPLAINTS)) localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(MOCK_COMPLAINTS));
    if (!localStorage.getItem(KEYS.GATE_PASSES)) localStorage.setItem(KEYS.GATE_PASSES, JSON.stringify(MOCK_GATE_PASSES));
    if (!localStorage.getItem(KEYS.ROOMS)) localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    if (!localStorage.getItem(KEYS.INVENTORY)) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(MOCK_INVENTORY));
    
    // Default Admin/Warden credentials
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify([
        { identifier: 'admin', password: 'admin123', role: 'SUPER_ADMIN', name: 'Super Admin' },
        { identifier: 'warden', password: 'warden123', role: 'WARDEN', name: 'Warden Ali' }
      ]));
    }
  },

  getResidents: (): Resident[] => JSON.parse(localStorage.getItem(KEYS.RESIDENTS) || '[]'),
  setResidents: (data: Resident[]) => localStorage.setItem(KEYS.RESIDENTS, JSON.stringify(data)),
  
  getRooms: (): Room[] => JSON.parse(localStorage.getItem(KEYS.ROOMS) || '[]'),
  setRooms: (data: Room[]) => localStorage.setItem(KEYS.ROOMS, JSON.stringify(data)),

  getBilling: (): BillingRecord[] => JSON.parse(localStorage.getItem(KEYS.BILLING) || '[]'),
  setBilling: (data: BillingRecord[]) => localStorage.setItem(KEYS.BILLING, JSON.stringify(data)),

  getComplaints: (): Complaint[] => JSON.parse(localStorage.getItem(KEYS.COMPLAINTS) || '[]'),
  setComplaints: (data: Complaint[]) => localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(data)),

  getGatePasses: (): GatePass[] => JSON.parse(localStorage.getItem(KEYS.GATE_PASSES) || '[]'),
  setGatePasses: (data: GatePass[]) => localStorage.setItem(KEYS.GATE_PASSES, JSON.stringify(data)),

  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]'),
  setExpenses: (data: Expense[]) => localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data)),

  getUsers: () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  addUser: (user: any) => {
    const users = dataStore.getUsers();
    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, user]));
  }
};
