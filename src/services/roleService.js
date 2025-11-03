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
  },

  // Obtener un rol por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/roles.php?id=${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el rol' };
    }
  },

  // Crear un nuevo rol
  create: async (roleData) => {
    try {
      const response = await api.post('/roles.php', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear el rol' };
    }
  },

  // Actualizar un rol existente
  update: async (roleData) => {
    try {
      // Tu componente envía { ...roleData, RoleID: editingRole.RoleID }
      const response = await api.put(`/roles.php`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el rol' };
    }
  },

  // Eliminar un rol
  delete: async (roleId) => {
    try {
      // El backend espera RoleID en el body de la petición
      const response = await api.delete('/roles.php', {
        data: { RoleID: roleId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el rol' };
    }
  }
};

export default roleService;