import React, { useState, useEffect } from 'react';
import './CustomerModal.css';

const CustomerModal = ({ customer, currentUser, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    CustomerID: '',
    Name: '',
    Email: '',
    Phone: '',
    Status: 'lead',
    Street: '',
    CityName: '',
    StateCode: '',
    ZipCode: '',
    Notes: '',
    Created_by_UserID: currentUser?.UserID || null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        CustomerID: customer.CustomerID || '',
        Name: customer.Name || '',
        Email: customer.Email || '',
        Phone: customer.Phone || '',
        Status: customer.Status || 'lead',
        Street: customer.Street || '',
        CityName: customer.CityName || '',
        StateCode: customer.StateCode || '',
        ZipCode: customer.ZipCode || '',
        Notes: customer.Notes || '',
        Created_by_UserID: customer.Created_by_UserID || currentUser?.UserID
      });
    }
  }, [customer, currentUser]);

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

    if (!customer && !formData.CustomerID.trim()) {
      newErrors.CustomerID = 'El ID del cliente es requerido';
    }

    if (!formData.Name.trim()) {
      newErrors.Name = 'El nombre es requerido';
    }

    if (formData.Email && !/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Email inválido';
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
      await onSave(formData);
    } catch (error) {
      alert(error.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{customer ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Información Básica */}
          <div className="form-section">
            <h3 className="section-title">Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  ID Cliente <span className="required">*</span>
                  <span className="help-text">Ej: ISA-1001, EMP-2023</span>
                </label>
                <input
                  type="text"
                  name="CustomerID"
                  className={`form-control ${errors.CustomerID ? 'error' : ''}`}
                  value={formData.CustomerID}
                  onChange={handleChange}
                  placeholder="ISA-1001"
                  disabled={!!customer}
                />
                {errors.CustomerID && <span className="error-message">{errors.CustomerID}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="Name"
                  className={`form-control ${errors.Name ? 'error' : ''}`}
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="Nombre del cliente o empresa"
                />
                {errors.Name && <span className="error-message">{errors.Name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="Email"
                  className={`form-control ${errors.Email ? 'error' : ''}`}
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="cliente@ejemplo.com"
                />
                {errors.Email && <span className="error-message">{errors.Email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="Phone"
                  className="form-control"
                  value={formData.Phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="Status"
                  className="form-control"
                  value={formData.Status}
                  onChange={handleChange}
                >
                  <option value="lead">🎯 Lead</option>
                  <option value="active">✅ Activo</option>
                  <option value="inactive">⏸️ Inactivo</option>
                  <option value="archived">📦 Archivado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="form-section">
            <h3 className="section-title">📍 Dirección</h3>
            
            <div className="form-group">
              <label className="form-label">Calle</label>
              <input
                type="text"
                name="Street"
                className="form-control"
                value={formData.Street}
                onChange={handleChange}
                placeholder="Calle 45 #23-10"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input
                  type="text"
                  name="CityName"
                  className="form-control"
                  value={formData.CityName}
                  onChange={handleChange}
                  placeholder="Pereira"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Departamento (Código)</label>
                <input
                  type="text"
                  name="StateCode"
                  className="form-control"
                  value={formData.StateCode}
                  onChange={handleChange}
                  placeholder="RI"
                  maxLength="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código Postal</label>
                <input
                  type="text"
                  name="ZipCode"
                  className="form-control"
                  value={formData.ZipCode}
                  onChange={handleChange}
                  placeholder="660001"
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
                placeholder="Información adicional sobre el cliente..."
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
              {loading ? 'Guardando...' : customer ? 'Actualizar Cliente' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;