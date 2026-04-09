// ============================================================
//  pages/ForgotPassword.jsx — Password reset request page
//
//  Standalone full-page (no sidebar), same aesthetic as login.
//  Features:
//  - Email input with submit
//  - Success / error messages
//  - "Back to login" link
//  - POST /api/forgot-password
// ============================================================

import { useState } from "react";
import { createRoot } from "react-dom/client";

// ── Styles (matching login page) ──────────────────────────────
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
    lineHeight: '1.5',
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
    marginBottom: 24,
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
  backLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    fontSize: 14,
    color: '#60a5fa',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  alert: (type) => ({
    background: type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
    border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: type === 'success' ? '#86efac' : '#fca5a5',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    lineHeight: '1.5',
  }),
};

// ── Keyframe animation (injected once) ────────────────────────
if (!document.getElementById('login-animations')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'login-animations';
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
  document.head.appendChild(styleTag);
}

// ── Component ─────────────────────────────────────────────────
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSuccess(data.message || 'If an account exists with this email, a password reset link has been sent.');
      setEmail('');
    } catch {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={{ ...styles.card, animation: 'fadeInUp 0.6s ease-out' }}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>EMS</span>
        </div>

        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.subtitle}>
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>

        {/* Success */}
        {success && (
          <div style={styles.alert('success')}>
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.alert('error')}>
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            <span style={styles.inputIcon}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
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
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {/* Back to login */}
        <a
          href="/login-page"
          style={styles.backLink}
          onMouseOver={(e) => (e.currentTarget.style.color = '#93c5fd')}
          onMouseOut={(e) => (e.currentTarget.style.color = '#60a5fa')}
        >
          <svg style={{ width: 16, height: 16 }} viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to login
        </a>
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const container = document.getElementById('forgotPasswordPage');
if (container) {
  const root = createRoot(container);
  root.render(<ForgotPassword />);
}
