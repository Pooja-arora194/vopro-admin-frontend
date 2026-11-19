import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import SmallLetters from './components/SmallLetters';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminCompanyDetailsPage from './pages/AdminCompanyDetailsPage';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import AdminNotesPage from './pages/AdminNotesPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';

const AdminProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#0F071D' }}>
        Loading VoPro Administration session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/companies/:id" element={<AdminCompanyDetailsPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="/admin/documents" element={<AdminDocumentsPage />} />
          <Route path="/admin/notes" element={<AdminNotesPage />} />
          <Route path="/small-letters" element={<SmallLetters />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<AdminProtectedLayout />} />
    </Routes>
  );
};

export default App;
