import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";
 
// ── Helper: get initials from name ────────────────────────────
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
 
// ── Reusable input field ──────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          "w-full border rounded-lg px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled
            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
            : "bg-white border-gray-200",
        ].join(" ")}
      />
    </div>
  );
}
 
// ── Alert: success or error message ──────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error:   "bg-red-50   border-red-200   text-red-700",
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
 
// ── Tab 1: Profile Info (read-only view) ──────────────────────
function ProfileInfo({ user }) {
  const fields = [
    { label: "Full name",   value: user?.name  },
    { label: "Email",       value: user?.email },
    { label: "Role",        value: user?.role  },
    { label: "Member since", value: user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-MY", {
            year: "numeric", month: "long", day: "numeric",
          })
        : "—"
    },
  ];
 
  return (
    <div className="space-y-4">
      {fields.map(({ label, value }) => (
        <div key={label} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
          <span className="text-sm text-gray-900 font-medium">{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}
 
// ── Tab 2: Edit Profile ───────────────────────────────────────
function EditProfile({ user, onUserUpdate }) {
  const [name,    setName]    = useState(user?.name  || "");
  const [email,   setEmail]   = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
 
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
 
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        // Laravel validation errors come as { errors: { name: [...], email: [...] } }
        const firstError = data.errors
          ? Object.values(data.errors).flat()[0]
          : data.message;
        setError(firstError || "Update failed.");
        return;
      }
 
      // Update the global AuthContext so Sidebar reflects the new name
      onUserUpdate(data.user);
      setSuccess("Profile updated successfully!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="success" message={success} />
      <Alert type="error"   message={error}   />
 
      <Field
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your full name"
      />
      <Field
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
      />
      {/* Role is not editable — only admins should change this */}
      <Field
        label="Role"
        value={user?.role || ""}
        disabled
      />
      <p className="text-xs text-gray-400">
        Role can only be changed by an administrator.
      </p>
 
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
 
// ── Tab 3: Change Password ────────────────────────────────────
function ChangePassword() {
  const [current,  setCurrent]  = useState("");
  const [newPass,  setNewPass]  = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
 
  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

 
    // Client-side validation before hitting the server
    if (newPass.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPass !== confirm) {
      setError("New passwords do not match.");
      return;
    }
 
    setLoading(true);
 
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: current,
          password: newPass,
          password_confirmation: confirm,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        const firstError = data.errors
          ? Object.values(data.errors).flat()[0]
          : data.message;
        setError(firstError || "Password change failed.");
        return;
      }
 
      setSuccess("Password changed successfully!");
      // Clear the form
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="success" message={success} />
      <Alert type="error"   message={error}   />
 
      <Field
        label="Current password"
        type="password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Enter current password"
      />
      <Field
        label="New password"
        type="password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        placeholder="At least 8 characters"
      />
      <Field
        label="Confirm new password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Repeat new password"
      />
 
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
 
// ── Main Profile page ─────────────────────────────────────────
export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const { user } = useAuth();

  function handleUserUpdate(updatedUser) {
    console.log("User updated:", updatedUser);
  };

  const tabs = [
    { key: "info",     label: "Profile info"   },
    { key: "edit",     label: "Edit profile"   },
    { key: "password", label: "Change password" },
  ];
 
  return (
    <div className="p-8 max-w-2xl">
 
      {/* Back button */}
      <button
        onClick={() => back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
 
      {/* Profile header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-medium text-blue-700 flex-shrink-0">
          {getInitials(user?.name)}
        </div>
 
        {/* Name + email + role badge */}
        <div>
          <h1 className="text-lg font-medium text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-400">{user?.email}</p>
          {user?.role && (
            <span className="inline-block mt-1 text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          )}
        </div>
      </div>
 
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              "text-sm px-4 py-1.5 rounded-md transition-all",
              activeTab === tab.key
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
 
      {/* Tab content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === "info"     && <ProfileInfo     user={user} />}
        {activeTab === "edit"     && <EditProfile     user={user} onUserUpdate={handleUserUpdate} />}
        {activeTab === "password" && <ChangePassword />}
      </div>

    </div>
    );
}

// Mount the component when the container exists
if (document.getElementById('userProfile')) {
  const container = document.getElementById('userProfile');
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <Profile />
    </AuthProvider>
  );
}