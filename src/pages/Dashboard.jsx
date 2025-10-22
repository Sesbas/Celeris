import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAssets: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Obtener estadísticas de diferentes endpoints
      const [customersRes, assetsRes, ordersRes] = await Promise.all([
        api.get('/customers.php'),
        api.get('/assets.php'),
        api.get('/service_orders.php'),
      ]);

      const customers = customersRes.data.records || [];
      const assets = assetsRes.data.records || [];
      const orders = ordersRes.data.records || [];

      setStats({
        totalCustomers: customers.length,
        totalAssets: assets.length,
        pendingOrders: orders.filter(o => o.Status === 'scheduled' || o.Status === 'requested').length,
        completedOrders: orders.filter(o => o.Status === 'completed').length,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {user?.FullName}</h1>
        <p>Resumen de tu sistema CRM</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Clientes</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <h3>{stats.totalAssets}</h3>
            <p>Equipos Instalados</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingOrders}</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedOrders}</h3>
            <p>Órdenes Completadas</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <h2>📊 Resumen del Mes</h2>
          <p>Análisis de actividades del mes actual</p>
          <div className="section-placeholder">
            <p>Próximamente: Gráficos de rendimiento</p>
          </div>
        </div>

        <div className="section-card">
          <h2>🔔 Próximas Actividades</h2>
          <p>Mantenimientos y servicios programados</p>
          <div className="section-placeholder">
            <p>Próximamente: Calendario de actividades</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;