import React, { useState } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../component/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset link requested for:', email);
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <Link to="/login" className="back-link">
          <ChevronLeft className="w-5 h-5" />
          Back to Login
        </Link>
        <h1 className="auth-title">Reset Password</h1>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <p className="text-muted-foreground mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="form-group">
            <label className="form-label">Email address *</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth">
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="link-red mt-6 bg-transparent"
          >
            Try another email address
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
