
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { UserRole } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import SalesTerminal from './pages/SalesTerminal';
import PrescriptionSystem from './pages/PrescriptionSystem';
import PatientSearch from './pages/PatientSearch';
import SuperAdmin from './pages/SuperAdmin';
import Marketplace from './pages/Marketplace';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import StaffManagement from './pages/StaffManagement';
import StockAdjustment from './pages/StockAdjustment';
import MySales from './pages/MySales';
import PlaceRequest from './pages/PlaceRequest';
import Subscription from './pages/Subscription';

// Super Admin Pages
import PharmacyManagement from './pages/superadmin/PharmacyManagement';
import GlobalInventory from './pages/superadmin/GlobalInventory';
import MarketplaceApprovals from './pages/superadmin/MarketplaceApprovals';
import GlobalReports from './pages/superadmin/GlobalReports';
import SystemHealth from './pages/superadmin/SystemHealth';
import PlanControl from './pages/superadmin/PlanControl';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-slate-400 animate-pulse">Establishing Hub Connection...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN, UserRole.PHARMACIST]}>
                <Inventory />
              </ProtectedRoute>
            } />

            <Route path="/stock-adjustment" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACIST, UserRole.PHARMACY_ADMIN]}>
                <StockAdjustment />
              </ProtectedRoute>
            } />

            <Route path="/sales" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN, UserRole.PHARMACIST, UserRole.SALES_PERSON]}>
                <SalesTerminal />
              </ProtectedRoute>
            } />

            <Route path="/my-sales" element={
              <ProtectedRoute allowedRoles={[UserRole.SALES_PERSON, UserRole.PHARMACIST]}>
                <MySales />
              </ProtectedRoute>
            } />

            <Route path="/prescriptions" element={
              <ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.PHARMACY_ADMIN]}>
                <PrescriptionSystem />
              </ProtectedRoute>
            } />

            <Route path="/search" element={
              <ProtectedRoute allowedRoles={[UserRole.PATIENT, UserRole.SUPER_ADMIN]}>
                <PatientSearch />
              </ProtectedRoute>
            } />

            <Route path="/place-request" element={
              <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                <PlaceRequest />
              </ProtectedRoute>
            } />

            <Route path="/marketplace" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN]}>
                <Marketplace />
              </ProtectedRoute>
            } />

            <Route path="/referrals" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN, UserRole.SUPER_ADMIN]}>
                <Referrals />
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN]}>
                <StaffManagement />
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute allowedRoles={[UserRole.PHARMACY_ADMIN]}>
                <Subscription />
              </ProtectedRoute>
            } />

            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <SuperAdmin />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/pharmacies" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <PharmacyManagement />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/inventory" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <GlobalInventory />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/marketplace-approvals" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <MarketplaceApprovals />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/reports" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <GlobalReports />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/health" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <SystemHealth />
              </ProtectedRoute>
            } />

            <Route path="/super-admin/plans" element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <PlanControl />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </HashRouter>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;
