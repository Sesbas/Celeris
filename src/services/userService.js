import api from './api';

const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const response = await api.get('/users.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  // Obtener un usuario específico
  getOne: async (id) => {
    try {
      const response = await api.get(`/users.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuario' };
    }
  },

  // Crear nuevo usuario
  create: async (userData) => {
    try {
      const response = await api.post('/users.php', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear usuario' };
    }
  },

  // Actualizar usuario
  update: async (userData) => {
    try {
      const response = await api.put('/users.php', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar usuario' };
    }
  },

  // Eliminar usuario
  delete: async (userId) => {
    try {
      const response = await api.delete('/users.php', {
        data: { UserID: userId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar usuario' };
    }
  }
};

export default userService;