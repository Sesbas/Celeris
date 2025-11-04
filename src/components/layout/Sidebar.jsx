import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: [1, 2, 3] },
    { path: '/users', label: 'Usuarios', icon: '👤', roles: [1] }, // Solo Admin
    { path: '/customers', label: 'Clientes', icon: '👥', roles: [1, 2] },
    { path: '/assets', label: 'Equipos', icon: '💧', roles: [1, 2, 3] },
    { path: '/service-orders', label: 'Órdenes de Servicio', icon: '🔧', roles: [1, 2, 3] },
    { path: '/products', label: 'Productos', icon: '📦', roles: [1, 2, 3] },
    { path: '/roles', label: 'Roles', icon: '🔐', roles: [1] }, // Solo Admin
  ];

  // Filtrar items según el rol del usuario
  const filteredItems = menuItems.filter(item =>
    item.roles.includes(user?.RoleID)
  );

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/AWA.jpg" alt="AWA Logo" className="sidebar-logo" />
          <button className="close-btn" onClick={toggleSidebar}>✕</button>
        </div>


        <nav className="sidebar-nav">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => window.innerWidth <= 768 && toggleSidebar()}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.FullName?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.FullName}</div>
              <div className="user-email">{user?.Email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;