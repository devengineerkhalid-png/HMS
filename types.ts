
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  WARDEN = 'WARDEN',
  RESIDENT = 'RESIDENT',
  ACCOUNTANT = 'ACCOUNTANT',
  GUEST = 'GUEST'
}

export enum ResidentType {
  STUDENT = 'STUDENT',
  EMPLOYEE = 'EMPLOYEE'
}

export interface Resident {
  id: string;
  name: string;
  cnic: string;
  phone: string;
  email?: string;
  parentName: string;
  parentPhone: string;
  type: ResidentType;
  institutionOrOffice: string;
  roomNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  admissionDate: string;
  inventory?: string[];
  profileImage?: string;
  dues: number;
  permanentAddress?: string;
  currentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'AC_2' | 'AC_3' | 'NON_AC_2' | 'NON_AC_3' | 'HALL';
  features: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  currentOccupancy: number;
  capacity: number;
}

export interface BillingRecord {
  id: string;
  residentId: string;
  amount: number;
  type: 'RENT' | 'SECURITY' | 'ADMISSION' | 'UTILITY' | 'FINE' | 'GENERATOR';
  status: 'PAID' | 'UNPAID';
  dueDate: string;
  paymentMethod?: 'CASH' | 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER';
}

export interface Complaint {
  id: string;
  residentId: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'INTERNET' | 'CLEANING' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface GatePass {
  id: string;
  residentId: string;
  requestType: 'NIGHT_STAY' | 'DAY_OUT' | 'LEAVE';
  destination: string;
  departureDate: string;
  returnDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserAccount {
  identifier: string;
  password: string;
  role: UserRole;
  name: string;
  id: string;
}

// Added VisitorRecord interface to support MOCK_VISITORS in constants.tsx
export interface VisitorRecord {
  id: string;
  name: string;
  cnic: string;
  residentId: string;
  purpose: string;
  checkInTime: string;
}

// Added Expense interface to support MOCK_EXPENSES in constants.tsx
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'ELECTRICITY' | 'WATER' | 'FUEL' | 'MAINTENANCE' | 'OTHER' | string;
  date: string;
}

// Added InventoryItem interface to support MOCK_INVENTORY in constants.tsx
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
}

// Added MealPlan interface to support MOCK_MEAL_PLAN in constants.tsx
export interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}
