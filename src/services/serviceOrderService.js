import api from './api';

const serviceOrderService = {
  // Obtener todas las órdenes
  getAll: async () => {
    try {
      const response = await api.get('/service_orders.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener órdenes' };
    }
  },

  // Obtener una orden específica
  getOne: async (id) => {
    try {
      const response = await api.get(`/service_orders.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener orden' };
    }
  },

  // Filtrar por estado
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/service_orders.php?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al filtrar órdenes' };
    }
  },

  // Filtrar por cliente
  getByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/service_orders.php?customer=${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener órdenes del cliente' };
    }
  },

  // Filtrar por técnico
  getByTechnician: async (technicianId) => {
    try {
      const response = await api.get(`/service_orders.php?technician=${technicianId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener órdenes del técnico' };
    }
  },

  // Crear nueva orden
  create: async (orderData) => {
    try {
      const response = await api.post('/service_orders.php', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear orden' };
    }
  },

  // Actualizar orden
  update: async (orderData) => {
    try {
      const response = await api.put('/service_orders.php', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar orden' };
    }
  },

  // Completar orden
  complete: async (serviceId) => {
    try {
      const response = await api.put('/service_orders.php', {
        ServiceID: serviceId,
        action: 'complete'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al completar orden' };
    }
  },

  // Eliminar orden
  delete: async (serviceId) => {
    try {
      const response = await api.delete('/service_orders.php', {
        data: { ServiceID: serviceId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar orden' };
    }
  }
};

export default serviceOrderService;