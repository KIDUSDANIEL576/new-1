
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  PHARMACY_ADMIN = 'Pharmacy Admin',
  PHARMACIST = 'Pharmacist',
  SALES_PERSON = 'Sales Person',
  DOCTOR = 'Doctor',
  PATIENT = 'Patient'
}

export enum PharmacyPlan {
  BASIC = 'Basic',
  STANDARD = 'Standard',
  PLATINUM = 'Platinum'
}

export enum PatientPlan {
  FREE = 'Patient Free',
  PAID = 'Patient Paid'
}

export type InventoryCategory = 'Medicine' | 'Painkiller' | 'Antibiotic' | 'Antiviral' | 'Antihistamine' | 'Vitamin' | 'Cosmetics' | 'Supplies' | 'Other';

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineName: string;
  category: InventoryCategory;
  stock: number;
  expiryDate: string;
  costPrice: number;
  price: number;
  batchNumber: string;
  brand: string;
  sku: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  prescriptionCode: string;
  details: string;
  status: 'Active' | 'Fulfilled' | 'Void';
  createdAt: string;
}

export interface Pharmaceutical {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  licenseNumber?: string;
  address?: string;
}

export interface HolidayTheme {
  id: string;
  name: string;
  message: string;
  primaryColor: string;
  mode: 'Holiday' | 'Standard';
  watermarkUrl?: string;
  isActive: boolean;
}

export interface SystemVersion {
  id: string;
  name: string;
  releaseDate: string;
  description: string;
  features: string[];
  status: 'Draft' | 'Scheduled' | 'Active' | 'Archived';
  poll?: {
    question: string;
    options: string[];
  };
}

export interface BonusGrant {
  id: string;
  clientId: string;
  clientName: string;
  feature: string;
  startDate: string;
  expiryDate: string;
}

export interface FeedbackEntry {
  id: string;
  user: string;
  suggestion: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Reviewed' | 'Implemented';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  username?: string;
  plan?: PharmacyPlan | PatientPlan;
  pharmacyId?: string;
  clinicName?: string;
  licenseNumber?: string;
  patientStatus?: 'pending_approval' | 'active' | 'rejected';
  lastLogin?: string;
  createdAt?: string;
  phone?: string;
  e_signature_url?: string;
  status?: string;
  total_prescriptions?: number;
  staffCount?: number;
  address?: string;
  referralCode?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'abuse' | 'duplicate_signup' | 'credential_conflict' | 'integrity_alert';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ProductIntelligence {
  avgTimeToFirstInventory: number;
  avgTimeToFirstSale: number;
  featureAdoption: { feature: string; adoptionRate: number }[];
  paywallHits: number;
  upgradePressure: { feature: string; hits: number }[];
}

export interface SystemSafety {
  kill_switch_active: boolean;
  pause_requests: boolean;
  rate_limit_per_day: number;
  system_version: string;
  primary_color: string;
  logo_url?: string;
  bg_url?: string;
}

export interface Sale {
  id: string;
  pharmacyId: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  amount?: number; // Used for revenue ledger
  isDeleted?: boolean;
}

export interface UpgradeRequest {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  requestedPlan: PharmacyPlan;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  sales: number;
  rating: number;
  status: 'Active' | 'Inactive';
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning';
  active: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: PharmacyPlan;
  status: 'Active' | 'Inactive' | 'Expiring';
  expiryDate: string;
  planStartDate?: string;
  staffCount: number;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface IntegrityAlert {
  id: string;
  timestamp: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface RevenueLedger {
  aggregateTotal: number;
  nrr: number;
  churnRate: number;
  activeNodes: number;
  bySource: {
    basicPlans: number;
    standardPlans: number;
    platinumPlans: number;
    doctors: number;
    patients: number;
    pharmacies: number;
  };
  history: {
    weekly: { name: string; revenue: number; churned: number }[];
    monthly: { name: string; revenue: number; churned: number }[];
    yearly: { name: string; revenue: number; churned: number }[];
  };
}

export interface Plan {
  id: string;
  name: string;
  pricing: {
    monthly: number;
    yearly: number;
    yearlyDiscount: number;
  };
  limits: {
    inventoryItems: number | 'unlimited';
    staffMembers?: number | 'unlimited';
  };
  description?: string;
  features: { id: string; name: string; description: string }[];
  isPopular?: boolean;
}
