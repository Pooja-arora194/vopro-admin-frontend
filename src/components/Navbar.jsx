import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Search,
  Bell
} from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const getInitials = (name) => {
    if (!name) return 'EV';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="vopro-top-header">
      {/* Left: Mobile Toggle + Search Bar */}
      <div className="header-left-actions">
        <button
          onClick={onToggleSidebar}
          className="mobile-nav-toggle"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="navbar-search-pill">
          <Search size={15} className="search-pill-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search accounts, notes, operations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right: Bell Icon + User Details Card */}
      <div className="header-right-actions">
        <button
          className="header-circle-icon-btn"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* User Details Card on the Right */}
        <div className="navbar-user-card">
          <div className="user-avatar-circle">
            <div className="user-avatar-inner">
              {getInitials(user?.name)}
            </div>
          </div>
          <div className="user-card-meta">
            <div className="user-card-name">{user?.name || 'Eleanor Vance'}</div>
            <div className="user-card-email">{user?.email || 'admin@vopro.co.uk'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
