import React, { useState, useEffect } from 'react';
import './styles.css';

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    SKU: '',
    Name: '',
    Category: 'system',
    DefaultReplacementMonths: '',
    IsActive: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        SKU: product.SKU || '',
        Name: product.Name || '',
        Category: product.Category || 'system',
        DefaultReplacementMonths: product.DefaultReplacementMonths || '',
        IsActive: product.IsActive || 1
      });
    }
  }, [product]);

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
      newErrors.Name = 'El nombre es requerido';
    }

    if (!formData.Category) {
      newErrors.Category = 'La categoría es requerida';
    }

    if (formData.DefaultReplacementMonths && formData.DefaultReplacementMonths < 0) {
      newErrors.DefaultReplacementMonths = 'Debe ser un número positivo';
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
        SKU: formData.SKU.trim() || null,
        DefaultReplacementMonths: formData.DefaultReplacementMonths || null
      };

      await onSave(dataToSend);
    } catch (error) {
      alert(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              SKU (Código)
              <span className="help-text">Código único del producto (opcional)</span>
            </label>
            <input
              type="text"
              name="SKU"
              className="form-control"
              value={formData.SKU}
              onChange={handleChange}
              placeholder="Ej: SYS-001, FLT-250"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Nombre del Producto <span className="required">*</span>
            </label>
            <input
              type="text"
              name="Name"
              className={`form-control ${errors.Name ? 'error' : ''}`}
              value={formData.Name}
              onChange={handleChange}
              placeholder="Sistema de Purificación Premium"
            />
            {errors.Name && <span className="error-message">{errors.Name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Categoría <span className="required">*</span>
              </label>
              <select
                name="Category"
                className={`form-control ${errors.Category ? 'error' : ''}`}
                value={formData.Category}
                onChange={handleChange}
              >
                <option value="system">💧 Sistema</option>
                <option value="filter">🔧 Filtro</option>
                <option value="uv">☀️ UV</option>
                <option value="media">📦 Media</option>
                <option value="part">⚙️ Repuesto</option>
                <option value="service">🔨 Servicio</option>
              </select>
              {errors.Category && <span className="error-message">{errors.Category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                name="IsActive"
                className="form-control"
                value={formData.IsActive}
                onChange={handleChange}
              >
                <option value="1">✅ Activo</option>
                <option value="0">⏸️ Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Reemplazo Predeterminado (meses)
              <span className="help-text">¿Cada cuántos meses debe reemplazarse?</span>
            </label>
            <input
              type="number"
              name="DefaultReplacementMonths"
              className={`form-control ${errors.DefaultReplacementMonths ? 'error' : ''}`}
              value={formData.DefaultReplacementMonths}
              onChange={handleChange}
              placeholder="6"
              min="0"
            />
            {errors.DefaultReplacementMonths && <span className="error-message">{errors.DefaultReplacementMonths}</span>}
          </div>

          <div className="info-box">
            <strong>💡 Información:</strong>
            <ul>
              <li><strong>Sistemas:</strong> Equipos de purificación completos</li>
              <li><strong>Filtros:</strong> Filtros de reemplazo</li>
              <li><strong>UV:</strong> Lámparas y sistemas UV</li>
              <li><strong>Media:</strong> Medios filtrantes (arena, carbón, etc.)</li>
              <li><strong>Repuestos:</strong> Partes y accesorios</li>
              <li><strong>Servicios:</strong> Servicios técnicos</li>
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
              {loading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;