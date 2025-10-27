import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import serviceOrderService from '../services/serviceOrderService';
import customerService from '../services/customerService';
import assetService from '../services/assetService';
import userService from '../services/userService';
import ServiceOrderModal from '../components/ServiceOrderModal';
import './ServiceOrders.css';

const ServiceOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, assetsRes, usersRes] = await Promise.all([
        serviceOrderService.getAll(),
        customerService.getAll(),
        assetService.getAll(),
        userService.getAll()
      ]);
      
      setOrders(ordersRes.records || []);
      setCustomers(customersRes.records || []);
      setAssets(assetsRes.records || []);
      setUsers(usersRes.records || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    
    if (status === 'all') {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await serviceOrderService.getByStatus(status);
      setOrders(response.records || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerFilter = async (customerId) => {
    setCustomerFilter(customerId);
    
    if (customerId === 'all') {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await serviceOrderService.getByCustomer(customerId);
      setOrders(response.records || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowModal(true);
  };

  const handleCompleteOrder = async (orderId) => {
    if (window.confirm('¿Marcar esta orden como completada?')) {
      try {
        await serviceOrderService.complete(orderId);
        alert('Orden completada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al completar la orden');
      }
    }
  };

  const handleDeleteOrder = async (orderId, customerName) => {
    if (window.confirm(`¿Estás seguro de eliminar la orden de servicio para "${customerName}"?`)) {
      try {
        await serviceOrderService.delete(orderId);
        alert('Orden eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al eliminar la orden');
      }
    }
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        await serviceOrderService.update({ ...orderData, ServiceID: editingOrder.ServiceID });
        alert('Orden actualizada exitosamente');
      } else {
        await serviceOrderService.create(orderData);
        alert('Orden creada exitosamente');
      }
      setShowModal(false);
      loadData();
      setStatusFilter('all');
      setCustomerFilter('all');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Filtrar localmente
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.TechnicianName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando órdenes de servicio...</p>
      </div>
    );
  }

  return (
    <div className="service-orders-page">
      <div className="page-header">
        <div>
          <h1>Órdenes de Servicio</h1>
          <p>Gestiona mantenimientos, reparaciones e instalaciones</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddOrder}>
          ➕ Nueva Orden
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Buscar por cliente o técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="btn-clear" 
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-groups">
          <div className="filter-group">
            <span className="filter-label">Estado:</span>
            <div className="status-filters">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${statusFilter === 'requested' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('requested')}
              >
                📋 Solicitado
              </button>
              <button
                className={`filter-btn ${statusFilter === 'scheduled' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('scheduled')}
              >
                📅 Programado
              </button>
              <button
                className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('in_progress')}
              >
                🔧 En Progreso
              </button>
              <button
                className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('completed')}
              >
                ✅ Completado
              </button>
              <button
                className={`filter-btn ${statusFilter === 'canceled' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('canceled')}
              >
                ❌ Cancelado
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Cliente:</span>
            <select
              className="form-control customer-select"
              value={customerFilter}
              onChange={(e) => handleCustomerFilter(e.target.value)}
            >
              <option value="all">Todos los clientes</option>
              {customers.map(customer => (
                <option key={customer.CustomerID} value={customer.CustomerID}>
                  {customer.Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="orders-count">
            Total: <strong>{filteredOrders.length}</strong> orden(es)
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Tipo Servicio</th>
                <th>Técnico</th>
                <th>Solicitado</th>
                <th>Programado</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>
                    {searchTerm || statusFilter !== 'all' || customerFilter !== 'all'
                      ? 'No se encontraron órdenes con los filtros aplicados'
                      : 'No hay órdenes de servicio registradas'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.ServiceID}>
                    <td>
                      <span className="order-id">{order.ServiceID}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar-small">
                          {order.CustomerName?.charAt(0)}
                        </div>
                        {order.CustomerName}
                      </div>
                    </td>
                    <td>
                      <span className="asset-info">
                        {order.AssetSerial || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${getServiceTypeBadgeClass(order.ServiceType)}`}>
                        {getServiceTypeLabel(order.ServiceType)}
                      </span>
                    </td>
                    <td>
                      <span className="technician-name">
                        {order.TechnicianName || 'Sin asignar'}
                      </span>
                    </td>
                    <td>{formatDateTime(order.RequestedAt)}</td>
                    <td>{formatDateTime(order.ScheduledAt)}</td>
                    <td>
                      <span className={`badge badge-${getStatusBadgeClass(order.Status)}`}>
                        {getStatusLabel(order.Status)}
                      </span>
                    </td>
                    <td>
                      {order.Amount ? `$${parseFloat(order.Amount).toLocaleString()}` : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${getPaymentBadgeClass(order.PaymentStatus)}`}>
                        {getPaymentLabel(order.PaymentStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {order.Status !== 'completed' && order.Status !== 'canceled' && (
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleCompleteOrder(order.ServiceID)}
                            title="Completar"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditOrder(order)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteOrder(order.ServiceID, order.CustomerName)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ServiceOrderModal
          order={editingOrder}
          customers={customers}
          assets={assets}
          users={users}
          onClose={() => setShowModal(false)}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getStatusBadgeClass = (status) => {
  const classes = {
    'requested': 'warning',
    'scheduled': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'canceled': 'danger'
  };
  return classes[status] || 'secondary';
};

const getStatusLabel = (status) => {
  const labels = {
    'requested': 'Solicitado',
    'scheduled': 'Programado',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'canceled': 'Cancelado'
  };
  return labels[status] || status;
};

const getServiceTypeBadgeClass = (type) => {
  const classes = {
    'installation': 'info',
    'maintenance': 'warning',
    'repair': 'danger',
    'filter_change': 'warning',
    'warranty': 'success',
    'inspection': 'info',
    'removal': 'secondary',
    'other': 'secondary'
  };
  return classes[type] || 'secondary';
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

const getPaymentBadgeClass = (status) => {
  const classes = {
    'pending': 'warning',
    'paid': 'success',
    'canceled': 'secondary'
  };
  return classes[status] || 'secondary';
};

const getPaymentLabel = (status) => {
  const labels = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'canceled': 'Cancelado'
  };
  return labels[status] || status;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default ServiceOrders;