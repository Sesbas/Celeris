import api from './api';

const customerService = {
  // Obtener todos los clientes
  getAll: async () => {
    try {
      const response = await api.get('/customers.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener clientes' };
    }
  },

  // Obtener un cliente específico
  getOne: async (id) => {
    try {
      const response = await api.get(`/customers.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener cliente' };
    }
  },

  // Buscar clientes
  search: async (keyword) => {
    try {
      const response = await api.get(`/customers.php?search=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al buscar clientes' };
    }
  },

  // Filtrar por estado
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/customers.php?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al filtrar clientes' };
    }
  },

  // Crear nuevo cliente
  create: async (customerData) => {
    try {
      const response = await api.post('/customers.php', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear cliente' };
    }
  },

  // Actualizar cliente
  update: async (customerData) => {
    try {
      const response = await api.put('/customers.php', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar cliente' };
    }
  },

  // Eliminar cliente
  delete: async (customerId) => {
    try {
      const response = await api.delete('/customers.php', {
        data: { CustomerID: customerId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar cliente' };
    }
  }
};

export default customerService;