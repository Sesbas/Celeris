import React, { useState, useEffect } from 'react';
import './styles.css';

const AssetModal = ({ asset, customers, products, users, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    CustomerID: '',
    ProductID: '',
    AssetSerial: '',
    InstallDate: '',
    InstalledBy: '',
    ServiceFrequencyMonths: '',
    Status: 'active',
    FinancingStatus: '',
    Notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        CustomerID: asset.CustomerID || '',
        ProductID: asset.ProductID || '',
        AssetSerial: asset.AssetSerial || '',
        InstallDate: asset.InstallDate || '',
        InstalledBy: asset.InstalledBy || '',
        ServiceFrequencyMonths: asset.ServiceFrequencyMonths || '',
        Status: asset.Status || 'active',
        FinancingStatus: asset.FinancingStatus || '',
        Notes: asset.Notes || ''
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.CustomerID) {
      newErrors.CustomerID = 'El cliente es requerido';
    }

    if (!formData.ProductID) {
      newErrors.ProductID = 'El producto es requerido';
    }

    if (formData.ServiceFrequencyMonths && formData.ServiceFrequencyMonths < 0) {
      newErrors.ServiceFrequencyMonths = 'Debe ser un número positivo';
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
      // Convertir valores vacíos a null
      const dataToSend = {
        ...formData,
        AssetSerial: formData.AssetSerial.trim() || null,
        InstallDate: formData.InstallDate || null,
        InstalledBy: formData.InstalledBy || null,
        ServiceFrequencyMonths: formData.ServiceFrequencyMonths || null,
        FinancingStatus: formData.FinancingStatus.trim() || null,
        Notes: formData.Notes.trim() || null
      };

      await onSave(dataToSend);
    } catch (error) {
      alert(error.message || 'Error al guardar el equipo');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solo productos de tipo system
  const systemProducts = products.filter(p => p.Category === 'system' && p.IsActive == 1);

  // Filtrar solo técnicos e instaladores
  const technicians = users.filter(u => u.RoleID === 2 || u.RoleID === 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{asset ? '✏️ Editar Equipo' : '➕ Nuevo Equipo'}</h2>
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
                  Sistema/Producto <span className="required">*</span>
                </label>
                <select
                  name="ProductID"
                  className={`form-control ${errors.ProductID ? 'error' : ''}`}
                  value={formData.ProductID}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar producto...</option>
                  {systemProducts.map(product => (
                    <option key={product.ProductID} value={product.ProductID}>
                      {product.Name} {product.SKU && `(${product.SKU})`}
                    </option>
                  ))}
                </select>
                {errors.ProductID && <span className="error-message">{errors.ProductID}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Número de Serie
                <span className="help-text">Serial único del equipo instalado</span>
              </label>
              <input
                type="text"
                name="AssetSerial"
                className="form-control"
                value={formData.AssetSerial}
                onChange={handleChange}
                placeholder="AWA-2025-001"
              />
            </div>
          </div>

          {/* Información de Instalación */}
          <div className="form-section">
            <h3 className="section-title">🔧 Instalación</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de Instalación</label>
                <input
                  type="date"
                  name="InstallDate"
                  className="form-control"
                  value={formData.InstallDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instalado Por</label>
                <select
                  name="InstalledBy"
                  className="form-control"
                  value={formData.InstalledBy}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar técnico...</option>
                  {technicians.map(user => (
                    <option key={user.UserID} value={user.UserID}>
                      {user.FullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Frecuencia de Servicio (meses)
                  <span className="help-text">¿Cada cuánto necesita servicio?</span>
                </label>
                <input
                  type="number"
                  name="ServiceFrequencyMonths"
                  className={`form-control ${errors.ServiceFrequencyMonths ? 'error' : ''}`}
                  value={formData.ServiceFrequencyMonths}
                  onChange={handleChange}
                  placeholder="6"
                  min="0"
                />
                {errors.ServiceFrequencyMonths && <span className="error-message">{errors.ServiceFrequencyMonths}</span>}
              </div>
            </div>
          </div>

          {/* Estado y Financiamiento */}
          <div className="form-section">
            <h3 className="section-title">💼 Estado y Financiamiento</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estado del Equipo</label>
                <select
                  name="Status"
                  className="form-control"
                  value={formData.Status}
                  onChange={handleChange}
                >
                  <option value="active">✅ Activo</option>
                  <option value="inactive">⏸️ Inactivo</option>
                  <option value="removed">📦 Removido</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estado de Financiamiento
                  <span className="help-text">Ej: Pagado completo, Cuotas, Alquiler</span>
                </label>
                <input
                  type="text"
                  name="FinancingStatus"
                  className="form-control"
                  value={formData.FinancingStatus}
                  onChange={handleChange}
                  placeholder="Pagado completo"
                />
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
                placeholder="Información adicional sobre la instalación, ubicación específica, etc..."
                rows="4"
              ></textarea>
            </div>
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
              {loading ? 'Guardando...' : asset ? 'Actualizar Equipo' : 'Registrar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;