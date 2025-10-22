import api from './api';

const productService = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const response = await api.get('/products.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos' };
    }
  },

  // Obtener un producto específico
  getOne: async (id) => {
    try {
      const response = await api.get(`/products.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener producto' };
    }
  },

  // Obtener solo productos activos
  getActive: async () => {
    try {
      const response = await api.get('/products.php?active=true');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos activos' };
    }
  },

  // Filtrar por categoría
  getByCategory: async (category) => {
    try {
      const response = await api.get(`/products.php?category=${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al filtrar productos' };
    }
  },

  // Crear nuevo producto
  create: async (productData) => {
    try {
      const response = await api.post('/products.php', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear producto' };
    }
  },

  // Actualizar producto
  update: async (productData) => {
    try {
      const response = await api.put('/products.php', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar producto' };
    }
  },

  // Eliminar producto
  delete: async (productId) => {
    try {
      const response = await api.delete('/products.php', {
        data: { ProductID: productId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar producto' };
    }
  }
};

export default productService;