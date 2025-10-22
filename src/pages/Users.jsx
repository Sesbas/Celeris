import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import roleService from '../services/roleService';
import UserModal from '../components/UserModal';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.records || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.records || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) {
      try {
        await userService.delete(userId);
        alert('Usuario eliminado exitosamente');
        loadUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert(error.message || 'Error al eliminar el usuario');
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // Actualizar
        await userService.update({ ...userData, UserID: editingUser.UserID });
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo
        await userService.create(userData);
        alert('Usuario creado exitosamente');
      }
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  };

  const filteredUsers = users.filter(user => 
    user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddUser}>
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="users-count">
            Total: <strong>{filteredUsers.length}</strong> usuario(s)
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.UserID}>
                    <td>{user.UserID}</td>
                    <td>
                      <div className="user-name">
                        <div className="user-avatar-table">
                          {user.FullName?.charAt(0)}
                        </div>
                        {user.FullName}
                      </div>
                    </td>
                    <td>{user.Email}</td>
                    <td>{user.Phone || '-'}</td>
                    <td>
                      <span className={`badge badge-${getRoleBadgeClass(user.RoleID)}`}>
                        {user.RoleName}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.IsActive == 1 ? 'badge-success' : 'badge-danger'}`}>
                        {user.IsActive == 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{formatDate(user.CreatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteUser(user.UserID, user.FullName)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getRoleBadgeClass = (roleId) => {
  switch(roleId) {
    case 1: return 'danger';  // Admin
    case 2: return 'info';    // Technician
    case 3: return 'warning'; // Sales
    default: return 'secondary';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default Users;