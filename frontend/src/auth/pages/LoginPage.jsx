import React, { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../component/AuthLayout';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${GATEWAY_URL}/auth/login`, formData);
      const { token, role } = response.data;
      
      const user = { name: formData.email.split('@')[0], email: formData.email, role: role };
      login(user, token);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <Link to="/" className="back-link">
          <ChevronLeft size={18} />
          Back to Store
        </Link>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to your account to continue</p>
      </div>

      {error && (
        <div className="error-badge">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="form-input-wrapper">
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="form-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <input type="checkbox" id="remember" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
          <label htmlFor="remember" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Keep me logged in</label>
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
              Authenticating...
            </div>
          ) : 'Log In to Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            New to SchoolSupply?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
