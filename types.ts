

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  IMPORTER_MANUFACTURER = 'importer_manufacturer',
  WHOLESALER_DISTRIBUTOR = 'wholesaler_distributor',
  RETAIL_PHARMACY = 'retail_pharmacy',
  EQUIPMENT_SUPPLIER = 'equipment_supplier',
  LOGISTICS_PARTNER = 'logistics_partner',
  // Added missing roles used in the application
  PHARMACY_ADMIN = 'pharmacy_admin',
  PHARMACIST = 'pharmacist',
  SALES_PERSON = 'sales_person',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  SUPPLIER = 'supplier'
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

export type OrganizationType = 'pharmacy' | 'supplier' | 'importer' | 'wholesaler';

export interface B2BRequest {
  id: string;
  anonymousPharmacyId: string;
  actualPharmacyId: string;
  medicineName: string;
  quantity: number;
  requiredByDate: string;
  specialRequirements?: string;
  status: 'open' | 'bid_received' | 'accepted' | 'cancelled';
  isIdentityRevealed: boolean;
  bidsCount: number;
  createdAt: string;
}

export interface B2BBid {
  id: string;
  requestId: string;
  anonymousSupplierId: string;
  actualSupplierId: string;
  pricePerUnit: number;
  totalPrice: number;
  deliveryDays: number;
  deliveryDate: string;
  notes?: string;
  status: 'submitted' | 'accepted' | 'rejected' | 'expired';
  isIdentityRevealed: boolean;
  createdAt: string;
}

export type B2BTransactionStatus = 
  | 'draft' 
  | 'quote_requested' 
  | 'quote_sent' 
  | 'accepted' 
  | 'paid' 
  | 'dispatched' 
  | 'delivered' 
  | 'closed' 
  | 'disputed'
  // Added missing statuses used in the application
  | 'completed'
  | 'pending'
  | 'shipped';

export interface B2BTransaction {
  id: string;
  requestId: string;
  bidId: string;
  pharmacyId: string;
  supplierId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: B2BTransactionStatus;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'NEW_REQUEST' | 'NEW_BID' | 'BID_ACCEPTED' | 'BID_REJECTED' | 'REQUEST_CANCELLED' | 'SYSTEM_ALERT' | 'NEW_SIGNUP';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
  targetUserId?: string;
  targetOrgId?: string;
}

export type InventoryCategory = 'Medicine' | 'Painkiller' | 'Antibiotic' | 'Antiviral' | 'Antihistamine' | 'Vitamin' | 'Cosmetics' | 'Supplies' | 'Other';

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineName: string;
  brandName: string; // Required per spec
  category: InventoryCategory;
  stock: number;
  expiryDate: string; // Mandatory
  batchNumber: string; // Mandatory
  costPrice: number;
  price: number;
  brand: string;
  sku: string;
  originCountry?: string;
  regulatoryStatus?: string;
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

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  entityType?: string;
  entityId?: string;
  organizationId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  username?: string;
  organizationId?: string; 
  pharmacyId?: string;
  isActive: boolean;
  isApproved: boolean; 
  isVerified: boolean; // Verification Gating
  purpose?: string;    
  plan?: PharmacyPlan | PatientPlan;
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

export interface SystemSafety {
  kill_switch_active: boolean;
  pause_requests: boolean;
  rate_limit_per_day: number;
  system_version: string;
  primary_color: string;
  logo_url?: string;
  bg_url?: string;
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

export interface Sale {
  id: string;
  pharmacyId: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  amount?: number;
  isDeleted?: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: PharmacyPlan;
  status: string;
  expiryDate?: string;
  planStartDate?: string;
  staffCount: number;
  createdAt: string;
  lastLogin?: string;
  type?: string;
  isVerified?: boolean;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ProductIntelligence {
  avgTimeToFirstInventory: number;
  avgTimeToFirstSale: number;
  featureAdoption: { feature: string; adoptionRate: number }[];
  paywallHits: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  active: boolean;
}

export interface IntegrityAlert {
  id: string;
  timestamp: string;
  description: string;
  impact: string;
}

export interface UpgradeRequest {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  requestedPlan: PharmacyPlan;
  status: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  sales: number;
  rating: number;
  status: string;
}

export interface BonusGrant {
  id: string;
  pharmacyId: string;
  amount: number;
  reason: string;
  date: string;
}

export interface HolidayTheme {
  id: string;
  name: string;
  isActive: boolean;
}

export interface SystemVersion {
  version: string;
  releaseDate: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: string;
}