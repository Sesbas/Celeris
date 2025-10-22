import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import ProductModal from '../components/ProductModal';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.records || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar el catálogo de productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setCategoryFilter(category);
    
    if (category === 'all') {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productService.getByCategory(category);
      setProducts(response.records || []);
    } catch (error) {
      console.error('Error al filtrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    
    if (status === 'all') {
      if (categoryFilter !== 'all') {
        handleCategoryFilter(categoryFilter);
      } else {
        loadProducts();
      }
      return;
    }

    if (status === 'active') {
      try {
        setLoading(true);
        const response = await productService.getActive();
        setProducts(response.records || []);
      } catch (error) {
        console.error('Error al filtrar:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
      try {
        await productService.delete(productId);
        alert('Producto eliminado exitosamente');
        loadProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert(error.message || 'Error al eliminar el producto');
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await productService.update({ ...productData, ProductID: editingProduct.ProductID });
        alert('Producto actualizado exitosamente');
      } else {
        await productService.create(productData);
        alert('Producto creado exitosamente');
      }
      setShowModal(false);
      loadProducts();
      setCategoryFilter('all');
      setStatusFilter('all');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  };

  // Filtrar por búsqueda local
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.SKU?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.IsActive == 1) ||
      (statusFilter === 'inactive' && product.IsActive == 0);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Catálogo de Productos</h1>
          <p>Gestiona tu inventario de productos y servicios</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o SKU..."
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
            <span className="filter-label">Categoría:</span>
            <div className="category-filters">
              <button
                className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('all')}
              >
                Todas
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'system' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('system')}
              >
                💧 Sistemas
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'filter' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('filter')}
              >
                🔧 Filtros
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'uv' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('uv')}
              >
                ☀️ UV
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'media' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('media')}
              >
                📦 Media
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'part' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('part')}
              >
                ⚙️ Repuestos
              </button>
              <button
                className={`filter-btn ${categoryFilter === 'service' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('service')}
              >
                🔨 Servicios
              </button>
            </div>
          </div>

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
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="products-count">
            Total: <strong>{filteredProducts.length}</strong> producto(s)
            {categoryFilter !== 'all' && ` - Categoría: ${getCategoryLabel(categoryFilter)}`}
            {statusFilter !== 'all' && ` - ${getStatusLabel(statusFilter)}`}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No se encontraron productos</h3>
              <p>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer producto'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.ProductID} className="product-card">
                <div className="product-header">
                  <div className={`product-icon category-${product.Category}`}>
                    {getCategoryIcon(product.Category)}
                  </div>
                  <span className={`badge badge-${product.IsActive == 1 ? 'success' : 'secondary'}`}>
                    {product.IsActive == 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="product-body">
                  <h3 className="product-name">{product.Name}</h3>
                  {product.SKU && (
                    <div className="product-sku">SKU: {product.SKU}</div>
                  )}
                  <div className="product-category">
                    <span className={`badge badge-${getCategoryBadgeClass(product.Category)}`}>
                      {getCategoryLabel(product.Category)}
                    </span>
                  </div>
                  {product.DefaultReplacementMonths && (
                    <div className="product-replacement">
                      🔄 Reemplazo cada {product.DefaultReplacementMonths} meses
                    </div>
                  )}
                </div>

                <div className="product-footer">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEditProduct(product)}
                    title="Editar"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteProduct(product.ProductID, product.Name)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getCategoryIcon = (category) => {
  const icons = {
    'system': '💧',
    'filter': '🔧',
    'uv': '☀️',
    'media': '📦',
    'part': '⚙️',
    'service': '🔨'
  };
  return icons[category] || '📦';
};

const getCategoryLabel = (category) => {
  const labels = {
    'system': 'Sistema',
    'filter': 'Filtro',
    'uv': 'UV',
    'media': 'Media',
    'part': 'Repuesto',
    'service': 'Servicio'
  };
  return labels[category] || category;
};

const getCategoryBadgeClass = (category) => {
  const classes = {
    'system': 'info',
    'filter': 'warning',
    'uv': 'warning',
    'media': 'secondary',
    'part': 'secondary',
    'service': 'success'
  };
  return classes[category] || 'secondary';
};

const getStatusLabel = (status) => {
  return status === 'active' ? 'Activos' : 'Inactivos';
};

export default Products;