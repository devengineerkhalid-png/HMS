
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
}

export interface RoomApplication {
  id: string;
  residentId: string;
  roomType: 'AC_2' | 'AC_3' | 'NON_AC_2' | 'NON_AC_3' | 'HALL';
  hostelId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
}

export interface HostelConfig {
  name: string;
  branch: string;
  city: string;
  address: string;
  themeColor: string;
  logoUrl?: string;
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

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'ELECTRICITY' | 'GAS' | 'WATER' | 'STAFF' | 'FUEL' | 'OTHER';
  date: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'INTERNET' | 'CLEANING' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

// Added missing GatePass interface
export interface GatePass {
  id: string;
  residentId: string;
  requestType: 'NIGHT_STAY' | 'DAY_OUT' | 'LEAVE';
  destination: string;
  departureDate: string;
  returnDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Added missing VisitorRecord interface
export interface VisitorRecord {
  id: string;
  name: string;
  cnic: string;
  residentId: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
}

// Added missing InventoryItem interface
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

// Added missing MealPlan interface
export interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}
