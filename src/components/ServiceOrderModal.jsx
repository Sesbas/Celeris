import React, { useState, useEffect } from 'react';
import './CustomerModal.css';

const ServiceOrderModal = ({ order, customers, assets, users, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    CustomerID: '',
    AssetID: '',
    TechnicianID: '',
    ServiceType: 'maintenance',
    Status: 'requested',
    ScheduledAt: '',
    CompletedAt: '',
    Notes: '',
    Amount: '',
    PaymentStatus: 'pending'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [filteredAssets, setFilteredAssets] = useState([]);

  useEffect(() => {
    if (order) {
      setFormData({
        CustomerID: order.CustomerID || '',
        AssetID: order.AssetID || '',
        TechnicianID: order.TechnicianID || '',
        ServiceType: order.ServiceType || 'maintenance',
        Status: order.Status || 'requested',
        ScheduledAt: order.ScheduledAt ? order.ScheduledAt.substring(0, 16) : '',
        CompletedAt: order.CompletedAt ? order.CompletedAt.substring(0, 16) : '',
        Notes: order.Notes || '',
        Amount: order.Amount || '',
        PaymentStatus: order.PaymentStatus || 'pending'
      });
      
      // Filtrar assets del cliente
      if (order.CustomerID) {
        const customerAssets = assets.filter(a => a.CustomerID === order.CustomerID);
        setFilteredAssets(customerAssets);
      }
    }
  }, [order, assets]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si cambia el cliente, filtrar los assets
    if (name === 'CustomerID') {
      const customerAssets = assets.filter(a => a.CustomerID === value);
      setFilteredAssets(customerAssets);
      setFormData(prev => ({ ...prev, AssetID: '' })); // Limpiar asset seleccionado
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CustomerID) {
      newErrors.CustomerID = 'El cliente es requerido';
    }

    if (!formData.ServiceType) {
      newErrors.ServiceType = 'El tipo de servicio es requerido';
    }

    if (formData.Amount && formData.Amount < 0) {
      newErrors.Amount = 'El monto debe ser positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        AssetID: formData.AssetID || null,
        TechnicianID: formData.TechnicianID || null,
        ScheduledAt: formData.ScheduledAt || null,
        CompletedAt: formData.CompletedAt || null,
        Amount: formData.Amount || null,
        Notes: formData.Notes.trim() || null
      };

      await onSave(dataToSend);
    } catch (error) {
      alert(error.message || 'Error al guardar la orden');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solo técnicos
  const technicians = users.filter(u => u.RoleID === 3);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{order ? '✏️ Editar Orden de Servicio' : '➕ Nueva Orden de Servicio'}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Información Principal */}
          <div className="form-section">
            <h3 className="section-title">Información Principal</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Cliente <span className="required">*</span>
                </label>
                <select
                  name="CustomerID"
                  className={`form-control ${errors.CustomerID ? 'error' : ''}`}
                  value={formData.CustomerID}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar cliente...</option>
                  {customers.map(customer => (
                    <option key={customer.CustomerID} value={customer.CustomerID}>
                      {customer.Name}
                    </option>
                  ))}
                </select>
                {errors.CustomerID && <span className="error-message">{errors.CustomerID}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Equipo (Opcional)
                  <span className="help-text">Solo si aplica a un equipo específico</span>
                </label>
                <select
                  name="AssetID"
                  className="form-control"
                  value={formData.AssetID}
                  onChange={handleChange}
                  disabled={!formData.CustomerID}
                >
                  <option value="">Sin equipo específico</option>
                  {filteredAssets.map(asset => (
                    <option key={asset.AssetID} value={asset.AssetID}>
                      {asset.AssetSerial || `Equipo ${asset.AssetID}`} - {asset.ProductName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Tipo de Servicio <span className="required">*</span>
                </label>
                <select
                  name="ServiceType"
                  className={`form-control ${errors.ServiceType ? 'error' : ''}`}
                  value={formData.ServiceType}
                  onChange={handleChange}
                >
                  <option value="installation">🔧 Instalación</option>
                  <option value="maintenance">🛠️ Mantenimiento</option>
                  <option value="repair">⚠️ Reparación</option>
                  <option value="filter_change">🔄 Cambio de Filtros</option>
                  <option value="warranty">✅ Garantía</option>
                  <option value="inspection">🔍 Inspección</option>
                  <option value="removal">📦 Remoción</option>
                  <option value="other">📝 Otro</option>
                </select>
                {errors.ServiceType && <span className="error-message">{errors.ServiceType}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Técnico Asignado</label>
                <select
                  name="TechnicianID"
                  className="form-control"
                  value={formData.TechnicianID}
                  onChange={handleChange}
                >
                  <option value="">Sin asignar</option>
                  {technicians.map(user => (
                    <option key={user.UserID} value={user.UserID}>
                      {user.FullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Programación */}
          <div className="form-section">
            <h3 className="section-title">📅 Programación</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="Status"
                  className="form-control"
                  value={formData.Status}
                  onChange={handleChange}
                >
                  <option value="requested">📋 Solicitado</option>
                  <option value="scheduled">📅 Programado</option>
                  <option value="in_progress">🔧 En Progreso</option>
                  <option value="completed">✅ Completado</option>
                  <option value="canceled">❌ Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha Programada</label>
                <input
                  type="datetime-local"
                  name="ScheduledAt"
                  className="form-control"
                  value={formData.ScheduledAt}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha Completada</label>
                <input
                  type="datetime-local"
                  name="CompletedAt"
                  className="form-control"
                  value={formData.CompletedAt}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Pago */}
          <div className="form-section">
            <h3 className="section-title">💰 Pago</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Monto
                  <span className="help-text">Costo del servicio</span>
                </label>
                <input
                  type="number"
                  name="Amount"
                  className={`form-control ${errors.Amount ? 'error' : ''}`}
                  value={formData.Amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.Amount && <span className="error-message">{errors.Amount}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Estado de Pago</label>
                <select
                  name="PaymentStatus"
                  className="form-control"
                  value={formData.PaymentStatus}
                  onChange={handleChange}
                >
                  <option value="pending">⏳ Pendiente</option>
                  <option value="paid">✅ Pagado</option>
                  <option value="canceled">❌ Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="form-section">
            <h3 className="section-title">📝 Notas</h3>
            <div className="form-group">
              <textarea
                name="Notes"
                className="form-control"
                value={formData.Notes}
                onChange={handleChange}
                placeholder="Detalles del servicio, problemas encontrados, repuestos usados..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="info-box">
            <strong>💡 Información:</strong>
            <ul>
              <li><strong>Equipo:</strong> Se filtra automáticamente por el cliente seleccionado</li>
              <li><strong>Estado:</strong> Cambia el estado según el progreso del servicio</li>
              <li><strong>Programado:</strong> Fecha y hora en que se realizará el servicio</li>
              <li><strong>Completado:</strong> Se llena automáticamente al marcar como completado</li>
            </ul>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : order ? 'Actualizar Orden' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceOrderModal;