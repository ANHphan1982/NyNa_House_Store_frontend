import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({children}) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    // Nếu chưa đăng nhập, redirect về admin login
    return <Navigate to="/admin" />;
  }

  // Kiểm tra role
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      // Nếu không phải admin, redirect về home
      alert('Bạn không có quyền truy cập trang này!');
      return <Navigate to="/" />;
    }
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;