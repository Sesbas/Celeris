import React, { useState, useEffect } from 'react';
import './UserModal.css';

const UserModal = ({ user, roles, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Email: '',
    Password: '',
    FullName: '',
    Phone: '',
    RoleID: '',
    IsActive: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        Email: user.Email || '',
        Password: '', // No cargar contraseña en edición
        FullName: user.FullName || '',
        Phone: user.Phone || '',
        RoleID: user.RoleID || '',
        IsActive: user.IsActive || 1
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Email.trim()) {
      newErrors.Email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = 'Email inválido';
    }

    if (!user && !formData.Password) {
      newErrors.Password = 'La contraseña es requerida';
    } else if (formData.Password && formData.Password.length < 6) {
      newErrors.Password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.FullName.trim()) {
      newErrors.FullName = 'El nombre completo es requerido';
    }

    if (!formData.RoleID) {
      newErrors.RoleID = 'Debe seleccionar un rol';
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
      // Si es edición y no hay contraseña, no enviarla
      const dataToSend = { ...formData };
      if (user && !dataToSend.Password) {
        delete dataToSend.Password;
      }

      await onSave(dataToSend);
    } catch (error) {
      alert(error.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="Email"
                className={`form-control ${errors.Email ? 'error' : ''}`}
                value={formData.Email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
              />
              {errors.Email && <span className="error-message">{errors.Email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Contraseña {!user && <span className="required">*</span>}
                {user && <span className="optional">(dejar vacío para mantener actual)</span>}
              </label>
              <input
                type="password"
                name="Password"
                className={`form-control ${errors.Password ? 'error' : ''}`}
                value={formData.Password}
                onChange={handleChange}
                placeholder={user ? "••••••••" : "Contraseña"}
              />
              {errors.Password && <span className="error-message">{errors.Password}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              type="text"
              name="FullName"
              className={`form-control ${errors.FullName ? 'error' : ''}`}
              value={formData.FullName}
              onChange={handleChange}
              placeholder="Juan Pérez"
            />
            {errors.FullName && <span className="error-message">{errors.FullName}</span>}
          </div>

          <div className="form-row">
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
              <label className="form-label">
                Rol <span className="required">*</span>
              </label>
              <select
                name="RoleID"
                className={`form-control ${errors.RoleID ? 'error' : ''}`}
                value={formData.RoleID}
                onChange={handleChange}
              >
                <option value="">Seleccionar rol...</option>
                {roles.map(role => (
                  <option key={role.RoleID} value={role.RoleID}>
                    {role.Name}
                  </option>
                ))}
              </select>
              {errors.RoleID && <span className="error-message">{errors.RoleID}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              name="IsActive"
              className="form-control"
              value={formData.IsActive}
              onChange={handleChange}
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
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
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;