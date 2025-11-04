import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ServiceOrderModal from '../components/ServiceOrderModal';
import './CustomerDetail.css';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [customer, setCustomer] = useState(null);
  const [assets, setAssets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal de orden de servicio
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      const [customerRes, assetsRes, ordersRes, usersRes] = await Promise.all([
        api.get(`/customers.php?id=${customerId}`),
        api.get(`/assets.php?customer=${customerId}`),
        api.get(`/service_orders.php?customer=${customerId}`),
        api.get('/users.php')
      ]);

      setCustomer(customerRes.data);
      setAssets(assetsRes.data.records || []);
      setOrders(ordersRes.data.records || []);
      setUsers(usersRes.data.records || []);
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
      alert('Error al cargar la información del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = (asset) => {
    const preloadedOrder = {
      CustomerID: customerId,
      AssetID: asset.AssetID,
      ServiceType: 'maintenance',
      Status: 'requested',
      Notes: `Mantenimiento programado para ${asset.ProductName}\nSerie: ${asset.AssetSerial}`
    };
    
    setSelectedAsset(preloadedOrder);
    setShowServiceModal(true);
  };

  const handleSaveServiceOrder = async (orderData) => {
    try {
      await api.post('/service_orders.php', orderData);
      alert('Orden de servicio creada exitosamente');
      setShowServiceModal(false);
      setSelectedAsset(null);
      loadCustomerData();
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la orden');
    }
  };

  const calculateAssetStatus = (asset) => {
    if (!asset.ServiceFrequencyMonths || !asset.InstallDate) return null;

    const lastService = asset.LastServiceDate 
      ? new Date(asset.LastServiceDate)
      : new Date(asset.InstallDate);
    
    const today = new Date();
    const daysSinceService = Math.floor((today - lastService) / (1000 * 60 * 60 * 24));
    const maintenanceInterval = asset.ServiceFrequencyMonths * 30;
    const daysUntilMaintenance = maintenanceInterval - daysSinceService;

    let status = 'ok';
    if (daysUntilMaintenance < 0) status = 'overdue';
    else if (daysUntilMaintenance <= 15) status = 'urgent';
    else if (daysUntilMaintenance <= 30) status = 'upcoming';

    return { status, daysUntilMaintenance };
  };

  const getStats = () => {
    const totalSpent = orders
      .filter(o => o.Status === 'completed' && o.PaymentStatus === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.Amount || 0), 0);

    const pendingPayments = orders
      .filter(o => o.PaymentStatus === 'pending')
      .reduce((sum, o) => sum + parseFloat(o.Amount || 0), 0);

    const assetsNeedingMaintenance = assets.filter(asset => {
      const status = calculateAssetStatus(asset);
      return status && ['overdue', 'urgent'].includes(status.status);
    }).length;

    return {
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.Status === 'active').length,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.Status === 'completed').length,
      totalSpent,
      pendingPayments,
      assetsNeedingMaintenance
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del cliente...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="error-container">
        <h2>Cliente no encontrado</h2>
        <button className="btn btn-primary" onClick={() => navigate('/customers')}>
          Volver a Clientes
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="customer-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/customers')}>
          ← Volver a Clientes
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="customer-info-card">
        <div className="customer-main-info">
          <div className="customer-avatar-large">
            {customer.Name?.charAt(0)}
          </div>
          <div className="customer-details">
            <h1>{customer.Name}</h1>
            <div className="customer-meta">
              <span className="customer-id-badge">{customer.CustomerID}</span>
              <span className={`status-badge status-${customer.Status}`}>
                {getStatusLabel(customer.Status)}
              </span>
              {customer.Notes && (
                <span className="customer-tag">📝 {customer.Notes.substring(0, 40)}</span>
              )}
            </div>
            <div className="contact-info">
              {customer.Phone && (
                <a href={`tel:${customer.Phone}`} className="contact-link">
                  📞 {customer.Phone}
                </a>
              )}
              {customer.Email && (
                <a href={`mailto:${customer.Email}`} className="contact-link">
                  📧 {customer.Email}
                </a>
              )}
              {customer.CityName && (
                <span className="contact-info-item">
                  📍 {customer.Street}, {customer.CityName}, {customer.StateCode}
                </span>
              )}
            </div>
          </div>
        </div>

        
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <h3>{stats.activeAssets}/{stats.totalAssets}</h3>
            <p>Equipos Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.completedOrders}/{stats.totalOrders}</h3>
            <p>Servicios Completados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalSpent.toLocaleString()}</h3>
            <p>Total Gastado</p>
          </div>
        </div>
        <div className={`stat-card ${stats.assetsNeedingMaintenance > 0 ? 'alert' : ''}`}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.assetsNeedingMaintenance}</h3>
            <p>Mantenimientos Pendientes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button
            className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            💧 Equipos ({assets.length})
          </button>
          <button
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🔧 Servicios ({orders.length})
          </button>
          <button
            className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📅 Timeline
          </button>
        </div>

        <div className="tab-content">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Equipos Destacados */}
                <div className="overview-section">
                  <h3>💧 Equipos Instalados</h3>
                  {assets.length === 0 ? (
                    <div className="empty-state">
                      <p>No hay equipos instalados</p>
                      <button className="btn btn-primary" onClick={() => navigate('/assets')}>
                        + Agregar Equipo
                      </button>
                    </div>
                  ) : (
                    <div className="assets-list">
                      {assets.slice(0, 3).map(asset => {
                        const maintenanceStatus = calculateAssetStatus(asset);
                        return (
                          <div key={asset.AssetID} className="asset-item">
                            <div className="asset-info">
                              <h4>{asset.ProductName}</h4>
                              <p className="asset-serial">Serie: {asset.AssetSerial}</p>
                              <p className="asset-date">
                                Instalado: {new Date(asset.InstallDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            {maintenanceStatus && (
                              <div className={`maintenance-badge ${maintenanceStatus.status}`}>
                                {maintenanceStatus.status === 'overdue' && '🔴 Vencido'}
                                {maintenanceStatus.status === 'urgent' && '🟠 Urgente'}
                                {maintenanceStatus.status === 'upcoming' && '🟡 Próximo'}
                                {maintenanceStatus.status === 'ok' && '✅ Al día'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {assets.length > 3 && (
                        <button 
                          className="btn-link" 
                          onClick={() => setActiveTab('assets')}
                        >
                          Ver todos los equipos →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Servicios Recientes */}
                <div className="overview-section">
                  <h3>🔧 Servicios Recientes</h3>
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <p>No hay servicios registrados</p>
                    </div>
                  ) : (
                    <div className="services-list">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.ServiceID} className="service-item">
                          <div className="service-date">
                            {new Date(order.RequestedAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="service-info">
                            <p className="service-type">{getServiceTypeLabel(order.ServiceType)}</p>
                            <p className="service-status">
                              <span className={`status-dot ${order.Status}`}></span>
                              {getOrderStatusLabel(order.Status)}
                            </p>
                          </div>
                          {order.Amount && (
                            <div className="service-amount">${parseFloat(order.Amount).toFixed(2)}</div>
                          )}
                        </div>
                      ))}
                      {orders.length > 5 && (
                        <button 
                          className="btn-link" 
                          onClick={() => setActiveTab('services')}
                        >
                          Ver todo el historial →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              {stats.totalSpent > 0 && (
                <div className="financial-summary">
                  <h3>💰 Resumen Financiero</h3>
                  <div className="financial-grid">
                    <div className="financial-item">
                      <span className="financial-label">Total Facturado</span>
                      <span className="financial-value">${stats.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="financial-item">
                      <span className="financial-label">Pagos Pendientes</span>
                      <span className="financial-value pending">${stats.pendingPayments.toLocaleString()}</span>
                    </div>
                    <div className="financial-item">
                      <span className="financial-label">Promedio por Servicio</span>
                      <span className="financial-value">
                        ${stats.completedOrders > 0 ? (stats.totalSpent / stats.completedOrders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Assets */}
          {activeTab === 'assets' && (
            <div className="assets-tab">
              <div className="tab-header">
                <h3>💧 Equipos Instalados</h3>
                <button className="btn btn-primary" onClick={() => navigate('/assets')}>
                  + Nuevo Equipo
                </button>
              </div>
              
              {assets.length === 0 ? (
                <div className="empty-state-large">
                  <span className="empty-icon">💧</span>
                  <h4>No hay equipos instalados</h4>
                  <p>Agrega el primer equipo para este cliente</p>
                  <button className="btn btn-primary" onClick={() => navigate('/assets')}>
                    + Agregar Equipo
                  </button>
                </div>
              ) : (
                <div className="assets-grid">
                  {assets.map(asset => {
                    const maintenanceStatus = calculateAssetStatus(asset);
                    return (
                      <div key={asset.AssetID} className="asset-card">
                        <div className="asset-card-header">
                          <h4>{asset.ProductName}</h4>
                          <span className={`asset-status ${asset.Status}`}>
                            {asset.Status === 'active' ? '✅ Activo' : '⏸️ Inactivo'}
                          </span>
                        </div>
                        
                        <div className="asset-card-body">
                          <div className="asset-detail-row">
                            <span className="label">Serie:</span>
                            <span className="value">{asset.AssetSerial}</span>
                          </div>
                          <div className="asset-detail-row">
                            <span className="label">Instalación:</span>
                            <span className="value">
                              {new Date(asset.InstallDate).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          {asset.ServiceFrequencyMonths && (
                            <div className="asset-detail-row">
                              <span className="label">Frecuencia:</span>
                              <span className="value">Cada {asset.ServiceFrequencyMonths} meses</span>
                            </div>
                          )}
                          {asset.LastServiceDate && (
                            <div className="asset-detail-row">
                              <span className="label">Último servicio:</span>
                              <span className="value">
                                {new Date(asset.LastServiceDate).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          )}
                        </div>

                        {maintenanceStatus && maintenanceStatus.status !== 'ok' && (
                          <div className={`asset-alert ${maintenanceStatus.status}`}>
                            {maintenanceStatus.status === 'overdue' && (
                              <>
                                <span>🔴 Mantenimiento vencido hace {Math.abs(maintenanceStatus.daysUntilMaintenance)} días</span>
                                <button 
                                  className="btn-alert-action"
                                  onClick={() => handleScheduleMaintenance(asset)}
                                >
                                  Agendar Ahora
                                </button>
                              </>
                            )}
                            {maintenanceStatus.status === 'urgent' && (
                              <>
                                <span>🟠 Mantenimiento en {maintenanceStatus.daysUntilMaintenance} días</span>
                                <button 
                                  className="btn-alert-action"
                                  onClick={() => handleScheduleMaintenance(asset)}
                                >
                                  Programar
                                </button>
                              </>
                            )}
                            {maintenanceStatus.status === 'upcoming' && (
                              <span>🟡 Próximo mantenimiento en {maintenanceStatus.daysUntilMaintenance} días</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Services */}
          {activeTab === 'services' && (
            <div className="services-tab">
              <div className="tab-header">
                <h3>🔧 Historial de Servicios</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedAsset({ CustomerID: customerId, ServiceType: 'maintenance', Status: 'requested' });
                    setShowServiceModal(true);
                  }}
                >
                  + Nueva Orden
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state-large">
                  <span className="empty-icon">🔧</span>
                  <h4>No hay servicios registrados</h4>
                  <p>Crea la primera orden de servicio</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedAsset({ CustomerID: customerId });
                      setShowServiceModal(true);
                    }}
                  >
                    + Nueva Orden
                  </button>
                </div>
              ) : (
                <div className="services-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Equipo</th>
                        <th>Técnico</th>
                        <th>Estado</th>
                        <th>Monto</th>
                        <th>Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.ServiceID}>
                          <td>
                            {new Date(order.RequestedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <span className="service-type-badge">
                              {getServiceTypeLabel(order.ServiceType)}
                            </span>
                          </td>
                          <td>{order.AssetSerial || '-'}</td>
                          <td>{order.TechnicianName || 'Sin asignar'}</td>
                          <td>
                            <span className={`status-badge status-${order.Status}`}>
                              {getOrderStatusLabel(order.Status)}
                            </span>
                          </td>
                          <td>
                            {order.Amount ? `$${parseFloat(order.Amount).toFixed(2)}` : '-'}
                          </td>
                          <td>
                            <span className={`payment-badge payment-${order.PaymentStatus}`}>
                              {order.PaymentStatus === 'paid' && '✅ Pagado'}
                              {order.PaymentStatus === 'pending' && '⏳ Pendiente'}
                              {order.PaymentStatus === 'canceled' && '❌ Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Timeline */}
          {activeTab === 'timeline' && (
            <div className="timeline-tab">
              <h3>📅 Línea de Tiempo</h3>
              
              {orders.length === 0 && assets.length === 0 ? (
                <div className="empty-state-large">
                  <span className="empty-icon">📅</span>
                  <h4>No hay actividad registrada</h4>
                  <p>La actividad aparecerá aquí cuando se registren equipos y servicios</p>
                </div>
              ) : (
                <div className="timeline">
                  {[...assets.map(a => ({
                    type: 'asset',
                    date: a.InstallDate,
                    data: a
                  })), ...orders.map(o => ({
                    type: 'order',
                    date: o.RequestedAt,
                    data: o
                  }))]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((item, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker">
                          {item.type === 'asset' ? '💧' : '🔧'}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-date">
                            {new Date(item.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          {item.type === 'asset' ? (
                            <div className="timeline-event">
                              <h4>Equipo Instalado</h4>
                              <p>{item.data.ProductName} (Serie: {item.data.AssetSerial})</p>
                            </div>
                          ) : (
                            <div className="timeline-event">
                              <h4>{getServiceTypeLabel(item.data.ServiceType)}</h4>
                              <p>
                                Estado: {getOrderStatusLabel(item.data.Status)}
                                {item.data.TechnicianName && ` • Técnico: ${item.data.TechnicianName}`}
                                {item.data.Amount && ` • $${parseFloat(item.data.Amount).toFixed(2)}`}
                              </p>
                              {item.data.Notes && (
                                <p className="timeline-notes">{item.data.Notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Orden de Servicio */}
      {showServiceModal && (
        <ServiceOrderModal
          order={selectedAsset}
          customers={[customer]}
          assets={assets}
          users={users}
          onClose={() => {
            setShowServiceModal(false);
            setSelectedAsset(null);
          }}
          onSave={handleSaveServiceOrder}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getStatusLabel = (status) => {
  const labels = {
    'lead': '🎯 Lead',
    'active': '✅ Activo',
    'inactive': '⏸️ Inactivo',
    'archived': '📦 Archivado'
  };
  return labels[status] || status;
};

const getServiceTypeLabel = (type) => {
  const labels = {
    'installation': 'Instalación',
    'maintenance': 'Mantenimiento',
    'repair': 'Reparación',
    'filter_change': 'Cambio Filtros',
    'warranty': 'Garantía',
    'inspection': 'Inspección',
    'removal': 'Remoción',
    'other': 'Otro'
  };
  return labels[type] || type;
};

const getOrderStatusLabel = (status) => {
  const labels = {
    'requested': 'Solicitado',
    'scheduled': 'Programado',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'canceled': 'Cancelado'
  };
  return labels[status] || status;
};

export default CustomerDetail;