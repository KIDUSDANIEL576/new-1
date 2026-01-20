
import { 
  Plan, User, UserRole, Pharmacy, PharmacyPlan, Sale, 
  InventoryItem, UpgradeRequest, PatientPlan, SecurityLog, 
  SystemSafety, HolidayTheme, SystemVersion, BonusGrant, FeedbackEntry,
  Pharmaceutical, ProductIntelligence, SystemAnnouncement, IntegrityAlert,
  RevenueLedger, AuditLog
} from '../types';

export let pharmacies: Pharmacy[] = [
  { id: 'p1', name: 'Abbebe Pharmacy', email: 'admin@abbebe.com', phone: '0911223344', address: 'Bole, AA', plan: PharmacyPlan.PLATINUM, status: 'Active', expiryDate: '2025-12-24', planStartDate: '2024-12-24', staffCount: 12, createdAt: '2024-12-24', lastLogin: '2024-12-25 10:30 AM' },
  { id: 'p2', name: 'Kidus Pharmacy', email: 'contact@kidus.com', phone: '0911556677', address: 'Piassa, AA', plan: PharmacyPlan.STANDARD, status: 'Active', expiryDate: '2025-11-20', planStartDate: '2024-11-20', staffCount: 8, createdAt: '2024-11-20', lastLogin: '2024-12-24 09:15 AM' },
];

export let doctors: User[] = [
  { id: 'd1', name: 'Dr. Jane Smith', email: 'jane@clinic.com', role: UserRole.DOCTOR, clinicName: 'Smith Health', status: 'Active', createdAt: '2023-11-20', total_prescriptions: 142, e_signature_url: 'https://placehold.co/200x100?text=Jane+Smith+Sig' }
];

export let patients: User[] = [
  { id: 'pat1', name: 'Abebe Kebede', email: 'abebe@mail.com', role: UserRole.PATIENT, plan: PatientPlan.FREE, patientStatus: 'active', createdAt: '2024-10-01' },
  { id: 'pat2', name: 'Sara Melaku', email: 'sara@mail.com', role: UserRole.PATIENT, plan: PatientPlan.FREE, patientStatus: 'pending_approval', createdAt: '2024-12-25' }
];

export let upgradeRequests: UpgradeRequest[] = [
  { id: 'req-1', pharmacyId: 'p2', pharmacyName: 'Kidus Pharmacy', requestedPlan: PharmacyPlan.PLATINUM, status: 'pending', createdAt: new Date().toISOString() }
];

export let revenueLedger: RevenueLedger = {
  aggregateTotal: 14250,
  nrr: 114.5,
  churnRate: 1.2,
  activeNodes: 42,
  bySource: {
    basicPlans: 2450,
    standardPlans: 5600,
    platinumPlans: 6200,
    doctors: 1200,
    patients: 800,
    pharmacies: 1500,
  },
  history: {
    weekly: [
      { name: 'Mon', revenue: 1200, churned: 0 },
      { name: 'Tue', revenue: 1500, churned: 49 },
      { name: 'Wed', revenue: 900, churned: 0 },
      { name: 'Thu', revenue: 2100, churned: 0 },
      { name: 'Fri', revenue: 1800, churned: 0 },
      { name: 'Sat', revenue: 2400, churned: 99 },
      { name: 'Sun', revenue: 2200, churned: 0 },
    ],
    monthly: [
      { name: 'Week 1', revenue: 8400, churned: 149 },
      { name: 'Week 2', revenue: 9100, churned: 0 },
      { name: 'Week 3', revenue: 7800, churned: 99 },
      { name: 'Week 4', revenue: 10200, churned: 49 },
    ],
    yearly: [
      { name: 'Jan', revenue: 32000, churned: 400 },
      { name: 'Feb', revenue: 35000, churned: 250 },
      { name: 'Mar', revenue: 38000, churned: 300 },
      { name: 'Apr', revenue: 36000, churned: 600 },
      { name: 'May', revenue: 41000, churned: 150 },
      { name: 'Jun', revenue: 44000, churned: 200 },
      { name: 'Jul', revenue: 42000, churned: 450 },
      { name: 'Aug', revenue: 48000, churned: 100 },
      { name: 'Sep', revenue: 51000, churned: 50 },
      { name: 'Oct', revenue: 55000, churned: 120 },
      { name: 'Nov', revenue: 59000, churned: 80 },
      { name: 'Dec', revenue: 64000, churned: 40 },
    ]
  }
};

export const mockPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Essential tools for small pharmacies.',
    pricing: { monthly: 49, yearly: 490, yearlyDiscount: 15 },
    limits: { inventoryItems: 200, staffMembers: 0 },
    features: [
      { id: '1', name: 'Inventory tracking', description: '200 Items limit' },
      { id: '2', name: 'Alerts', description: 'Low-stock & Expiry alerts' }
    ]
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    description: 'Advanced management for growing pharmacies.',
    isPopular: true,
    pricing: { monthly: 99, yearly: 990, yearlyDiscount: 15 },
    limits: { inventoryItems: 300, staffMembers: 5 },
    features: [
      { id: '1', name: 'Sales POS', description: 'Full terminal support' },
      { id: '2', name: 'Staff Management', description: 'Up to 5 authorized users' }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    description: 'The ultimate intelligence suite.',
    pricing: { monthly: 149, yearly: 1490, yearlyDiscount: 20 },
    limits: { inventoryItems: 'unlimited', staffMembers: 'unlimited' },
    features: [
      { id: '1', name: 'B2B Marketplace', description: 'Direct supplier ordering' },
      { id: '2', name: 'Advanced Analytics', description: 'AI insights & predictions' }
    ]
  }
];

export let systemSafety: SystemSafety = {
  kill_switch_active: false,
  pause_requests: false,
  rate_limit_per_day: 50,
  system_version: '4.0 Pegasus',
  primary_color: '#007E85'
};

export let announcements: SystemAnnouncement[] = [
  { id: 'a1', title: 'System Protocol Update', message: 'All pharmacy nodes must verify e-signatures by EOD.', type: 'warning', active: true },
  { id: 'a2', title: 'Network Maintenance', message: 'The hub will undergo optimization at 02:00 UTC.', type: 'info', active: true }
];

export let integrityAlerts: IntegrityAlert[] = [
  { id: 'ia1', timestamp: new Date().toISOString(), description: 'Duplicate Email Conflict: admin@abbebe.com found in two nodes.', impact: 'high' },
  { id: 'ia2', timestamp: new Date().toISOString(), description: 'Anomalous Traffic: 15 failed login attempts from Sector 7 IP.', impact: 'medium' },
  { id: 'ia3', timestamp: new Date().toISOString(), description: 'Data Inconsistency: Sale REC-441 linked to deleted Node P-09.', impact: 'high' }
];

// Added mock audit logs
export let auditLogs: AuditLog[] = [
  { id: '1', timestamp: new Date().toISOString(), action: 'System Initialization', user: 'root', details: 'Core telemetry protocols online.' },
  { id: '2', timestamp: new Date().toISOString(), action: 'Node Connection', user: 'admin@abbebe.com', details: 'Abbebe Pharmacy node synchronized.' }
];

export const mockApi = {
  getRevenueLedger: async (): Promise<RevenueLedger> => revenueLedger,
  
  getInfrastructurePulse: async () => ({
    dau: [
      { name: 'Mon', count: 1200 },
      { name: 'Tue', count: 1450 },
      { name: 'Wed', count: 1100 },
      { name: 'Thu', count: 1800 },
      { name: 'Fri', count: 1650 },
      { name: 'Sat', count: 900 },
      { name: 'Sun', count: 850 },
    ],
    tenantGrowth: [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 18 },
      { name: 'Mar', count: 25 },
      { name: 'Apr', count: 32 },
      { name: 'May', count: 42 },
    ]
  }),

  checkEmailExists: async (email: string) => {
    const allEmails = [
      ...pharmacies.map(p => p.email),
      ...doctors.map(d => d.email),
      ...patients.map(pat => pat.email)
    ];
    return allEmails.includes(email);
  },

  getPharmacies: async () => [...pharmacies],
  addPharmacy: async (data: any) => {
    const newP = { ...data, id: `p${Date.now()}`, lastLogin: 'Never', staffCount: 0, createdAt: new Date().toISOString(), status: 'Active' };
    pharmacies.push(newP);
    return newP;
  },
  updatePharmacy: async (id: string, data: any) => {
    const idx = pharmacies.findIndex(p => p.id === id);
    if (idx !== -1) pharmacies[idx] = { ...pharmacies[idx], ...data };
    return pharmacies[idx];
  },
  deletePharmacy: async (id: string) => {
    const idx = pharmacies.findIndex(p => p.id === id);
    if (idx !== -1) pharmacies.splice(idx, 1);
  },
  togglePharmacyStatus: async (id: string) => {
    const p = pharmacies.find(pharm => pharm.id === id);
    if (p) p.status = p.status === 'Active' ? 'Inactive' : 'Active';
  },
  setPharmacyCredentials: async (id: string, creds: any) => {
    console.log(`Setting credentials for pharmacy ${id}:`, creds);
  },
  forceUpgrade: async (id: string, plan: PharmacyPlan) => {
    const p = pharmacies.find(pharm => pharm.id === id);
    if (p) p.plan = plan;
  },
  
  getDoctors: async () => [...doctors],
  addDoctor: async (data: any) => {
    const newD = { ...data, id: `d${Date.now()}`, role: UserRole.DOCTOR, total_prescriptions: 0, status: 'Active', createdAt: new Date().toISOString() };
    doctors.push(newD);
    return newD;
  },
  updateDoctor: async (id: string, data: any) => {
    const idx = doctors.findIndex(d => d.id === id);
    if (idx !== -1) doctors[idx] = { ...doctors[idx], ...data };
    return doctors[idx];
  },
  deleteDoctor: async (id: string) => {
    const idx = doctors.findIndex(d => d.id === id);
    if (idx !== -1) doctors.splice(idx, 1);
  },
  setDoctorCredentials: async (id: string, creds: any) => {
    console.log(`Setting credentials for doctor ${id}:`, creds);
  },

  getPatients: async () => [...patients],
  approvePatient: async (id: string, amount: number) => {
    const p = patients.find(pat => pat.id === id);
    if (p) {
      p.patientStatus = 'active';
      p.plan = PatientPlan.PAID;
      revenueLedger.aggregateTotal += amount;
      revenueLedger.bySource.patients += amount;
    }
  },
  rejectPatient: async (id: string) => {
    const p = patients.find(pat => pat.id === id);
    if (p) p.patientStatus = 'rejected';
  },
  deletePatient: async (id: string) => {
    const idx = patients.findIndex(p => p.id === id);
    if (idx !== -1) patients.splice(idx, 1);
  },

  getUpgradeRequests: async () => [...upgradeRequests],
  requestUpgrade: async (pharmacyId: string, plan: PharmacyPlan) => {
    const ph = pharmacies.find(p => p.id === pharmacyId);
    if (!ph) return;
    upgradeRequests.push({
      id: `req-${Date.now()}`,
      pharmacyId,
      pharmacyName: ph.name,
      requestedPlan: plan,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  },
  approveUpgrade: async (id: string) => {
    const req = upgradeRequests.find(r => r.id === id);
    if (req) {
      req.status = 'approved';
      const ph = pharmacies.find(p => p.id === req.pharmacyId);
      if (ph) ph.plan = req.requestedPlan;
      const amount = req.requestedPlan === PharmacyPlan.PLATINUM ? 149 : 99;
      revenueLedger.aggregateTotal += amount;
    }
  },
  rejectUpgrade: async (id: string) => {
    const req = upgradeRequests.find(r => r.id === id);
    if (req) req.status = 'rejected';
  },
  
  getPlans: async () => [...mockPlans],
  updatePlan: async (id: string, data: any) => {
    const idx = mockPlans.findIndex(p => p.id === id);
    if (idx !== -1) mockPlans[idx] = { ...mockPlans[idx], ...data };
  },

  getSystemSafety: async () => ({ ...systemSafety }),
  updateSafety: async (data: Partial<SystemSafety>) => {
    systemSafety = { ...systemSafety, ...data };
    return systemSafety;
  },

  getAuditLogs: async () => [...auditLogs],
  getAnnouncements: async () => [...announcements],
  getHolidayThemes: async () => [],
  getSystemVersions: async () => [],
  getBonusGrants: async () => [],
  getFeedback: async () => [],
  getGlobalSales: async () => [],
  getGlobalInventory: async () => [],
  getProductIntelligence: async () => ({
    avgTimeToFirstInventory: 1.2,
    avgTimeToFirstSale: 3.5,
    featureAdoption: [
      { feature: 'AI Restock', adoptionRate: 85 }, 
      { feature: 'Digital Rx', adoptionRate: 65 },
      { feature: 'B2B Marketplace', adoptionRate: 42 },
      { feature: 'Patient Mobile Search', adoptionRate: 91 }
    ],
    paywallHits: 1250,
    upgradePressure: []
  }),
  getSuppliers: async () => [],
  getSecurityLogs: async () => [],
  getIntegrityAlerts: async () => [...integrityAlerts]
};
