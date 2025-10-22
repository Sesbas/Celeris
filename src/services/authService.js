import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth.php', { email, password });
      
      if (response.data.success && response.data.user) {
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al conectar con el servidor' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};

export default authService;