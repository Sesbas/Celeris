import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ServiceOrderModal from '../components/ServiceOrderModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAssets: 0,
    pendingOrders: 0,
    completedOrders: 0,
    upcomingMaintenance: 0,
  });
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingScheduled, setUpcomingScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de orden de servicio
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateMaintenanceStatus = (asset) => {
    if (!asset.ServiceFrequencyMonths || asset.ServiceFrequencyMonths <= 0) {
      return null;
    }

    let referenceDate;
    if (asset.LastServiceDate && asset.LastServiceDate !== null) {
      referenceDate = new Date(asset.LastServiceDate);
    } else if (asset.InstallDate) {
      referenceDate = new Date(asset.InstallDate);
    } else {
      return null;
    }

    const today = new Date();
    const daysSinceLastService = Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
    const maintenanceIntervalDays = asset.ServiceFrequencyMonths * 30;
    const daysUntilMaintenance = maintenanceIntervalDays - daysSinceLastService;
    
    let priority = 'ok';
    if (daysUntilMaintenance < 0) {
      priority = 'overdue';
    } else if (daysUntilMaintenance <= 15) {
      priority = 'urgent';
    } else if (daysUntilMaintenance <= 30) {
      priority = 'upcoming';
    }

    return {
      ...asset,
      daysUntilMaintenance: Math.round(daysUntilMaintenance),
      daysSinceLastService,
      priority,
      lastServiceDate: referenceDate.toLocaleDateString('es-ES'),
      nextMaintenanceDate: new Date(referenceDate.getTime() + (maintenanceIntervalDays * 24 * 60 * 60 * 1000)).toLocaleDateString('es-ES'),
    };
  };

  const fetchDashboardData = async () => {
    try {
      const [customersRes, assetsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/customers.php'),
        api.get('/assets.php'),
        api.get('/service_orders.php'),
        api.get('/users.php'),
      ]);

      const customersData = customersRes.data.records || [];
      const assetsData = assetsRes.data.records || [];
      const orders = ordersRes.data.records || [];
      const usersData = usersRes.data.records || [];

      setCustomers(customersData);
      setAssets(assetsData);
      setUsers(usersData);

      const alertsData = assetsData
        .map(calculateMaintenanceStatus)
        .filter(asset => asset && ['overdue', 'urgent', 'upcoming'].includes(asset.priority))
        .sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance);

      setMaintenanceAlerts(alertsData);

      const recent = orders
        .sort((a, b) => {
          const dateA = new Date(b.CompletedAt || b.ScheduledAt || b.RequestedAt);
          const dateB = new Date(a.CompletedAt || a.ScheduledAt || a.RequestedAt);
          return dateA - dateB;
        })
        .slice(0, 5);
      setRecentOrders(recent);

      const scheduled = orders
        .filter(o => o.Status === 'scheduled' && o.ScheduledAt)
        .sort((a, b) => new Date(a.ScheduledAt) - new Date(b.ScheduledAt))
        .slice(0, 5);
      setUpcomingScheduled(scheduled);

      setStats({
        totalCustomers: customersData.filter(c => c.Status === 'active').length,
        totalAssets: assetsData.filter(a => a.Status === 'active').length,
        pendingOrders: orders.filter(o => ['scheduled', 'requested', 'in_progress'].includes(o.Status)).length,
        completedOrders: orders.filter(o => o.Status === 'completed').length,
        upcomingMaintenance: alertsData.length,
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleService = (alert) => {
    // Preparar datos pre-cargados para la orden
    const preloadedOrder = {
      CustomerID: alert.CustomerID,
      AssetID: alert.AssetID,
      ServiceType: 'maintenance',
      Status: 'requested',
      Notes: `Mantenimiento preventivo programado\nEquipo: ${alert.ProductName}\nSerie: ${alert.AssetSerial}\nÚltimo servicio: ${alert.lastServiceDate}\nFrecuencia: cada ${alert.ServiceFrequencyMonths} meses`
    };
    
    setSelectedAlert(preloadedOrder);
    setShowServiceModal(true);
  };

  const handleSaveServiceOrder = async (orderData) => {
    try {
      await api.post('/service_orders.php', orderData);
      alert('Orden de servicio creada exitosamente');
      setShowServiceModal(false);
      setSelectedAlert(null);
      fetchDashboardData(); // Recargar datos
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la orden');
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      overdue: {
        label: 'VENCIDO',
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: '🔴',
      },
      urgent: {
        label: 'URGENTE',
        color: '#ea580c',
        bgColor: '#ffedd5',
        icon: '🟠',
      },
      upcoming: {
        label: 'PRÓXIMO',
        color: '#ca8a04',
        bgColor: '#fef3c7',
        icon: '🟡',
      },
    };
    return configs[priority] || configs.upcoming;
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completada',
      scheduled: 'Programada',
      in_progress: 'En Progreso',
      requested: 'Solicitada',
      canceled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      maintenance: 'Mantenimiento',
      installation: 'Instalación',
      repair: 'Reparación',
      filter_change: 'Cambio de Filtro',
      warranty: 'Garantía',
      inspection: 'Inspección',
      removal: 'Remoción',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.FullName}</h1>
        <p>Resumen de tu sistema CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalCustomers}</h3>
            <p>Clientes Activos</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <h3>{stats.totalAssets}</h3>
            <p>Equipos Instalados</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>

        <div className={`stat-card purple ${stats.upcomingMaintenance > 0 ? 'pulse' : ''}`}>
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.upcomingMaintenance}</h3>
            <p>Mantenimientos Próximos</p>
          </div>
        </div>
      </div>

      {/* Alertas de Mantenimiento */}
      {maintenanceAlerts.length > 0 && (
        <div className="section-card maintenance-alerts">
          <div className="section-header">
            <span className="alert-icon-header">⚠️</span>
            <h2>Alertas de Mantenimiento Preventivo</h2>
          </div>
          
          <div className="alerts-list">
            {maintenanceAlerts.map((alert) => {
              const config = getPriorityConfig(alert.priority);
              return (
                <div 
                  key={alert.AssetID} 
                  className="alert-card"
                  style={{
                    background: config.bgColor,
                    borderLeft: `4px solid ${config.color}`
                  }}
                >
                  <div className="alert-icon" style={{ background: 'white' }}>
                    {config.icon}
                  </div>
                  
                  <div className="alert-content">
                    <div className="alert-header">
                      <span 
                        className="alert-badge"
                        style={{
                          background: config.color,
                          color: 'white'
                        }}
                      >
                        {config.label}
                      </span>
                      <h3>{alert.CustomerName}</h3>
                    </div>
                    
                    <div className="alert-details">
                      <span><strong>Equipo:</strong> {alert.ProductName}</span>
                      <span><strong>Serie:</strong> {alert.AssetSerial}</span>
                      <span><strong>Último servicio:</strong> {alert.lastServiceDate}</span>
                      <span><strong>Frecuencia:</strong> cada {alert.ServiceFrequencyMonths} meses</span>
                      <span style={{ color: config.color, fontWeight: 600 }}>
                        {alert.daysUntilMaintenance < 0 
                          ? `⚠️ Vencido hace ${Math.abs(alert.daysUntilMaintenance)} días`
                          : `⏰ Faltan ${alert.daysUntilMaintenance} días`
                        }
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Próximo mantenimiento: {alert.nextMaintenanceDate}
                      </span>
                    </div>
                  </div>
                  
                  <div className="alert-actions">
                    <button
                      className="btn-action btn-primary"
                      onClick={() => handleScheduleService(alert)}
                      style={{ background: config.color }}
                      title="Agendar servicio de mantenimiento"
                    >
                      📅 Agendar
                    </button>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje si no hay alertas */}
      {maintenanceAlerts.length === 0 && (
        <div className="section-card no-alerts">
          <div className="empty-state-large">
            <span className="empty-icon">✅</span>
            <h3>¡Todo al día!</h3>
            <p>No hay equipos que requieran mantenimiento próximamente</p>
          </div>
        </div>
      )}

      {/* Secciones de actividad */}
      <div className="dashboard-sections">
        <div className="section-card">
          <h2>📋 Actividad Reciente</h2>
          <div className="activity-list">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.ServiceID} className="activity-item">
                <div className="activity-info">
                  <div className="activity-title">{order.CustomerName || 'Cliente no especificado'}</div>
                  <div className="activity-subtitle">
                    {getServiceTypeLabel(order.ServiceType)} • {getStatusLabel(order.Status)}
                  </div>
                </div>
                {order.Amount && (
                  <div className="activity-amount">${parseFloat(order.Amount).toFixed(2)}</div>
                )}
              </div>
            )) : (
              <p className="empty-state">No hay actividad reciente</p>
            )}
          </div>
        </div>

        <div className="section-card">
          <h2>📅 Próximas Citas Programadas</h2>
          <div className="activity-list">
            {upcomingScheduled.length > 0 ? upcomingScheduled.map((order) => (
              <div key={order.ServiceID} className="activity-item scheduled">
                <div className="activity-info">
                  <div className="scheduled-date">
                    📆 {new Date(order.ScheduledAt).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="activity-subtitle">
                    {order.CustomerName || 'Cliente no especificado'} • {getServiceTypeLabel(order.ServiceType)}
                  </div>
                </div>
              </div>
            )) : (
              <p className="empty-state">No hay citas programadas</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Orden de Servicio */}
      {showServiceModal && (
        <ServiceOrderModal
          order={selectedAlert}
          customers={customers}
          assets={assets}
          users={users}
          onClose={() => {
            setShowServiceModal(false);
            setSelectedAlert(null);
          }}
          onSave={handleSaveServiceOrder}
        />
      )}
    </div>
  );
};

export default Dashboard;