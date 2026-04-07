// ============================================================
//  pages/Leave.jsx  (v2 — role-based view)
//
//  HOW ROLE-BASED VIEW WORKS:
//  This single file exports one component — Leave.
//  Inside, it checks user.role from AuthContext.
//  If role === "HR Admin" → renders <AdminLeaveView>
//  Otherwise             → renders <EmployeeLeaveView>
//
// to check the mock data of employee leave view, add ?mock=true to the URL (e.g. http://localhost:8000/leave?mock=true)
//  This means no extra route or page needed — the same
//  /leave URL shows different UI based on who is logged in.
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import { createRoot } from 'react-dom/client';
import { AuthProvider } from "../AuthContext";

// ── Shared helpers ────────────────────────────────────────────

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function countDays(from, to) {
  if (!from || !to) return 0;
  return Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);
}

// ── Shared UI pieces ──────────────────────────────────────────

function StatusBadge({ status }) {
  const s = {
    pending:  "bg-amber-50 text-amber-700 border border-amber-200",
    approved: "bg-green-50 text-green-700 border border-green-200",
    rejected: "bg-red-50   text-red-700   border border-red-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${s[status] || s.pending}`}>
      {status}
    </span>
  );
}

function Alert({ type, message, onClose }) {
  if (!message) return null;
  const s = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50   border-red-200   text-red-800",
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-3 mb-4 ${s[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
    </div>
  );
}

// ── Approve / Reject modal ────────────────────────────────────
// Shown when admin clicks Approve or Reject on a row.
// Sends PUT /api/admin/leave/{id} with the decision + note.
function ReviewModal({ leave, onClose, onDone }) {
  const [action, setAction] = useState("approved"); // "approved" | "rejected"
  const [note,   setNote]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/leave/${leave.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: action, note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed."); return; }
      onDone(`Leave request ${action} successfully.`);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // Overlay — faux modal using normal flow so height is correct
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">Review leave request</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {leave.user_name} · {leave.type} leave · {countDays(leave.start_date, leave.end_date)} day(s)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Leave details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <div className="flex gap-3">
            <span className="text-gray-400 w-20">Dates</span>
            <span className="text-gray-800">{formatDate(leave.start_date)} → {formatDate(leave.end_date)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 w-20">Reason</span>
            <span className="text-gray-800">{leave.reason}</span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Decision toggle */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Decision</label>
            <div className="flex gap-2">
              {["approved", "rejected"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={[
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                    action === a && a === "approved"
                      ? "bg-green-50 border-green-400 text-green-700"
                      : action === a && a === "rejected"
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {a === "approved" ? "✓ Approve" : "✕ Reject"}
                </button>
              ))}
            </div>
          </div>

          {/* Note to employee */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Note to employee <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={action === "approved" ? "e.g. Approved. Enjoy your leave!" : "e.g. Insufficient staffing during this period."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={[
                "flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60",
                action === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600",
              ].join(" ")}
            >
              {loading ? "Saving..." : `Confirm ${action}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Employee balance card (used in admin view) ─────────────────
function EmployeeBalanceCard({ balance }) {
  if (!balance) return null;
  const types = [
    { key: "annual",    label: "Annual",    total: 14, color: "text-blue-600"  },
    { key: "medical",   label: "Medical",   total: 14, color: "text-teal-600"  },
    { key: "emergency", label: "Emergency", total: 3,  color: "text-amber-600" },
  ];
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
      <p className="text-xs font-medium text-blue-700 mb-2">Leave balance for {balance.name}</p>
      <div className="flex gap-4">
        {types.map(({ key, label, total, color }) => {
          const used = balance[key] ?? 0;
          return (
            <div key={key} className="text-center">
              <p className={`text-base font-medium ${color}`}>{total - used}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ADMIN VIEW ────────────────────────────────────────────────
// Shown when user.role === "HR Admin"
function AdminLeaveView() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [success,  setSuccess]  = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [filterName,   setFilterName]   = useState("");

  // Review modal state
  const [modalLeave, setModalLeave] = useState(null);

  // Employee balance panel (shown when clicking on a row)
  const [balanceData, setBalanceData] = useState(null);
  const [balanceId,   setBalanceId]   = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/leave", { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load leave requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBalance(userId, userName) {
    // Toggle off if already showing this user
    if (balanceId === userId) { setBalanceId(null); setBalanceData(null); return; }
    try {
      const res  = await fetch(`/api/admin/leave/balance/${userId}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBalanceData({ ...data, name: userName });
      setBalanceId(userId);
    } catch {
      console.error("Failed to load balance");
      setBalanceData(null);
      setBalanceId(null);
    }
  }

  function handleDone(msg) {
    setSuccess(msg);
    setBalanceId(null);
    setBalanceData(null);
    fetchRequests();
  }

  // Apply filters
  const filtered = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterType   !== "all" && r.type   !== filterType)   return false;
    if (filterName && !r.user_name.toLowerCase().includes(filterName.toLowerCase())) return false;
    return true;
  });

  // Summary counts
  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-medium text-gray-900">Leave requests</h1>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
          HR Admin view
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-6">Review and manage employee leave applications.</p>

      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending review", value: pending,  color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved",       value: approved, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected",       value: rejected, color: "text-red-500",   bg: "bg-red-50"   },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-100 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search by name */}
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Search employee..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />

        {/* Filter by status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Filter by leave type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All types</option>
          <option value="annual">Annual</option>
          <option value="medical">Medical</option>
          <option value="emergency">Emergency</option>
        </select>

        {/* Reset filters */}
        {(filterStatus !== "all" || filterType !== "all" || filterName) && (
          <button
            onClick={() => { setFilterStatus("all"); setFilterType("all"); setFilterName(""); }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Requests table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Employee", "Type", "From", "To", "Days", "Reason", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <>
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      {/* Employee name — click to toggle balance */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchBalance(r.user_id, r.user_name)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                          title="View leave balance"
                        >
                          {r.user_name}
                        </button>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">{r.type}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.start_date)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.end_date)}</td>
                      <td className="px-4 py-3 text-gray-600">{countDays(r.start_date, r.end_date)}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs">
                        <span className="line-clamp-2">{r.reason}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {/* Only show action buttons for pending requests */}
                        {r.status === "pending" ? (
                          <button
                            onClick={() => setModalLeave(r)}
                            className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Balance row — expands under the employee's row */}
                    {balanceId === r.user_id && (
                      <tr key={`bal-${r.user_id}`}>
                        <td colSpan={8} className="px-4 pb-3 pt-0">
                          <EmployeeBalanceCard balance={balanceData} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      {modalLeave && (
        <ReviewModal
          leave={modalLeave}
          onClose={() => setModalLeave(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}

// ── EMPLOYEE VIEW ─────────────────────────────────────────────
// (same as before — included here for completeness)
function BalanceCards({ balance, loading }) {
  const types = [
    { key: "annual",    label: "Annual leave",    total: 14, bar: "bg-blue-500",  pill: "bg-blue-50 text-blue-800",  num: "text-blue-700"  },
    { key: "medical",   label: "Medical leave",   total: 14, bar: "bg-teal-500",  pill: "bg-teal-50 text-teal-800",  num: "text-teal-700"  },
    { key: "emergency", label: "Emergency leave", total: 3,  bar: "bg-amber-500", pill: "bg-amber-50 text-amber-800", num: "text-amber-700" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {types.map(({ key, label, total, bar, pill, num }) => {
        const used      = loading ? 0 : (balance[key] ?? 0);
        const remaining = total - used;
        const pct       = Math.round((remaining / total) * 100);
        return (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pill}`}>
                {loading ? "—" : `${remaining} left`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className={`h-full rounded-full ${bar}`} style={{ width: loading ? "0%" : `${pct}%` }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-medium ${num}`}>{loading ? "—" : remaining}</span>
              <span className="text-xs text-gray-400">/ {total} days</span>
            </div>
            {!loading && used > 0 && (
              <p className="text-xs text-gray-400 mt-1">{used} day{used > 1 ? "s" : ""} used</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ApplyForm({ onSuccess }) {
  const [type,    setType]    = useState("annual");
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const days = countDays(from, to);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (new Date(to) < new Date(from)) { setError("End date cannot be before start date."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ type, start_date: from, end_date: to, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors ? Object.values(data.errors).flat()[0] : data.message);
        return;
      }
      setType("annual"); setFrom(""); setTo(""); setReason("");
      onSuccess("Leave request submitted successfully!");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <h2 className="text-base font-medium text-gray-900 mb-5">Apply for leave</h2>
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Leave type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="annual">Annual leave</option>
            <option value="medical">Medical leave</option>
            <option value="emergency">Emergency leave</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start date</label>
            <input type="date" value={from} min={today} onChange={(e) => setFrom(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End date</label>
            <input type="date" value={to} min={from || today} onChange={(e) => setTo(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
        {from && to && <p className="text-sm text-blue-600 font-medium">{days} day{days > 1 ? "s" : ""} selected</p>}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3}
            placeholder="Briefly describe the reason for your leave..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
        </div>
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
          {loading ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}

function LeaveHistory({ records, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-900">My leave history</h2>
      </div>
      {loading ? (
        <div className="p-6 text-sm text-gray-400">Loading...</div>
      ) : records.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-gray-400">No leave requests yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Type","From","To","Days","Reason","Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 capitalize font-medium text-gray-800">{r.type}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(r.start_date)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(r.end_date)}</td>
                  <td className="px-6 py-4 text-gray-600">{countDays(r.start_date, r.end_date)}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{r.reason}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmployeeLeaveView() {
  const { user }   = useAuth();
  const [balance,  setBalance]    = useState({});
  const [records,  setRecords]    = useState([]);
  const [balLoad,  setBalLoad]    = useState(true);
  const [recLoad,  setRecLoad]    = useState(true);
  const [success,  setSuccess]    = useState("");

  useEffect(() => { fetchBalance(); fetchHistory(); }, []);

  async function fetchBalance() {
    setBalLoad(true);
    try { const r = await fetch("/api/leave/balance", { headers: authHeaders() }); setBalance(await r.json()); }
    catch {} finally { setBalLoad(false); }
  }
  async function fetchHistory() {
    setRecLoad(true);
    try { const r = await fetch("/api/leave", { headers: authHeaders() }); setRecords(await r.json()); }
    catch {} finally { setRecLoad(false); }
  }
  function handleSuccess(msg) { setSuccess(msg); fetchBalance(); fetchHistory(); }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Leave management</h1>
      <p className="text-sm text-gray-400 mb-8">
        Welcome, {user?.name?.split(" ")[0]}. Manage your leave requests below.
      </p>
      <Alert type="success" message={success} onClose={() => setSuccess("")} />
      <BalanceCards balance={balance} loading={balLoad} />
      <ApplyForm onSuccess={handleSuccess} />
      <LeaveHistory records={records} loading={recLoad} />
    </div>
  );
}

// ── Main export — switches view based on role ─────────────────
export default function Leave() {
  const { user } = useAuth();

  // Wait for user to load before deciding which view to show
  if (!user) return null;

  // THE KEY LINE: role check decides which view to render
  return user.role === "HR Admin"
    ? <AdminLeaveView />
    : <EmployeeLeaveView />;
}

// ── Mount the component ─────────────────
const container = document.getElementById('leavePage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <Leave />
    </AuthProvider>
  );
}