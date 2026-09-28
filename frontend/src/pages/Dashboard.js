import { useAuth } from '../context/AuthContext.js';
import UserDashboard from '../components/dashboards/UserDashboard.js';
import WorkerDashboard from '../components/dashboards/WorkerDashboard.js';
import AdminDashboard from '../components/dashboards/AdminDashboard.js';

/**
 * Role-Based Dashboard Switcher
 * Dynamically mounts the appropriate tailored dashboard view based on authenticated user role:
 * - Resident / User: UserDashboard
 * - Maintenance Worker / Technician: WorkerDashboard
 * - Administrator / Supervisor: AdminDashboard
 */
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'worker') {
    return <WorkerDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;
