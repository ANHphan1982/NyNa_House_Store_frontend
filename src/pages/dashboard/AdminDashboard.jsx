// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Plus, 
  List, 
  LogOut,
  ClipboardList,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import RevenueChart from '../../components/RevenueChart';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    shippingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // 🔥 Fetch Admin Stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // 🔥 Fetch Recent Orders
      const ordersResponse = await fetch('http://localhost:5000/api/orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setRecentOrders(ordersData.orders);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const mainStats = [
    { 
      title: 'Tổng sản phẩm', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Tổng đơn hàng', 
      value: stats.totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-green-500',
      change: '+8%'
    },
    { 
      title: 'Khách hàng', 
      value: stats.totalCustomers, 
      icon: Users, 
      color: 'bg-purple-500',
      change: '+5%'
    },
    { 
      title: 'Doanh thu', 
      value: formatPrice(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-rose-500',
      change: '+15%'
    }
  ];

  const orderStats = [
    { 
      title: 'Chờ xác nhận', 
      value: stats.pendingOrders, 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    },
    { 
      title: 'Đang giao', 
      value: stats.shippingOrders, 
      color: 'bg-purple-100 text-purple-800',
      icon: Truck
    },
    { 
      title: 'Hoàn thành', 
      value: stats.completedOrders, 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    { 
      title: 'Đã hủy', 
      value: stats.cancelledOrders, 
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  ];

  const quickActions = [
    {
      title: 'Thêm Sản Phẩm',
      description: 'Thêm sản phẩm mới vào cửa hàng',
      icon: Plus,
      color: 'bg-rose-500',
      path: '/dashboard/add-product'
    },
    {
      title: 'Quản Lý Sản Phẩm',
      description: 'Xem và chỉnh sửa danh sách sản phẩm',
      icon: List,
      color: 'bg-blue-500',
      path: '/dashboard/manage-products'
    },
    {
      title: 'Quản Lý Đơn Hàng',
      description: 'Xem và xử lý đơn hàng',
      icon: ClipboardList,
      color: 'bg-green-500',
      path: '/dashboard/manage-orders'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              {stat.change && (
                <div className="flex items-center text-sm">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">{stat.change}</span>
                  <span className="text-gray-500 ml-1">so với tháng trước</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {orderStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <action.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <RevenueChart stats={stats} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
            <button
              onClick={() => navigate('/dashboard/manage-orders')}
              className="text-rose-600 hover:text-rose-700 text-sm font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.shippingAddress?.fullName}
                          </div>
                          <div className="text-gray-500">
                            {order.shippingAddress?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                          className="text-rose-600 hover:text-rose-900 font-medium"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
