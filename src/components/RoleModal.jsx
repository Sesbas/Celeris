import React, { useState, useEffect } from 'react';
import './styles.css';

const RoleModal = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        Name: role.Name || ''
      });
    }
  }, [role]);

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

    if (!formData.Name.trim()) {
      newErrors.Name = 'El nombre del rol es requerido';
    } else if (formData.Name.trim().length < 3) {
      newErrors.Name = 'El nombre debe tener al menos 3 caracteres';
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
      alert(error.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{role ? '✏️ Editar Rol' : '➕ Nuevo Rol'}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              Nombre del Rol <span className="required">*</span>
            </label>
            <input
              type="text"
              name="Name"
              className={`form-control ${errors.Name ? 'error' : ''}`}
              value={formData.Name}
              onChange={handleChange}
              placeholder="Ej: Manager, Technician, Sales"
            />
            {errors.Name && <span className="error-message">{errors.Name}</span>}
          </div>

          <div className="info-box">
            <strong>💡 Ejemplos de Roles:</strong>
            <ul>
              <li><strong>Manager:</strong> Acceso completo al sistema (RoleID = 1)</li>
              <li><strong>Technician:</strong> Técnicos de campo, instalaciones y servicios</li>
              <li><strong>Sales:</strong> Equipo de ventas y atención al cliente</li>
              <li><strong>Support:</strong> Soporte técnico y atención</li>
              <li><strong>Supervisor:</strong> Supervisión de operaciones</li>
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
              {loading ? 'Guardando...' : role ? 'Actualizar Rol' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;