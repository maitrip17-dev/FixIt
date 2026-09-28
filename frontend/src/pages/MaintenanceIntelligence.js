import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsOverview } from '../api/analytics.js';

const MaintenanceIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching maintenance intelligence:', err);
      setError(
        err.response?.data?.message || 'Failed to load maintenance analytics. Please check connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {
    totalComplaints: 0,
    activeWorkOrders: 0,
    resolvedComplaints: 0,
    resolutionRate: 0,
    globalAvgResolutionHours: 0,
  };

  const frequentIssues = data?.frequentIssues || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const avgResolutionTime = data?.avgResolutionTime || [];
  const statusCounts = data?.statusCounts || [];

  // Find top hotspot for alert
  const topHotspot = frequentIssues.length > 0 && frequentIssues[0].count > 1 ? frequentIssues[0] : null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Electrical':
        return '#f59e0b'; // Amber
      case 'Plumbing':
        return '#0284c7'; // Sky
      case 'Cleaning':
        return '#10b981'; // Emerald
      case 'Internet':
        return '#8b5cf6'; // Violet
      case 'Furniture':
        return '#d97706'; // Warm Amber
      default:
        return '#64748b'; // Slate
    }
  };

  const getTurnaroundSpeedBadge = (hours) => {
    if (hours <= 1.0) {
      return { label: 'Optimal Speed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (hours <= 4.0) {
      return { label: 'Standard Pace', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { label: 'Action Required', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maintenance Intelligence & Analytics
            </h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Admin Insights
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1.5">
            Real-time infrastructure failure detection, category workload distribution, and turnaround metrics powered by native MongoDB aggregations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            ← Operations Hub
          </Link>
          <button
            onClick={fetchAnalytics}
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-xl p-4 mb-6">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">
            Running MongoDB aggregation pipelines across maintenance data...
          </p>
        </div>
      ) : (
        <>
          {/* Top Hotspot Critical Alert Callout */}
          {topHotspot && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl rounded-l-md shadow-sm mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                    Repeated Infrastructure Failure Hotspot Detected
                  </h3>
                  <p className="text-sm text-amber-800 mt-1">
                    <strong>{topHotspot.location}</strong> has logged{' '}
                    <span className="font-extrabold text-amber-950 underline">
                      {topHotspot.count} {topHotspot.category}
                    </span>{' '}
                    complaints. Root-cause inspection is strongly recommended to prevent systemic service disruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KPI Header Row (4 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Processed
              </span>
              <span className="text-3xl font-extrabold text-slate-900 mt-2 block">
                {summary.totalComplaints}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">All-time tickets</span>
            </div>

            <div className="bg-white border border-slate-200 border-l-4 border-l-orange-500 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                Active Work Orders
              </span>
              <span className="text-3xl font-extrabold text-orange-700 mt-2 block">
                {summary.activeWorkOrders}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Pending & In Progress</span>
            </div>

            <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Global Avg Turnaround
              </span>
              <span className="text-3xl font-extrabold text-blue-700 mt-2 block">
                {summary.globalAvgResolutionHours}{' '}
                <span className="text-sm font-semibold text-slate-500">hrs</span>
              </span>
              <span className="text-xs text-slate-500 mt-1 block">From filed to resolved</span>
            </div>

            <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                Resolution Efficiency
              </span>
              <span className="text-3xl font-extrabold text-emerald-700 mt-2 block">
                {summary.resolutionRate}%
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {summary.resolvedComplaints} of {summary.totalComplaints} resolved
              </span>
            </div>
          </div>

          {/* Grid: Hotspots (Left) and Category Distribution (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hotspots Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Top Recurring Hotspots
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Grouped by Location & Trade Category
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    Top 5 Focus Zones
                  </span>
                </div>

                {frequentIssues.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No recurring hotspots recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {frequentIssues.map((item, idx) => {
                      const isHighRepeat = item.count > 1;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-lg border flex items-center justify-between ${
                            isHighRepeat
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                📍 {item.location}
                              </div>
                              <div className="text-xs text-slate-500">
                                Trade Category:{' '}
                                <span className="font-semibold text-slate-700">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                                isHighRepeat
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.count} {item.count === 1 ? 'ticket' : 'tickets'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                💡 Computed via MongoDB pipeline: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">$group: &#123; location, category &#125;</code>
              </div>
            </div>

            {/* Category Workload Distribution Meters */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Workload Volume by Category
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Percentage breakdown of all incoming service orders
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    Volume Share
                  </span>
                </div>

                {categoryDistribution.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No category data available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryDistribution.map((item, idx) => {
                      const total = summary.totalComplaints || 1;
                      const percentage = Math.round((item.count / total) * 100);
                      const barColor = getCategoryColor(item.category);

                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: barColor }}
                              />
                              {item.category}
                            </span>
                            <span className="text-slate-500">
                              <strong className="text-slate-800">{item.count}</strong> tickets ({percentage}%)
                            </span>
                          </div>

                          {/* Visual Progress Bar Meter */}
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-2.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(percentage, 5)}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                💡 Computed via MongoDB pipeline: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">$group: &#123; category &#125;</code>
              </div>
            </div>
          </div>

          {/* Turnaround Efficiency & Resolution Times */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Turnaround Efficiency & Mean Resolution Hours
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elapsed hours between creation and resolution computed via MongoDB duration arithmetic
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">(updatedAt - createdAt) / 3600000</code>
              </span>
            </div>

            {avgResolutionTime.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No resolved complaints logged yet to calculate turnaround duration.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {avgResolutionTime.map((item, idx) => {
                  const speed = getTurnaroundSpeedBadge(item.avgHours);
                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-slate-900">
                          {item.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${speed.color}`}
                        >
                          {speed.label}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 my-1">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {item.avgHours}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          hours avg
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                        Based on {item.resolvedCount} completed {item.resolvedCount === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Status KPI Summary */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Lifecycle Status Inventory
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time snapshot across all complaint lifecycle phases
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {statusCounts.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    {st.status}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaintenanceIntelligence;
