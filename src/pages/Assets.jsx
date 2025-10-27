import React, { useState, useEffect } from 'react';
import assetService from '../services/assetService';
import customerService from '../services/customerService';
import productService from '../services/productService';
import AssetModal from '../components/AssetModal';
import userService from '../services/userService';
import './Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  
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
      const [assetsRes, customersRes, productsRes, usersRes] = await Promise.all([
        assetService.getAll(),
        customerService.getAll(),
        productService.getAll(),
        userService.getAll()
      ]);
      
      setAssets(assetsRes.records || []);
      setCustomers(customersRes.records || []);
      setProducts(productsRes.records || []);
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

    if (status === 'due_service') {
      try {
        setLoading(true);
        const response = await assetService.getDueForService();
        setAssets(response.records || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
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
      const response = await assetService.getByCustomer(customerId);
      setAssets(response.records || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleDeleteAsset = async (assetId, assetSerial) => {
    if (window.confirm(`¿Estás seguro de eliminar el equipo "${assetSerial}"?`)) {
      try {
        await assetService.delete(assetId);
        alert('Equipo eliminado exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert(error.message || 'Error al eliminar el equipo');
      }
    }
  };

  const handleSaveAsset = async (assetData) => {
    try {
      if (editingAsset) {
        await assetService.update({ ...assetData, AssetID: editingAsset.AssetID });
        alert('Equipo actualizado exitosamente');
      } else {
        await assetService.create(assetData);
        alert('Equipo creado exitosamente');
      }
      setShowModal(false);
      loadData();
      setStatusFilter('all');
      setCustomerFilter('all');
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    }
  };

  // Filtrar localmente
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.AssetSerial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ProductName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && asset.Status === 'active') ||
      (statusFilter === 'inactive' && asset.Status === 'inactive') ||
      (statusFilter === 'removed' && asset.Status === 'removed');

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando equipos...</p>
      </div>
    );
  }

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1>Equipos Instalados</h1>
          <p>Gestiona los sistemas instalados en tus clientes</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddAsset}>
          ➕ Nuevo Equipo
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Buscar por serial, cliente o producto..."
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
                className={`filter-btn ${statusFilter === 'removed' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('removed')}
              >
                📦 Removidos
              </button>
              <button
                className={`filter-btn ${statusFilter === 'due_service' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('due_service')}
              >
                🔧 Necesitan Servicio
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
          <div className="assets-count">
            Total: <strong>{filteredAssets.length}</strong> equipo(s)
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Serial</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Fecha Instalación</th>
                <th>Instalado Por</th>
                <th>Frecuencia Servicio</th>
                <th>Estado</th>
                <th>Financiamiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                    {searchTerm || statusFilter !== 'all' || customerFilter !== 'all'
                      ? 'No se encontraron equipos con los filtros aplicados'
                      : 'No hay equipos registrados'}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.AssetID}>
                    <td>
                      <span className="asset-id">{asset.AssetID}</span>
                    </td>
                    <td>
                      <div className="asset-serial">
                        <span className="serial-badge">
                          {asset.AssetSerial || '-'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar-small">
                          {asset.CustomerName?.charAt(0)}
                        </div>
                        {asset.CustomerName}
                      </div>
                    </td>
                    <td>
                      <span className="product-name">{asset.ProductName}</span>
                    </td>
                    <td>{formatDate(asset.InstallDate)}</td>
                    <td>
                      <span className="installer-name">
                        {asset.InstallerName || '-'}
                      </span>
                    </td>
                    <td>
                      {asset.ServiceFrequencyMonths 
                        ? `${asset.ServiceFrequencyMonths} meses` 
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusBadgeClass(asset.Status)}`}>
                        {getStatusLabel(asset.Status)}
                      </span>
                    </td>
                    <td>
                      <span className="financing-status">
                        {asset.FinancingStatus || '-'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditAsset(asset)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteAsset(asset.AssetID, asset.AssetSerial)}
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
        <AssetModal
          asset={editingAsset}
          customers={customers}
          products={products}
          users={users}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAsset}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'success',
    'inactive': 'warning',
    'removed': 'secondary'
  };
  return classes[status] || 'secondary';
};

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'removed': 'Removido'
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

export default Assets;