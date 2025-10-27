import api from './api';

const assetService = {
  // Obtener todos los assets
  getAll: async () => {
    try {
      const response = await api.get('/assets.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos' };
    }
  },

  // Obtener un asset específico
  getOne: async (id) => {
    try {
      const response = await api.get(`/assets.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipo' };
    }
  },

  // Obtener assets por cliente
  getByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/assets.php?customer=${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos del cliente' };
    }
  },

  // Obtener assets que necesitan servicio
  getDueForService: async () => {
    try {
      const response = await api.get('/assets.php?due_service=true');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener equipos para servicio' };
    }
  },

  // Crear nuevo asset
  create: async (assetData) => {
    try {
      const response = await api.post('/assets.php', assetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear equipo' };
    }
  },

  // Actualizar asset
  update: async (assetData) => {
    try {
      const response = await api.put('/assets.php', assetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar equipo' };
    }
  },

  // Eliminar asset
  delete: async (assetId) => {
    try {
      const response = await api.delete('/assets.php', {
        data: { AssetID: assetId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar equipo' };
    }
  }
};

export default assetService;