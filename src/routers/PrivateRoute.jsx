import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  return children ? children : <Outlet />;
};

export default PrivateRoute;