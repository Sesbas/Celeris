import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <button 
            className="user-menu-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar-small">
              {user?.FullName?.charAt(0) || 'U'}
            </div>
            <span className="user-name-nav">{user?.FullName}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <>
              <div 
                className="dropdown-overlay" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <strong>{user?.FullName}</strong>
                    <small>{user?.Email}</small>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <span>🚪</span> Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;