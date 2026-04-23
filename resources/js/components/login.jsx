// ============================================================
//  pages/Login.jsx — Authentication page
//
//  Standalone full-page login (no sidebar).
//  Features:
//  - Email + password fields with show/hide toggle
//  - "Forgot password?" link
//  - Mock login via POST /api/login
//  - On success, stores token and redirects to /dashboard
//  - Animated gradient background with glassmorphism card
// ============================================================

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "../AuthContext";

// ── SVG Icons ─────────────────────────────────────────────────
const icons = {
  eye: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  eyeOff: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  mail: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Nunito', 'Inter', sans-serif",
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0f172a 60%, #1e3a5f 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    top: -100,
    right: -100,
    animation: 'pulse 8s ease-in-out infinite',
  },
  bgOrb2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    bottom: -80,
    left: -80,
    animation: 'pulse 10s ease-in-out infinite reverse',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    margin: '0 16px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '48px 40px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#f1f5f9',
    fontFamily: "'Nunito', sans-serif",
  },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  forgotLink: {
    display: 'block',
    textAlign: 'right',
    fontSize: 13,
    color: '#60a5fa',
    textDecoration: 'none',
    marginTop: -12,
    marginBottom: 24,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 6px 20px rgba(59,130,246,0.3)',
    fontFamily: "'Nunito', sans-serif",
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: '#fca5a5',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  demoBox: {
    marginTop: 24,
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  },
  demoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: 12,
    color: '#94a3b8',
  },
  demoBadge: (color) => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 6,
    background: color === 'blue' ? 'rgba(59,130,246,0.15)' : color === 'green' ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.15)',
    color: color === 'blue' ? '#60a5fa' : color === 'green' ? '#4ade80' : '#c084fc',
  }),
};

// ── Keyframe animation (injected once) ────────────────────────
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (!document.getElementById('login-animations')) {
  styleTag.id = 'login-animations';
  document.head.appendChild(styleTag);
}

// ── Login Component ───────────────────────────────────────────
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Call the JWT login endpoint served by our Laravel backend.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Backend uses "error" for 401 and an errors object for 422
        const msg = data.error
          || (data.email && data.email[0])
          || (data.password && data.password[0])
          || 'Login failed. Please try again.';
        setError(msg);
        return;
      }

      // Our backend returns { access_token, token_type, expires_in, user }.
      login(data.access_token, data.user);
      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const demoAccounts = [
    { email: 'hr@company.com',        role: 'HR Admin', color: 'blue'   },
    { email: 'manager@company.com',   role: 'Manager',  color: 'green'  },
    { email: 'employee@company.com',  role: 'Employee', color: 'purple' },
  ];

  return (
    <div style={styles.page}>
      {/* Animated background orbs */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      {/* Main card */}
      <div style={{ ...styles.card, animation: 'fadeInUp 0.6s ease-out' }}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>EMS</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your Employee Management System account</p>

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label style={styles.label}>Email address</label>
          <div
            style={styles.inputWrap}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={styles.inputIcon}>{icons.mail}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <label style={styles.label}>Password</label>
          <div
            style={styles.inputWrap}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={styles.inputIcon}>{icons.lock}</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              autoComplete="current-password"
            />
            <button
              type="button"
              style={styles.toggleBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? icons.eyeOff : icons.eye}
            </button>
          </div>

          {/* Forgot password */}
          <a
            href="/forgot-password"
            style={styles.forgotLink}
            onMouseOver={(e) => (e.currentTarget.style.color = '#93c5fd')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#60a5fa')}
          >
            Forgot password?
          </a>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.3)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={styles.demoBox}>
          <p style={styles.demoTitle}>Demo accounts (password: password123)</p>
          {demoAccounts.map((acc) => (
            <div
              key={acc.email}
              style={{ ...styles.demoItem, cursor: 'pointer', borderRadius: 8, padding: '6px 8px', transition: 'background 0.15s' }}
              onClick={() => { setEmail(acc.email); setPassword('password123'); setError(''); }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>{acc.email}</span>
              <span style={styles.demoBadge(acc.color)}>{acc.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('loginPage');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
