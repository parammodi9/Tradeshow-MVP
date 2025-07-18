import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import GuestDashboard from './pages/GuestDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QRScanner from './pages/QRScanner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/qr-scanner" element={<QRScanner />} />
              <Route 
                path="/member" 
                element={
                  <ProtectedRoute allowedRoles={['Member']}>
                    <MemberDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/guest" 
                element={
                  <ProtectedRoute allowedRoles={['Guest']}>
                    <GuestDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vendor" 
                element={
                  <ProtectedRoute allowedRoles={['Vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;