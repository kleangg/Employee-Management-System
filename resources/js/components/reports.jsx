// ============================================================
//  pages/Reports.jsx  — Admin only
//
//  Four report sections, each as a tab:
//  1. Attendance   — present/late/absent per employee
//  2. Leave        — approved/pending/rejected per employee
//  3. Headcount    — employee count per department
//  4. Monthly chart — attendance trend over 6 months
//
//  HOW IT WORKS:
//  - Redirects non-admins back to /dashboard
//  - Fetches all report data on mount from Laravel
//  - Monthly chart is drawn using <canvas> + Chart.js
//  - Each report has an Export CSV button
// ============================================================
 
import { useState, useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client';
import { useAuth, AuthProvider } from "../AuthContext";
import { useNavigate, BrowserRouter } from "react-router-dom";
 
// ── Helpers ───────────────────────────────────────────────────
 
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  };
}
 
// Download an array of objects as a CSV file
function exportCSV(filename, rows, columns) {
  const header = columns.map((c) => c.label).join(",");
  const body   = rows.map((r) =>
    columns.map((c) => `"${r[c.key] ?? ""}"`).join(",")
  ).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
 
// ── Shared UI ─────────────────────────────────────────────────
 
// Section card wrapper — title + export button + content
function ReportCard({ title, subtitle, onExport, children, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M1 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        )}
      </div>
      {loading ? (
        <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        children
      )}
    </div>
  );
}
 
// Stat pill used in table cells
function Pill({ value, color }) {
  const colors = {
    green:  "bg-green-50  text-green-700",
    amber:  "bg-amber-50  text-amber-700",
    red:    "bg-red-50    text-red-600",
    blue:   "bg-blue-50   text-blue-700",
    gray:   "bg-gray-100  text-gray-600",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>
      {value}
    </span>
  );
}
 
// ── Tab 1: Attendance Report ──────────────────────────────────
function AttendanceReport({ data, loading, month, onMonthChange }) {
  function handleExport() {
    exportCSV(`attendance-report-${month}.csv`, data, [
      { key: "name",        label: "Employee"     },
      { key: "department",  label: "Department"   },
      { key: "present",     label: "Present"      },
      { key: "late",        label: "Late"         },
      { key: "absent",      label: "Absent"       },
      { key: "total_hours", label: "Total Hours"  },
      { key: "rate",        label: "Attendance %" },
    ]);
  }
 
  return (
    <ReportCard
      title="Attendance report"
      subtitle={`Summary of daily attendance for ${month}`}
      onExport={data.length > 0 ? handleExport : null}
      loading={loading}
    >
      <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-3">
        <label className="text-sm text-gray-500">Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
 
      {data.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No data for this month.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Employee", "Department", "Present", "Late", "Absent", "Total hours", "Rate"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r) => (
                <tr key={r.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                  <td className="px-6 py-4 text-gray-500">{r.department}</td>
                  <td className="px-6 py-4"><Pill value={r.present} color="green" /></td>
                  <td className="px-6 py-4"><Pill value={r.late}    color="amber" /></td>
                  <td className="px-6 py-4"><Pill value={r.absent}  color="red"   /></td>
                  <td className="px-6 py-4 text-gray-600">{r.total_hours}h</td>
                  <td className="px-6 py-4">
                    {/* Progress bar showing attendance rate */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${r.rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{r.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  );
}
 
// ── Tab 2: Leave Report ───────────────────────────────────────
function LeaveReport({ data, loading, year, onYearChange }) {
  function handleExport() {
    exportCSV(`leave-report-${year}.csv`, data, [
      { key: "name",       label: "Employee"  },
      { key: "department", label: "Department"},
      { key: "approved",   label: "Approved"  },
      { key: "pending",    label: "Pending"   },
      { key: "rejected",   label: "Rejected"  },
      { key: "total_days", label: "Total Days"},
    ]);
  }
 
  const years = ["2025", "2024", "2023"];
 
  return (
    <ReportCard
      title="Leave report"
      subtitle={`Leave request summary for ${year}`}
      onExport={data.length > 0 ? handleExport : null}
      loading={loading}
    >
      <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-3">
        <label className="text-sm text-gray-500">Year:</label>
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
 
      {data.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No data for this year.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Employee", "Department", "Approved", "Pending", "Rejected", "Total days used"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r) => (
                <tr key={r.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                  <td className="px-6 py-4 text-gray-500">{r.department}</td>
                  <td className="px-6 py-4"><Pill value={r.approved} color="green" /></td>
                  <td className="px-6 py-4"><Pill value={r.pending}  color="amber" /></td>
                  <td className="px-6 py-4"><Pill value={r.rejected} color="red"   /></td>
                  <td className="px-6 py-4 text-gray-600">{r.total_days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  );
}
 
// ── Tab 3: Headcount Report ───────────────────────────────────
function HeadcountReport({ data, loading }) {
  const total = data.reduce((s, r) => s + r.count, 0);
 
  function handleExport() {
    exportCSV("headcount-report.csv", data, [
      { key: "department", label: "Department" },
      { key: "count",      label: "Headcount"  },
      { key: "pct",        label: "Percentage" },
    ]);
  }
 
  return (
    <ReportCard
      title="Headcount summary"
      subtitle="Total employees per department"
      onExport={data.length > 0 ? handleExport : null}
      loading={loading}
    >
      {data.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No data available.</div>
      ) : (
        <>
          {/* Visual bar chart */}
          <div className="px-6 py-5 space-y-4 border-b border-gray-50">
            {data.map((r) => {
              const pct = Math.round((r.count / total) * 100);
              return (
                <div key={r.department} className="flex items-center gap-4">
                  <span className="text-sm text-gray-700 w-40 flex-shrink-0 truncate">{r.department}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-lg flex items-center px-2 transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{r.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
 
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Department", "Headcount", "% of total"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((r) => (
                  <tr key={r.department} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.department}</td>
                    <td className="px-6 py-4"><Pill value={r.count} color="blue" /></td>
                    <td className="px-6 py-4 text-gray-500">{Math.round((r.count / total) * 100)}%</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-700">Total</td>
                  <td className="px-6 py-3 font-medium text-gray-700">{total}</td>
                  <td className="px-6 py-3 text-gray-500">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </ReportCard>
  );
}
 
// ── Tab 4: Monthly Chart ──────────────────────────────────────
// Draws a line chart using Chart.js (loaded from CDN)
function MonthlyChart({ data, loading }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null); // store Chart instance so we can destroy it on re-render
 
  useEffect(() => {
    if (loading || !data || !canvasRef.current) return;
 
    // Load Chart.js from CDN then draw the chart
    if (window.Chart) {
      drawChart();
    } else {
      const script   = document.createElement("script");
      script.src     = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      script.onload  = drawChart;
      document.head.appendChild(script);
    }
 
    function drawChart() {
      // Destroy previous chart before creating a new one
      // (prevents "Canvas is already in use" error)
      if (chartRef.current) { chartRef.current.destroy(); }
 
      const ctx = canvasRef.current.getContext("2d");
      chartRef.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: "Present",
              data: data.map((d) => d.present),
              borderColor: "#3B6D11",
              backgroundColor: "rgba(59,109,17,0.08)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
            },
            {
              label: "Late",
              data: data.map((d) => d.late),
              borderColor: "#854F0B",
              backgroundColor: "rgba(133,79,11,0.06)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
            },
            {
              label: "Absent",
              data: data.map((d) => d.absent),
              borderColor: "#A32D2D",
              backgroundColor: "rgba(163,45,45,0.06)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 12 } } },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.04)" },
              ticks: { stepSize: 5, font: { size: 12 } },
            },
          },
        },
      });
    }
 
    // Cleanup on unmount
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, loading]);
 
  return (
    <ReportCard
      title="Monthly attendance trend"
      subtitle="Present, late and absent counts over the last 6 months"
      loading={loading}
    >
      <div className="px-6 py-6">
        <div style={{ height: 280 }}>
          {loading ? null : <canvas ref={canvasRef} />}
        </div>
      </div>
    </ReportCard>
  );
}
 
// ── Main Reports page ─────────────────────────────────────────
export default function Reports() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
 
  // Redirect non-admins immediately
  useEffect(() => {
    if (user && user.role !== "HR Admin") navigate("/dashboard", { replace: true });
  }, [user]);
 
  const [activeTab, setActiveTab] = useState("attendance");
 
  // Data state for each report
  const [attData,   setAttData]   = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [hcData,    setHcData]    = useState([]);
  const [chartData, setChartData] = useState([]);
 
  // Loading state per report
  const [attLoad,   setAttLoad]   = useState(true);
  const [leaveLoad, setLeaveLoad] = useState(true);
  const [hcLoad,    setHcLoad]    = useState(true);
  const [chartLoad, setChartLoad] = useState(true);
 
  // Filter state
  const [attMonth,  setAttMonth]  = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [leaveYear, setLeaveYear] = useState("2025");
 
  // Fetch attendance report when month changes
  useEffect(() => {
    fetchAttendance();
  }, [attMonth]);
 
  // Fetch leave report when year changes
  useEffect(() => {
    fetchLeave();
  }, [leaveYear]);
 
  // Fetch headcount + chart once on mount
  useEffect(() => {
    fetchHeadcount();
    fetchChart();
  }, []);
 
  async function fetchAttendance() {
    setAttLoad(true);
    try {
      const res  = await fetch(`/api/reports/attendance?month=${attMonth}`, { headers: authHeaders() });
      setAttData(res.ok ? await res.json() : []);
    } catch {} finally { setAttLoad(false); }
  }
 
  async function fetchLeave() {
    setLeaveLoad(true);
    try {
      const res  = await fetch(`/api/reports/leave?year=${leaveYear}`, { headers: authHeaders() });
      setLeaveData(res.ok ? await res.json() : []);
    } catch {} finally { setLeaveLoad(false); }
  }
 
  async function fetchHeadcount() {
    setHcLoad(true);
    try {
      const res  = await fetch("/api/reports/headcount", { headers: authHeaders() });
      setHcData(res.ok ? await res.json() : []);
    } catch {} finally { setHcLoad(false); }
  }
 
  async function fetchChart() {
    setChartLoad(true);
    try {
      const res  = await fetch("/api/reports/monthly-trend", { headers: authHeaders() });
      setChartData(res.ok ? await res.json() : []);
    } catch {} finally { setChartLoad(false); }
  }
 
  const tabs = [
    { key: "attendance", label: "Attendance"  },
    { key: "leave",      label: "Leave"       },
    { key: "headcount",  label: "Headcount"   },
    { key: "trend",      label: "Monthly trend"},
  ];
 
  if (!user || user.role !== "HR Admin") return null;
 
  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-gray-900">Reports</h1>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          HR Admin only
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-6">View and export HR reports for your organisation.</p>
 
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={[
              "text-sm px-4 py-1.5 rounded-md transition-all whitespace-nowrap",
              activeTab === t.key
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
 
      {/* Report panels */}
      {activeTab === "attendance" && (
        <AttendanceReport
          data={attData} loading={attLoad}
          month={attMonth} onMonthChange={setAttMonth}
        />
      )}
      {activeTab === "leave" && (
        <LeaveReport
          data={leaveData} loading={leaveLoad}
          year={leaveYear} onYearChange={setLeaveYear}
        />
      )}
      {activeTab === "headcount" && (
        <HeadcountReport data={hcData} loading={hcLoad} />
      )}
      {activeTab === "trend" && (
        <MonthlyChart data={chartData} loading={chartLoad} />
      )}
    </div>
  );
}

// ── Mount the component ─────────────────
const container = document.getElementById('reportsPage');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <AuthProvider>
        <Reports />
      </AuthProvider>
    </BrowserRouter>
  );
}