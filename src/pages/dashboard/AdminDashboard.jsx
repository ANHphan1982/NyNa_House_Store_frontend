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
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
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

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
              {stats.lowStockProducts > 0 && (
                <span className="px-2 py-1 bg-yellow-500 text-xs font-semibold rounded-full">
                  {stats.lowStockProducts} sắp hết
                </span>
              )}
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
              {stats.pendingOrders > 0 && (
                <span className="px-2 py-1 bg-yellow-500 text-xs font-semibold rounded-full">
                  {stats.pendingOrders} chờ xử lý
                </span>
              )}
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

          {/* Customer Info - NEW */}
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

      {/* Alerts Section */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Orders Alert */}
          {stats.pendingOrders > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Đơn hàng chờ xử lý
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Bạn có <strong>{stats.pendingOrders}</strong> đơn hàng cần xử lý.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/dashboard/manage-orders')}
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                      Xem ngay →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {stats.lowStockProducts > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Sản phẩm sắp hết hàng
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Có <strong>{stats.lowStockProducts}</strong> sản phẩm có số lượng dưới 10.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/dashboard/manage-products')}
                      className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                    >
                      Nhập hàng ngay →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
