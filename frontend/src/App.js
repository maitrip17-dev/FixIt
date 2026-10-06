import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';
import Navbar from './components/Navbar.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Dashboard from './pages/Dashboard.js';
import ComplaintsList from './pages/ComplaintsList.js';
import CreateComplaint from './pages/CreateComplaint.js';
import ComplaintDetail from './pages/ComplaintDetail.js';
import MaintenanceIntelligence from './pages/MaintenanceIntelligence.js';
import Unauthorized from './pages/Unauthorized.js';

// Layout wrapper attaching Navbar to protected pages
const ProtectedLayout = ({ children, allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <Navbar />
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Role-Based Dashboard Hub */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        {/* Protected Complaints Engine Routes */}
        <Route
          path="/complaints"
          element={
            <ProtectedLayout>
              <ComplaintsList />
            </ProtectedLayout>
          }
        />

        <Route
          path="/complaints/new"
          element={
            <ProtectedLayout allowedRoles={['user', 'admin']}>
              <CreateComplaint />
            </ProtectedLayout>
          }
        />

        <Route
          path="/complaints/:id"
          element={
            <ProtectedLayout>
              <ComplaintDetail />
            </ProtectedLayout>
          }
        />

        {/* Intelligence & Analytics Dashboard (Admin Only) */}
        <Route
          path="/analytics"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <MaintenanceIntelligence />
            </ProtectedLayout>
          }
        />
        <Route
          path="/maintenance-intelligence"
          element={
            <ProtectedLayout allowedRoles={['admin']}>
              <MaintenanceIntelligence />
            </ProtectedLayout>
          }
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
