import api from './api';

const roleService = {
  // Obtener todos los roles
  getAll: async () => {
    try {
      const response = await api.get('/roles.php');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener roles' };
    }
  }
};

export default roleService;