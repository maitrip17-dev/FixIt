import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { getComplaints } from '../../api/complaints.js';

const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchUserTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await getComplaints(params);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching user complaints:', err);
      setError('Unable to load your complaints. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [statusFilter, categoryFilter]);

  // Compute metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;

  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other'];
  const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resident Maintenance Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. File complaints, track service progress, and receive live updates.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors duration-150"
        >
          <span className="text-base font-bold">+</span> File New Complaint
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Filed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Filed
          </span>
          <span className="text-3xl font-extrabold text-slate-900 mt-2 block">
            {totalCount}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">All-time tickets</span>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-3xl font-extrabold text-amber-700 mt-2 block">
            {pendingCount}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">In requests pool</span>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-3xl font-extrabold text-blue-700 mt-2 block">
            {inProgressCount}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Claimed by technician</span>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Resolved
          </span>
          <span className="text-3xl font-extrabold text-emerald-700 mt-2 block">
            {resolvedCount}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Completed repairs</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setCategoryFilter('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline ml-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        <button
          onClick={fetchUserTickets}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-xl p-4 mb-6">
          {error}
        </div>
      )}

      {/* Complaints Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            My Submitted Tickets ({complaints.length})
          </h2>
          <span className="text-xs text-slate-500">Live Status Tracker</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Loading your maintenance tickets...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center px-4">
            <span className="text-4xl block mb-3">📋</span>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No maintenance complaints found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
              {statusFilter || categoryFilter
                ? 'No tickets match the selected filter criteria. Try resetting your filters.'
                : "You haven't submitted any service requests yet. Notice something broken? File a ticket to alert maintenance."}
            </p>
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Ticket ID</th>
                  <th className="py-3 px-5">Title & Category</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Assigned Technician</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-600 text-xs whitespace-nowrap">
                      <Link to={`/complaints/${item._id}`} className="hover:underline">
                        {item.ticketId}
                      </Link>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <span className="text-xs text-slate-500">{item.category}</span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      📍 {item.location}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getPriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-xs whitespace-nowrap">
                      {item.assignedTo ? (
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-md font-medium">
                          🛠️ {item.assignedTo.name}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-medium text-[11px]">
                          ⏳ In Open Pool
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/complaints/${item._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
