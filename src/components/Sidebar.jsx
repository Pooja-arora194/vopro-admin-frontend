import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  StickyNote,
  LogOut,
  Receipt,
  FileText
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard',         path: '/admin',           icon: LayoutDashboard },
    { name: 'Customer Accounts', path: '/admin/companies', icon: Building2 },
    { name: 'Invoices',          path: '/admin/invoices',  icon: Receipt },
    { name: 'Documents',         path: '/admin/documents', icon: FileText },
    { name: 'Internal Notes',    path: '/admin/notes',     icon: StickyNote },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`vopro-sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        <div className="sidebar-brand-box">
          <img
            src="/vopro-logo.webp"
            alt="VoPro Solutions"
            className="sidebar-brand-logo"
          />
        </div>

        <div className="sidebar-nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <div className="sidebar-icon-box">
                  <Icon size={17} />
                </div>
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-logout-btn">
            <div className="sidebar-icon-box logout-icon-box">
              <LogOut size={16} />
            </div>
            <span className="sidebar-logout-text">Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
