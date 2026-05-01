import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
