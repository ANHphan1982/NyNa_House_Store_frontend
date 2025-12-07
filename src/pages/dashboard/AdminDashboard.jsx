// frontend/src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Plus,
  Edit,
  Eye,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import API_URL from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    orders: [],
    revenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch products
      const productsRes = await fetch(`${API_URL}/api/products`);
      const productsData = await productsRes.json();
      
      // Fetch orders
      const ordersRes = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      // Calculate stats
      const products = productsData.products || [];
      const orders = ordersData.orders || [];
      
      const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'confirmed'
      ).length;

      const lowStockProducts = products.filter(p => p.stock < 10).length;

      // Get unique customers (both user and guest)
      const uniqueCustomers = new Set();
      orders.forEach(order => {
        if (order.userId) {
          uniqueCustomers.add(order.userId.toString());
        } else if (order.guestInfo?.phone) {
          uniqueCustomers.add(order.guestInfo.phone);
        }
      });

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: uniqueCustomers.size,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        lowStockProducts: lowStockProducts
      });

      // Get recent orders (last 5)
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(recent);

      // Prepare chart data (last 7 days)
      prepareChartData(orders);

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (orders) => {
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    // Group orders by date
    const ordersByDate = {};
    const revenueByDate = {};

    last7Days.forEach(date => {
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      ordersByDate[dateStr] = 0;
      revenueByDate[dateStr] = 0;
    });

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      
      // Check if order is in last 7 days
      if (orderDate >= last7Days[0]) {
        const dateStr = orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        
        if (ordersByDate.hasOwnProperty(dateStr)) {
          ordersByDate[dateStr]++;
          
          // Only count revenue for delivered orders
          if (order.status === 'delivered') {
            revenueByDate[dateStr] += order.totalAmount || 0;
          }
        }
      }
    });

    // Prepare data for charts
    const ordersChartData = Object.keys(ordersByDate).map(date => ({
      date,
      orders: ordersByDate[date]
    }));

    const revenueChartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: Math.round(revenueByDate[date] / 1000) // Convert to thousands for better display
    }));

    setChartData({
      orders: ordersChartData,
      revenue: revenueChartData
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Tổng Quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.</p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Clock size={18} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Package size={24} />
              </div>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng sản phẩm</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp size={16} />
              <span className="text-blue-100">Trong kho</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <ShoppingCart size={24} />
              </div>
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium">Tổng đơn hàng</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight size={16} />
              <span className="text-purple-100">Tất cả thời gian</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Users size={24} />
              </div>
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium">Tổng khách hàng</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <UserPlus size={16} />
              <span className="text-green-100">User + Guest</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg p-6 text-white">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>
            <div>
              <p className="text-rose-100 text-sm font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp size={16} />
              <span className="text-rose-100">Đơn đã giao</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Add Product */}
          <button
            onClick={() => navigate('/dashboard/products/add')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Thêm sản phẩm</p>
              <p className="text-sm text-gray-600">Tạo sản phẩm mới</p>
            </div>
          </button>

          {/* Manage Products */}
          <button
            onClick={() => navigate('/dashboard/manage-products')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-purple-600 text-white rounded-lg group-hover:bg-purple-700 transition-colors">
              <Edit size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Quản lý sản phẩm</p>
              <p className="text-sm text-gray-600">Sửa, xóa sản phẩm</p>
            </div>
          </button>

          {/* Manage Orders */}
          <button
            onClick={() => navigate('/dashboard/manage-orders')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-green-600 text-white rounded-lg group-hover:bg-green-700 transition-colors">
              <Eye size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Quản lý đơn hàng</p>
              <p className="text-sm text-gray-600">Xem, cập nhật đơn</p>
            </div>
          </button>

          {/* Customer Info */}
          <button
            onClick={() => navigate('/dashboard/customers')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="p-3 bg-rose-600 text-white rounded-lg group-hover:bg-rose-700 transition-colors">
              <Users size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Thông tin khách hàng</p>
              <p className="text-sm text-gray-600">Xem danh sách KH</p>
            </div>
          </button>
        </div>
      </div>

      {/* Charts Section - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Đơn hàng 7 ngày qua</h2>
              <p className="text-sm text-gray-600 mt-1">Số lượng đơn hàng theo ngày</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCart size={24} className="text-purple-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.orders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="orders" 
                fill="#9333ea" 
                radius={[8, 8, 0, 0]}
                name="Đơn hàng"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Doanh thu 7 ngày qua</h2>
              <p className="text-sm text-gray-600 mt-1">Doanh thu theo ngày (nghìn đồng)</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <DollarSign size={24} className="text-rose-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                formatter={(value) => [`${value}k VNĐ`, 'Doanh thu']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f43f5e" 
                strokeWidth={3}
                dot={{ fill: '#f43f5e', r: 5 }}
                activeDot={{ r: 7 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
          <button
            onClick={() => navigate('/dashboard/manage-orders')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Xem tất cả
            <ArrowUpRight size={16} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber || order._id.slice(-6)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.orderType === 'user' 
                          ? order.userId?.name || 'User'
                          : order.guestInfo?.name || 'Guest'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.orderType === 'user' 
                          ? order.userId?.phone || order.shippingAddress?.phone
                          : order.guestInfo?.phone
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;