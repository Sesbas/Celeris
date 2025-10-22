import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import CustomerModal from '../components/CustomerModal';
import './Customers.css';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      setCustomers(response.records || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.search(searchTerm);
      setCustomers(response.records || []);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    
    if (status === 'all') {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.getByStatus(status);
      setCustomers(response.records || []);
    } catch (error) {
      console.error('Error al filtrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente "${customerName}"?`)) {
      try {
        await customerService.delete(customerId);
        alert('Cliente eliminado exitosamente');
        loadCustomers();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert(error.message || 'Error al eliminar el cliente');
      }
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await customerService.update({ ...customerData, CustomerID: editingCustomer.CustomerID });
        alert('Cliente actualizado exitosamente');
      } else {
        await customerService.create(customerData);
        alert('Cliente creado exitosamente');
      }
      setShowModal(false);
      loadCustomers();
      setStatusFilter('all');
      setSearchTerm('');
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Clientes</h1>
          <p>Administra tu cartera de clientes</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCustomer}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button className="btn btn-secondary" onClick={handleSearch}>
            Buscar
          </button>
          {searchTerm && (
            <button 
              className="btn-clear" 
              onClick={() => {
                setSearchTerm('');
                loadCustomers();
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="status-filters">
          <span className="filter-label">Estado:</span>
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${statusFilter === 'lead' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('lead')}
          >
            🎯 Leads
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('active')}
          >
            ✅ Activos
          </button>
          <button
            className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('inactive')}
          >
            ⏸️ Inactivos
          </button>
          <button
            className={`filter-btn ${statusFilter === 'archived' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('archived')}
          >
            📦 Archivados
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="customers-count">
            Total: <strong>{customers.length}</strong> cliente(s)
            {statusFilter !== 'all' && ` - Estado: ${getStatusLabel(statusFilter)}`}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Creado Por</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No se encontraron clientes con los filtros aplicados' 
                      : 'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.CustomerID}>
                    <td>
                      <span className="customer-id">{customer.CustomerID}</span>
                    </td>
                    <td>
                      <div className="customer-name">
                        <div className="customer-avatar">
                          {customer.Name?.charAt(0)}
                        </div>
                        <div>
                          <div className="name-text">{customer.Name}</div>
                          {customer.Notes && (
                            <div className="customer-notes" title={customer.Notes}>
                              {customer.Notes.substring(0, 30)}
                              {customer.Notes.length > 30 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{customer.Email || '-'}</td>
                    <td>{customer.Phone || '-'}</td>
                    <td>
                      {customer.CityName 
                        ? `${customer.CityName}, ${customer.StateCode || ''}` 
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusBadgeClass(customer.Status)}`}>
                        {getStatusLabel(customer.Status)}
                      </span>
                    </td>
                    <td>
                      <span className="created-by">
                        {customer.CreatedByName || '-'}
                      </span>
                    </td>
                    <td>{formatDate(customer.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditCustomer(customer)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteCustomer(customer.CustomerID, customer.Name)}
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
        <CustomerModal
          customer={editingCustomer}
          currentUser={user}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCustomer}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getStatusBadgeClass = (status) => {
  const classes = {
    'lead': 'warning',
    'active': 'success',
    'inactive': 'secondary',
    'archived': 'info'
  };
  return classes[status] || 'secondary';
};

const getStatusLabel = (status) => {
  const labels = {
    'lead': 'Lead',
    'active': 'Activo',
    'inactive': 'Inactivo',
    'archived': 'Archivado',
    'all': 'Todos'
  };
  return labels[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default Customers;