import Dashboard from './Dashboard.js';

/**
 * ComplaintsList delegates directly to the role-based Dashboard switcher:
 * - Resident / User: UserDashboard
 * - Maintenance Worker / Technician: WorkerDashboard
 * - Administrator / Supervisor: AdminDashboard
 */
const ComplaintsList = () => {
  return <Dashboard />;
};

export default ComplaintsList;
