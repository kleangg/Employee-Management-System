// ============================================================
//  pages/Leave.jsx
//
//  Full leave management page for employees. Has 3 sections:
//
//  1. Leave Balance   — shows remaining days per leave type
//  2. Apply for Leave — form to submit a new leave request
//  3. Leave History   — table of past/pending requests
//                       with ability to cancel pending ones
//
//  Data flow:
//  - On mount: fetch balance + history from Laravel API
//  - On submit: POST /api/leave → refresh both
//  - On cancel: DELETE /api/leave/{id} → refresh both
// ============================================================
 
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
 
const USE_MOCK = window.location.search.includes("mockLeave=true");
const mockLeaveData = {
  balance: {
    annual: 12,
    medical: 4,
    emergency: 1,
    unpaid: 0,
  },
  history: [
    {
      id: 1,
      type: "annual",
      start_date: "2026-04-10",
      end_date: "2026-04-12",
      days: 3,
      reason: "Family event",
      status: "approved",
    },
    {
      id: 2,
      type: "medical",
      start_date: "2026-04-20",
      end_date: "2026-04-21",
      days: 2,
      reason: "Doctor appointment",
      status: "pending",
    },
    {
      id: 3,
      type: "emergency",
      start_date: "2026-05-02",
      end_date: "2026-05-02",
      days: 1,
      reason: "Urgent errand",
      status: "rejected",
    },
  ],
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMockResponse(data, ok = true) {
  return { ok, json: async () => data };
}

async function mockFetch(path, options = {}) {
  await delay(250);

  if (path === "/api/leave/balance") {
    return getMockResponse(mockLeaveData.balance);
  }

  if (path === "/api/leave") {
    if (options.method === "POST") {
      const body = JSON.parse(options.body || "{}");
      const record = {
        id: Date.now(),
        type: body.type || "annual",
        start_date: body.start_date,
        end_date: body.end_date,
        days: countDays(body.start_date, body.end_date),
        reason: body.reason || "No reason provided",
        status: "pending",
      };
      mockLeaveData.history.unshift(record);
      return getMockResponse({ message: "Leave request submitted." });
    }

    return getMockResponse(mockLeaveData.history);
  }

  if (path.startsWith("/api/leave/")) {
    const id = Number(path.split("/").pop());
    const record = mockLeaveData.history.find((item) => item.id === id);
    if (record) {
      record.status = "cancelled";
      return getMockResponse({ message: "Leave request cancelled." });
    }
    return getMockResponse({ message: "Not found." }, false);
  }

  return getMockResponse({ message: "Unknown mock path." }, false);
}
 
// ── Helpers ───────────────────────────────────────────────────
 
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });
}
 
function countDays(from, to) {
  if (!from || !to) return 0;
  return Math.floor((new Date(to) - new Date(from)) / 86400000) + 1;
}
 
function today() {
  return new Date().toISOString().split("T")[0];
}
 
// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    pending:   "bg-amber-50  text-amber-700  border border-amber-200",
    approved:  "bg-green-50  text-green-700  border border-green-200",
    rejected:  "bg-red-50    text-red-700    border border-red-200",
    cancelled: "bg-gray-100  text-gray-500   border border-gray-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
 
// ── Leave Balance Cards ───────────────────────────────────────
function BalanceCards({ balance, loading }) {
  const types = [
    { label: "Annual leave",    key: "annual",    color: "bg-blue-50  text-blue-700  border-blue-100"  },
    { label: "Medical leave",   key: "medical",   color: "bg-teal-50  text-teal-700  border-teal-100"  },
    { label: "Emergency leave", key: "emergency", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "Unpaid leave",    key: "unpaid",    color: "bg-gray-50  text-gray-600  border-gray-200"  },
  ];
 
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {types.map(t => (
          <div key={t.key} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }
 
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {types.map(({ label, key, color }) => (
        <div key={key} className={`border rounded-xl p-4 ${color}`}>
          <p className="text-xs font-medium mb-2 opacity-70">{label}</p>
          <p className="text-2xl font-medium">
            {balance[key] ?? "—"}
            <span className="text-sm font-normal ml-1 opacity-60">days</span>
          </p>
        </div>
      ))}
    </div>
  );
}
 
// ── Apply for Leave Form ──────────────────────────────────────
function ApplyForm({ onSubmitted }) {
  const [type,    setType]    = useState("annual");
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
 
  function handleFromChange(val) {
    setFrom(val);
    if (to && val > to) setTo(val); // auto-correct end date
  }
 
  const days = countDays(from, to);
 
  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
 
    if (!from || !to)      { setError("Please select start and end dates."); return; }
    if (from > to)         { setError("End date must be after start date."); return; }
    if (!reason.trim())    { setError("Please provide a reason."); return; }
 
    setLoading(true);
    try {
      const res = USE_MOCK
        ? await mockFetch("/api/leave", {
            method: "POST",
            body: JSON.stringify({ type, start_date: from, end_date: to, reason }),
          })
        : await fetch("/api/leave", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json",
            },
            body: JSON.stringify({ type, start_date: from, end_date: to, reason }),
          });
 
      const data = await res.json();
 
      if (!res.ok) {
        const firstError = data.errors
          ? Object.values(data.errors).flat()[0]
          : data.message;
        setError(firstError || "Submission failed.");
        return;
      }
 
      setSuccess("Leave request submitted! Waiting for HR approval.");
      setType("annual"); setFrom(""); setTo(""); setReason("");
      onSubmitted(); // refresh balance + history
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-base font-medium text-gray-900 mb-5">Apply for leave</h2>
 
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}
 
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Leave type */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Leave type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="annual">Annual leave</option>
            <option value="medical">Medical leave</option>
            <option value="emergency">Emergency leave</option>
            <option value="unpaid">Unpaid leave</option>
          </select>
        </div>
 
        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start date</label>
            <input
              type="date"
              value={from}
              min={today()}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End date</label>
            <input
              type="date"
              value={to}
              min={from || today()}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
 
        {/* Day count preview */}
        {days > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            {days} day{days > 1 ? "s" : ""} selected
          </p>
        )}
 
        {/* Reason */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Briefly describe the reason for your leave..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
 
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}
 
// ── Leave History Table ───────────────────────────────────────
function LeaveHistory({ history, loading, onCancelled }) {
  const [cancellingId, setCancellingId] = useState(null);
  const records = Array.isArray(history) ? history : [];
 
  async function handleCancel(id) {
    if (!window.confirm("Cancel this leave request?")) return;
    setCancellingId(id);
    try {
      const res = USE_MOCK
        ? await mockFetch(`/api/leave/${id}`, { method: "DELETE" })
        : await fetch(`/api/leave/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json",
            },
          });
      if (res.ok) onCancelled();
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancellingId(null);
    }
  }
 
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-900">Leave history</h2>
        <span className="text-xs text-gray-400">{records.length} record{records.length !== 1 ? "s" : ""}</span>
      </div>
 
      {loading ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">Loading...</div>
      ) : records.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No leave requests yet.</p>
          <p className="text-xs text-gray-300 mt-1">Requests you submit will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Type", "From", "To", "Days", "Reason", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 capitalize whitespace-nowrap">
                    {row.type}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(row.start_date)}</td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(row.end_date)}</td>
                  <td className="px-5 py-3 text-gray-500">{row.days}</td>
                  <td className="px-5 py-3 text-gray-400 max-w-[160px] truncate" title={row.reason}>
                    {row.reason}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-3">
                    {row.status === "pending" && (
                      <button
                        onClick={() => handleCancel(row.id)}
                        disabled={cancellingId === row.id}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {cancellingId === row.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
 
// ── Main Leave page ───────────────────────────────────────────
export default function Leave() {
  const user = { name: "Admin User" };
 
  const [balance,        setBalance]        = useState({});
  const [history,        setHistory]        = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
 
  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);
 
  async function fetchBalance() {
    setBalanceLoading(true);
    try {
      const res = USE_MOCK
        ? await mockFetch("/api/leave/balance")
        : await fetch("/api/leave/balance", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json",
            },
          });
      const data = await res.json();
      if (!res.ok || typeof data !== "object") {
        console.error("Balance fetch failed:", data);
        setBalance({});
      } else {
        setBalance(data);
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
      setBalance({});
    } finally {
      setBalanceLoading(false);
    }
  }
 
  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const res = USE_MOCK
        ? await mockFetch("/api/leave")
        : await fetch("/api/leave", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json",
            },
          });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        console.error("History fetch failed:", data);
        setHistory([]);
      } else {
        setHistory(data);
      }
    } catch (err) {
      console.error("History fetch failed:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }
 
  function refresh() {
    fetchBalance();
    fetchHistory();
  }
 
  const firstName = user?.name?.split(" ")[0] || "there";
 
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Leave management</h1>
      <p className="text-sm text-gray-400 mb-4">
        Hi {firstName}, manage your leave requests here.
        {USE_MOCK && (
          <span className="inline-flex ml-3 items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Mock data active
          </span>
        )}
      </p>
      <p className="text-sm text-gray-400 mb-8">Use <code>?mockLeave=true</code> in the URL to enable mocked responses.</p>
 
      <BalanceCards balance={balance} loading={balanceLoading} />
      <ApplyForm onSubmitted={refresh} />
      <LeaveHistory history={history} loading={historyLoading} onCancelled={refresh} />
    </div>
  );
}
 
// Mount the component when the container exists
if (document.getElementById('leavePage')) {
  const container = document.getElementById('leavePage');
  const root = createRoot(container);
  root.render(<Leave />);
}