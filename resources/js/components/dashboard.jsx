// ============================================================
//  pages/Dashboard.jsx — Manager / HR analytics overview
//
//  Features:
//  - Top stat cards: Total Employees, Attendance Today,
//    Pending Leaves, Average Attendance %
//  - Attendance trend chart (canvas + Chart.js from CDN)
//  - Attendance today breakdown (present/late/absent bars)
//  - Recent pending leave requests mini-table
//  - Department headcount distribution
//  - Today's attendance list
// ============================================================

import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";

// ── Helpers ───────────────────────────────────────────────────
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  };
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    present: "bg-green-50 text-green-700 border border-green-200",
    late:    "bg-amber-50 text-amber-700 border border-amber-200",
    absent:  "bg-red-50   text-red-600   border border-red-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] || map.present}`}>
      {status}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, subtitle, icon, color, bg }) {
  return (
    <div className={`${bg} border border-gray-100 rounded-xl p-5 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Attendance Trend Chart ────────────────────────────────────
function AttendanceTrendChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    if (window.Chart) {
      drawChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      script.onload = drawChart;
      document.head.appendChild(script);
    }

    function drawChart() {
      if (chartRef.current) chartRef.current.destroy();

      const ctx = canvasRef.current.getContext("2d");
      chartRef.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: data.map(d => d.month),
          datasets: [{
            label: "Attendance Rate %",
            data: data.map(d => d.rate),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.08)",
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 7,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1e293b",
              titleColor: "#f1f5f9",
              bodyColor: "#cbd5e1",
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => `Attendance: ${ctx.parsed.y}%`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 12 }, color: "#94a3b8" },
            },
            y: {
              min: 80,
              max: 100,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: {
                stepSize: 5,
                font: { size: 12 },
                color: "#94a3b8",
                callback: (v) => v + "%",
              },
            },
          },
        },
      });
    }

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">Attendance Trend</h2>
        <p className="text-xs text-gray-400 mt-0.5">Average attendance rate over the last 6 months</p>
      </div>
      <div className="px-6 py-5">
        <div style={{ height: 260 }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

// ── Attendance Today Breakdown ────────────────────────────────
function AttendanceTodayCard({ data }) {
  if (!data) return null;
  const { present, late, absent, total } = data;

  const items = [
    { label: "Present", value: present, color: "bg-green-500", pct: Math.round((present / total) * 100) },
    { label: "Late", value: late, color: "bg-amber-500", pct: Math.round((late / total) * 100) },
    { label: "Absent", value: absent, color: "bg-red-500", pct: Math.round((absent / total) * 100) },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">Attendance Today</h2>
        <p className="text-xs text-gray-400 mt-0.5">{total} total employees</p>
      </div>
      <div className="px-6 py-5 space-y-4">
        {/* Stacked bar */}
        <div className="flex rounded-full overflow-hidden h-3">
          {items.map(item => (
            <div
              key={item.label}
              className={`${item.color} transition-all duration-500`}
              style={{ width: `${item.pct}%` }}
              title={`${item.label}: ${item.value}`}
            />
          ))}
        </div>

        {/* Labels */}
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
              <span className="text-xs text-gray-400 w-10 text-right">{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pending Leave Requests ────────────────────────────────────
function PendingLeavesCard({ leaves }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-gray-900">Pending Leave Requests</h2>
          <p className="text-xs text-gray-400 mt-0.5">{leaves?.length || 0} awaiting review</p>
        </div>
        <a
          href="/leave"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          style={{ textDecoration: 'none' }}
        >
          View all →
        </a>
      </div>
      {(!leaves || leaves.length === 0) ? (
        <div className="p-6 text-center text-sm text-gray-400">No pending requests.</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {leaves.map(l => (
            <div key={l.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{l.employee}</p>
                <p className="text-xs text-gray-400">{l.type} · {l.days} day{l.days > 1 ? 's' : ''}</p>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Department Headcount ──────────────────────────────────────
function DepartmentCard({ departments }) {
  if (!departments) return null;
  const total = departments.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">Department Headcount</h2>
        <p className="text-xs text-gray-400 mt-0.5">{total} employees across {departments.length} departments</p>
      </div>
      <div className="px-6 py-4 space-y-3">
        {departments.map(d => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.department}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{d.department}</span>
                <span className="text-gray-400 text-xs">{d.count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Today's Attendance List ───────────────────────────────────
function TodayListCard({ records }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-gray-900">Today's Attendance</h2>
          <p className="text-xs text-gray-400 mt-0.5">Detailed employee check-in status</p>
        </div>
        <a
          href="/attendance"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          style={{ textDecoration: 'none' }}
        >
          View all →
        </a>
      </div>
      {(!records || records.length === 0) ? (
        <div className="p-8 text-center text-sm text-gray-400">No attendance data for today.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Employee", "Department", "Clock In", "Status"].map(h => (
                  <th key={h} className="text-left px-6 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.slice(0, 8).map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-6 py-3 text-gray-500">{r.department}</td>
                  <td className="px-6 py-3 text-gray-600">{r.clock_in}</td>
                  <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", { headers: authHeaders() });
      if (res.ok) setData(await res.json());
    } catch {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{today} · Dashboard overview</p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Loading dashboard data...</p>
        </div>
      ) : !data ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">Failed to load dashboard data.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Employees"
              value={data.total_employees}
              subtitle="Active workforce"
              bg="bg-white"
              color="text-blue-600"
              icon={
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <StatCard
              label="Attendance Today"
              value={`${data.attendance_today?.present || 0}/${data.attendance_today?.total || 0}`}
              subtitle={`${data.attendance_today?.late || 0} late, ${data.attendance_today?.absent || 0} absent`}
              bg="bg-white"
              color="text-green-600"
              icon={
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            <StatCard
              label="Pending Leaves"
              value={data.pending_leaves}
              subtitle="Awaiting approval"
              bg="bg-white"
              color="text-amber-600"
              icon={
                <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <StatCard
              label="Avg Attendance"
              value={`${data.avg_attendance}%`}
              subtitle="This month"
              bg="bg-white"
              color="text-indigo-600"
              icon={
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
          </div>

          {/* Chart + Breakdown row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <AttendanceTrendChart data={data.attendance_trend} />
            </div>
            <AttendanceTodayCard data={data.attendance_today} />
          </div>

          {/* Leaves + Department row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PendingLeavesCard leaves={data.recent_leaves} />
            <DepartmentCard departments={data.department_headcount} />
          </div>

          {/* Today's attendance list */}
          <TodayListCard records={data.today_attendance_list} />
        </>
      )}
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('dashboardPage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
