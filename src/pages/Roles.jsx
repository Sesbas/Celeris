import React, { useState, useEffect } from 'react';
import roleService from '../services/roleService';
import RoleModal from '../components/RoleModal';
import './Roles.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.records || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      alert('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (window.confirm(`¿Estás seguro de eliminar el rol "${roleName}"?\n\nNOTA: No se puede eliminar si hay usuarios asignados a este rol.`)) {
      try {
        await roleService.delete(roleId);
        alert('Rol eliminado exitosamente');
        loadRoles();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
        alert(error.message || 'Error al eliminar el rol. Puede que tenga usuarios asignados.');
      }
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole) {
        await roleService.update({ ...roleData, RoleID: editingRole.RoleID });
        alert('Rol actualizado exitosamente');
      } else {
        await roleService.create(roleData);
        alert('Rol creado exitosamente');
      }
      setShowModal(false);
      loadRoles();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="roles-page">
      <div className="page-header">
        <div>
          <h1>Gestión de Roles</h1>
          <p>Define los roles y permisos del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddRole}>
          ➕ Nuevo Rol
        </button>
      </div>

      <div className="roles-grid">
        {roles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <h3>No hay roles registrados</h3>
            <p>Comienza creando el primer rol del sistema</p>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.RoleID} className="role-card">
              <div className="role-header">
                <div className={`role-icon role-${role.RoleID}`}>
                  {getRoleIcon(role.RoleID)}
                </div>
                <span className={`badge badge-${getRoleBadgeClass(role.RoleID)}`}>
                  ID: {role.RoleID}
                </span>
              </div>
              
              <div className="role-body">
                <h3 className="role-name">{role.Name}</h3>
              </div>

              <div className="role-footer">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => handleEditRole(role)}
                  title="Editar"
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteRole(role.RoleID, role.Name)}
                  title="Eliminar"
                  disabled={role.RoleID === 1} // No se puede eliminar el rol Manager
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <RoleModal
          role={editingRole}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
};

// Funciones auxiliares
const getRoleIcon = (roleId) => {
  const icons = {
    1: '👑', // Manager
    2: '🔧', // Technician
    3: '💼', // Sales
  };
  return icons[roleId] || '👤';
};

const getRoleBadgeClass = (roleId) => {
  const classes = {
    1: 'danger',  // Manager - Rojo
    2: 'info',    // Technician - Azul
    3: 'warning', // Sales - Amarillo
  };
  return classes[roleId] || 'secondary';
};



export default Roles;