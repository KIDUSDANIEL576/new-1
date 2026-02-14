
import { 
  Plan, User, UserRole, Pharmacy, PharmacyPlan, Sale, 
  InventoryItem, UpgradeRequest, PatientPlan, SecurityLog, 
  SystemSafety, SystemAnnouncement, IntegrityAlert,
  RevenueLedger, AuditLog, B2BRequest, B2BBid, B2BTransaction, Notification,
  B2BTransactionStatus, StaffMember, ProductIntelligence
} from '../types';

// Root Identity Vault - Persistence Layer
export let users: User[] = [
  { 
    id: 'root-01', 
    email: 'admin@medintellicare.com', 
    password: 'admin', 
    name: 'Super Admin', 
    role: UserRole.SUPER_ADMIN, 
    isActive: true, 
    isApproved: true,
    isVerified: true,
    createdAt: '2023-01-01' 
  }
];

export let b2bRequests: B2BRequest[] = [];
export let b2bBids: B2BBid[] = [];
export let b2bTransactions: B2BTransaction[] = [];
export let notifications: Notification[] = [];
export let auditLogs: AuditLog[] = [
  { id: '1', timestamp: new Date().toISOString(), action: 'Node Initialization', user: 'system', details: 'Hub Pegasus connection online.' }
];

export let pharmacies: Pharmacy[] = [
  { id: 'pharm-1', name: 'Abbebe Pharmacy', email: 'admin@abbebe.com', phone: '0911223344', address: 'Bole, AA', plan: PharmacyPlan.PLATINUM, status: 'Active', createdAt: '2024-12-24', staffCount: 12 },
];

export const mockPlans: Plan[] = [
  {
    id: 'p-basic',
    name: 'Basic Node',
    pricing: { monthly: 49, yearly: 490, yearlyDiscount: 15 },
    limits: { inventoryItems: 200, staffMembers: 0 },
    description: 'Essential connectivity for small independent pharmacies.',
    features: [
      { id: 'f1', name: 'Inventory Tracking', description: 'Real-time stock monitoring' },
      { id: 'f2', name: 'Digital Prescriptions', description: 'Receive clinical directives' }
    ]
  },
  {
    id: 'p-standard',
    name: 'Standard Node',
    pricing: { monthly: 99, yearly: 990, yearlyDiscount: 15 },
    limits: { inventoryItems: 300, staffMembers: 'unlimited' },
    description: 'Full POS and staff management for growing pharmacies.',
    isPopular: true,
    features: [
      { id: 'f1', name: 'Inventory Tracking', description: 'Real-time stock monitoring' },
      { id: 'f2', name: 'Digital Prescriptions', description: 'Receive clinical directives' },
      { id: 'f3', name: 'Sales Terminal', description: 'Full POS functionality' }
    ]
  }
];

// Helper: Notification Dispatcher
const createNotification = (data: Partial<Notification>) => {
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    type: data.type || 'SYSTEM_ALERT',
    title: data.title || 'System Alert',
    message: data.message || '',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...data
  };
  notifications.unshift(newNotif);
  return newNotif;
};

// Helper: Audit Logger
const logAudit = (action: string, user: string, details: string) => {
  auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    user,
    details
  });
};

export const mockApi = {
  // --- Auth & Root Gatekeeping ---
  login: async (email: string, password?: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) return { success: false, message: "Access Denied: Node identity not found in the hub database." };
    if (!user.isApproved) return { success: false, message: "ACCOUNT UNDER REVIEW: Access is restricted until admin verifies identity and payment." };
    
    if (user.password && password !== user.password) {
      return { success: false, message: "Credential mismatch: Incorrect password protocol." };
    }

    return { success: true, user };
  },

  signup: async (data: Partial<User>) => {
    const existing = users.find(u => u.email === data.email);
    if (existing) throw new Error("Email already registered in the identity vault.");

    const newUser: User = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      email: data.email || '',
      name: data.name || '',
      phone: data.phone || '',
      role: data.role || UserRole.RETAIL_PHARMACY,
      purpose: data.purpose || 'General Access',
      isActive: false,
      isApproved: false,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    
    createNotification({
      type: 'NEW_SIGNUP',
      title: 'New Access Request',
      message: `${newUser.name} requested access as ${newUser.role}.`
    });

    logAudit('SIGNUP_INTENT', 'guest', `New enrollment protocol started for ${newUser.email}`);
    
    return { success: true, message: "ACCOUNT UNDER REVIEW" };
  },

  // --- Admin Control Panel ---
  getRegistrationQueue: async () => users.filter(u => !u.isApproved),
  
  approveAndDispatch: async (userId: string, credentials: { password?: string, plan?: any }) => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User node not found");

    user.isApproved = true;
    user.isActive = true;
    user.password = credentials.password || 'MED-INIT-123';
    user.plan = credentials.plan;

    // Auto-create Pharmacy Node if role is Retail Pharmacy
    if (user.role === UserRole.RETAIL_PHARMACY) {
      const newPharm: Pharmacy = {
        id: `pharm-${Math.random().toString(36).substr(2, 5)}`,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: 'Pending Dispatch Location',
        plan: credentials.plan || PharmacyPlan.BASIC,
        status: 'Active',
        staffCount: 1,
        createdAt: new Date().toISOString()
      };
      pharmacies.push(newPharm);
      user.organizationId = newPharm.id;
      user.pharmacyId = newPharm.id;
    }

    logAudit('ACCESS_DISPATCHED', 'super_admin', `Authorized access and password for ${user.email}. Role: ${user.role}`);
    return user;
  },

  rejectRegistration: async (userId: string) => {
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const u = users[idx];
      users.splice(idx, 1);
      logAudit('REGISTRATION_REJECTED', 'super_admin', `Decommissioned request from ${u.email}`);
    }
  },

  getPharmacies: async () => [...pharmacies],
  getDoctors: async () => users.filter(u => u.role === UserRole.RETAIL_PHARMACY && u.isApproved),
  getPatients: async () => users.filter(u => u.role === UserRole.RETAIL_PHARMACY && u.isApproved),
  getSystemSafety: async (): Promise<SystemSafety> => ({ kill_switch_active: false, pause_requests: false, rate_limit_per_day: 50, system_version: '4.2 Pegasus Root', primary_color: '#007E85' }),
  
  getRevenueLedger: async (): Promise<RevenueLedger> => ({
    aggregateTotal: 14250, nrr: 114.5, churnRate: 1.2, activeNodes: pharmacies.length,
    bySource: { basicPlans: 2450, standardPlans: 5600, platinumPlans: 6200, doctors: 1200, patients: 800, pharmacies: 1500 },
    history: { weekly: [], monthly: [], yearly: [] }
  }),

  // --- B2B Marketplace Support ---
  listAnonymousRequests: async () => b2bRequests.filter(r => r.status === 'open' || r.status === 'bid_received'),
  listMyTransactions: async (orgId: string) => b2bTransactions.filter(t => t.pharmacyId === orgId || t.supplierId === orgId),
  getNotifications: async (orgId?: string) => notifications.filter(n => !n.targetOrgId || n.targetOrgId === orgId),
  markNotificationRead: async (id: string) => { const n = notifications.find(notif => notif.id === id); if (n) n.isRead = true; },
  getAuditLogs: async () => [...auditLogs],
  getIntegrityAlerts: async (): Promise<IntegrityAlert[]> => [
    { id: 'a1', timestamp: new Date().toISOString(), description: 'Unapproved node attempt blocked from IP 192.168.1.1', impact: 'low' }
  ],
  getAnnouncements: async (): Promise<SystemAnnouncement[]> => [],
  getPlans: async (): Promise<Plan[]> => mockPlans,
  checkEmailExists: async (email: string) => users.some(u => u.email === email),
  updateSafety: async (d: any) => ({ ...d }),
  getProductIntelligence: async (): Promise<ProductIntelligence> => ({ avgTimeToFirstInventory: 2, avgTimeToFirstSale: 4, paywallHits: 1240, featureAdoption: [] }),
  getGlobalInventory: async (): Promise<InventoryItem[]> => [],
  getGlobalSales: async (): Promise<Sale[]> => [],
  getUpgradeRequests: async (): Promise<UpgradeRequest[]> => [],
  getSecurityLogs: async (): Promise<SecurityLog[]> => [],
  getInfrastructurePulse: async () => ({ dau: [], tenantGrowth: [] }),
  updatePharmacy: async (i: any, d: any) => d,
  togglePharmacyStatus: async (id: string) => {},
  forceUpgrade: async (id: string, plan: PharmacyPlan) => {},
  deletePharmacy: async (id: string) => {},
  addDoctor: async (d: any) => d,
  updateDoctor: async (i: any, d: any) => {},
  deleteDoctor: async (i: any) => {},
  approvePatient: async (i: any, a: any) => {},
  rejectPatient: async (i: any) => {},
  deletePatient: async (i: any) => {},
  approveUpgrade: async (i: any) => {},
  rejectUpgrade: async (i: any) => {},
  requestUpgrade: async (pId: any, plan: any) => {},
  setPharmacyCredentials: async (i: any, c: any) => {},
  setDoctorCredentials: async (i: any, c: any) => {},
  updatePlan: async (i: any, d: any) => {},
  addPharmacy: async (data: any) => {
    const newPharm: Pharmacy = {
      id: `pharm-${Math.random().toString(36).substr(2, 5)}`,
      status: 'Active', staffCount: 1, createdAt: new Date().toISOString(), ...data
    };
    pharmacies.push(newPharm);
    return newPharm;
  },
  createB2BRequest: async (orgId: string, data: any) => {
    const newReq: B2BRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      anonymousPharmacyId: `PHARM-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      actualPharmacyId: orgId, status: 'open', isIdentityRevealed: false, bidsCount: 0, createdAt: new Date().toISOString(), ...data
    };
    b2bRequests.unshift(newReq);
    return newReq;
  },
  submitB2BBid: async (orgId: string, data: any) => {
    const newBid: B2BBid = {
      id: `bid-${Math.random().toString(36).substr(2, 9)}`,
      anonymousSupplierId: `SUPP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      actualSupplierId: orgId, status: 'submitted', isIdentityRevealed: false, createdAt: new Date().toISOString(),
      totalPrice: data.pricePerUnit * (data.quantity || 100),
      deliveryDate: new Date(Date.now() + (data.deliveryDays * 86400000)).toISOString(), ...data
    };
    b2bBids.unshift(newBid);
    return newBid;
  },
  acceptB2BBid: async (bidId: string, orgId: string) => {
    const bid = b2bBids.find(b => b.id === bidId);
    if (!bid) throw new Error("Bid not found");
    const tx: B2BTransaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      requestId: bid.requestId, bidId: bid.id, pharmacyId: orgId, supplierId: bid.actualSupplierId,
      medicineName: 'Consolidated Batch', quantity: 100, unitPrice: bid.pricePerUnit, totalAmount: bid.totalPrice,
      status: 'accepted', paymentStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    b2bTransactions.unshift(tx);
    return { success: true, transaction: tx, supplierDetails: { name: 'Supplier Hub', phone: '09xxxxxxxx', address: 'Bole' } };
  },
  updateTransactionStatus: async (txId: string, status: B2BTransactionStatus) => {
    const tx = b2bTransactions.find(t => t.id === txId);
    if (tx) { tx.status = status; tx.updatedAt = new Date().toISOString(); }
  },
  getSuppliers: async () => [{ id: 'supp-1', name: 'Global Pharma', category: 'Distributor', date: '2024-01-01', contact: 'Sales Hub' }]
};
