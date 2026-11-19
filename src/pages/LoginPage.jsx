import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock, Mail, ArrowRight, AlertCircle,
  Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import '../styles/LoginPage.css';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        setError('Access Denied: Only authorized VoPro staff can enter the Administration Area.');
        setLoading(false);
        return;
      }
      navigate('/admin/companies');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid staff credentials.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError(null);
    try {
      await api.post('/auth/forgot-password', { email: fpEmail });
      setView('sent');
    } catch (err) {
      setFpError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      <div className="login-ambient-orb-1" />
      <div className="login-ambient-orb-2" />

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-card-header">
            <img src="/vopro-logo.webp" alt="VoPro Solutions" className="login-card-logo" />
            <h1 className="login-main-title">
              VoPro <span>Administration Area</span>
            </h1>
          </div>

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <>
              {error && (
                <div className="login-error-banner">
                  <AlertCircle size={18} /><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-form-group">
                  <label className="login-form-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <Mail size={18} className="login-input-icon" />
                    <input
                      type="email" className="form-input login-input-padded"
                      required placeholder="admin@vopro.co.uk"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label className="login-form-label">Password</label>
                  <div className="login-input-wrapper">
                    <Lock size={18} className="login-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input login-input-padded"
                      required placeholder="••••••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="login-pwd-toggle"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-helpers-row">
                  <label className="login-remember-container">
                    <input type="checkbox" checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)} />
                    <span>Remember this workstation</span>
                  </label>
                  <button type="button" className="login-forgot-link"
                    onClick={() => { setView('forgot'); setError(null); }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                  {loading
                    ? <><Loader2 size={18} className="spin-icon" /><span>Signing in...</span></>
                    : <><span>Sign In</span><ArrowRight size={18} /></>
                  }
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <>
              <div className="login-fp-heading">Reset Password</div>
              <p className="login-fp-sub">Enter your email and we'll send you a reset link.</p>

              {fpError && (
                <div className="login-error-banner">
                  <AlertCircle size={18} /><span>{fpError}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="login-form">
                <div className="login-form-group">
                  <label className="login-form-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <Mail size={18} className="login-input-icon" />
                    <input
                      type="email" className="form-input login-input-padded"
                      required placeholder="admin@vopro.co.uk"
                      value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary login-submit-btn" disabled={fpLoading}>
                  {fpLoading
                    ? <><Loader2 size={18} className="spin-icon" /><span>Sending...</span></>
                    : <><span>Send Reset Link</span><ArrowRight size={18} /></>
                  }
                </button>

                <button type="button" className="login-back-btn"
                  onClick={() => { setView('login'); setFpError(null); setFpEmail(''); }}>
                  <ArrowLeft size={15} /><span>Back to Sign In</span>
                </button>
              </form>
            </>
          )}

          {/* ── EMAIL SENT VIEW ── */}
          {view === 'sent' && (
            <div className="login-sent-box">
              <div className="login-sent-icon">
                <CheckCircle2 size={36} color="#10B981" />
              </div>
              <div className="login-sent-title">Reset Link Sent</div>
              <p className="login-sent-desc">
                If <strong>{fpEmail}</strong> is registered, a password reset link has been sent. Check your inbox.
              </p>
              <button type="button" className="btn btn-primary login-submit-btn"
                onClick={() => { setView('login'); setFpEmail(''); }}>
                <ArrowLeft size={18} /><span>Back to Sign In</span>
              </button>
            </div>
          )}
        </div>

        <div className="login-footer-security">
          <div>VoPro Solutions Ltd • 256-Bit SSL Encrypted Internal Console</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
