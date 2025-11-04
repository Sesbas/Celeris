import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Assets from './pages/Assets';
import ServiceOrders from './pages/ServiceOrders';
import CustomerDetail from './pages/CustomerDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard - Accesible para todos los usuarios autenticados */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Usuarios - Solo admin (RoleID = 1) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole={1}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Roles - Solo admin (RoleID = 1) */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredRole={1}>
                <Layout>
                  <Roles />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Clientes - Accesible para todos los roles */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Vista Detallada de Cliente */}
          <Route
            path="/customers/:customerId"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomerDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Productos - Accesible para todos los roles */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Assets (Equipos) - Accesible para todos los roles */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Layout>
                  <Assets />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Órdenes de Servicio - Accesible para todos los roles */}
          <Route
            path="/service-orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServiceOrders />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto - redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta 404 - Página no encontrada */}
          <Route
            path="*"
            element={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <h1>404 - Página no encontrada</h1>
                <a href="/dashboard" style={{ color: '#667eea' }}>Volver al Dashboard</a>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;