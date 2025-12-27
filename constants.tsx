
import { Resident, ResidentType, BillingRecord, Complaint, GatePass, VisitorRecord, Expense, InventoryItem, MealPlan } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: '1',
    name: 'Ahmad Khan',
    cnic: '17301-1234567-1',
    phone: '0345-1234567',
    parentName: 'Irfan Khan',
    parentPhone: '0300-1122334',
    type: ResidentType.STUDENT,
    institutionOrOffice: 'University of Peshawar',
    roomNumber: '102-A',
    status: 'ACTIVE',
    admissionDate: '2023-09-01',
    inventory: ['Bed #102A', 'Chair #45', 'Locker #88'],
    // Added missing dues property
    dues: 15500
  },
  {
    id: '2',
    name: 'Zia-ur-Rehman',
    cnic: '17301-7654321-2',
    phone: '0312-9876543',
    parentName: 'Gul Khan',
    parentPhone: '0311-9988776',
    type: ResidentType.EMPLOYEE,
    institutionOrOffice: 'Bank of Khyber',
    roomNumber: '305-B',
    status: 'ACTIVE',
    admissionDate: '2024-01-15',
    inventory: ['Bed #305B', 'Study Table #12'],
    // Added missing dues property
    dues: 18000
  }
];

export const MOCK_BILLING: BillingRecord[] = [
  { id: 'b1', residentId: '1', amount: 15000, type: 'RENT', status: 'PAID', dueDate: '2024-05-05', paymentMethod: 'JAZZCASH' },
  { id: 'b2', residentId: '2', amount: 18000, type: 'RENT', status: 'UNPAID', dueDate: '2024-06-05' },
  { id: 'b3', residentId: '1', amount: 500, type: 'GENERATOR', status: 'UNPAID', dueDate: '2024-06-05' },
  { id: 'b4', residentId: '1', amount: 5000, type: 'SECURITY', status: 'PAID', dueDate: '2023-09-01', paymentMethod: 'CASH' }
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', title: 'PESCO Electricity Bill', amount: 45000, category: 'ELECTRICITY', date: '2024-05-15' },
  { id: 'e2', title: 'Water Tanker (3 Units)', amount: 6000, category: 'WATER', date: '2024-05-18' },
  { id: 'e3', title: 'Generator Diesel (20L)', amount: 5400, category: 'FUEL', date: '2024-05-20' }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'c1', residentId: '1', title: 'Fan capacitor failure', category: 'ELECTRICAL', status: 'OPEN', createdAt: '2024-05-20' },
  { id: 'c2', residentId: '2', title: 'Slow WiFi in wing B', category: 'INTERNET', status: 'IN_PROGRESS', createdAt: '2024-05-22' }
];

export const MOCK_GATE_PASSES: GatePass[] = [
  { id: 'g1', residentId: '1', requestType: 'NIGHT_STAY', destination: 'Mardan', departureDate: '2024-05-24', returnDate: '2024-05-26', status: 'PENDING' }
];

export const MOCK_VISITORS: VisitorRecord[] = [
  { id: 'v1', name: 'Salman Khan', cnic: '17301-9999999-1', residentId: '1', purpose: 'Brother visiting', checkInTime: '2024-05-23 14:00' }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Flour (Atta)', quantity: 150, unit: 'KG' },
  { id: 'i2', name: 'Cooking Oil', quantity: 45, unit: 'L' },
  { id: 'i3', name: 'Chicken', quantity: 12, unit: 'KG' }
];

export const MOCK_MEAL_PLAN: MealPlan[] = [
  { day: 'Monday', breakfast: 'Paratha & Omelette', lunch: 'Daal Mash', dinner: 'Chicken Karahi' },
  { day: 'Tuesday', breakfast: 'Bread & Jam', lunch: 'Aloo Matar', dinner: 'Beef Pulao' },
  { day: 'Wednesday', breakfast: 'Chanay & Kulcha', lunch: 'Mix Vegetable', dinner: 'Chicken Biryani' }
];
