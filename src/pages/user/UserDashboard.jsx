// frontend/src/pages/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { User, Package, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, cart } = useOutletContext();
  
  // 🔥 HOOKS PHẢI Ở TRÊN CÙNG - TRƯỚC BẤT KỲ RETURN NÀO
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  // 🔥 useEffect PHẢI Ở TRÊN - TRƯỚC early return
  useEffect(() => {
    // Chỉ fetch khi có currentUser
    if (currentUser) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('📄 Fetching user orders from:', API_URL);

      const response = await fetch(`${API_URL}/api/orders/user`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Orders data:', data);
      
      if (data.success) {
        const userOrders = data.orders || [];
        setOrders(userOrders);
        
        // Calculate stats
        const totalSpent = userOrders.reduce((sum, order) => 
          order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0
        );

        const pendingOrders = userOrders.filter(o => 
          o.status === 'pending' || o.status === 'confirmed'
        ).length;

        const completedOrders = userOrders.filter(o => 
          o.status === 'delivered'
        ).length;
        
        setStats({
          totalOrders: userOrders.length,
          totalSpent: totalSpent,
          pendingOrders: pendingOrders,
          completedOrders: completedOrders
        });

        console.log('✅ Orders loaded:', userOrders.length);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/');
  };

  // 🔥 BẰNG SAU MỚI CHECK early return
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem trang này.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Package,
      title: 'Đơn hàng của tôi',
      description: `${stats.totalOrders} đơn hàng`,
      link: '/user/orders',
      color: 'bg-blue-100 text-blue-600',
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null
    },
    {
      icon: ShoppingBag,
      title: 'Giỏ hàng',
      description: `${cart?.length || 0} sản phẩm trong giỏ`,
      link: '/cart',
      color: 'bg-amber-100 text-amber-600',
      badge: cart?.length || 0
    },
    {
      icon: Heart,
      title: 'Yêu thích',
      description: 'Sản phẩm đã lưu',
      link: '/wishlist',
      color: 'bg-rose-100 text-rose-600'
    },
    {
      icon: Settings,
      title: 'Cài đặt tài khoản',
      description: 'Cập nhật thông tin cá nhân',
      link: '/user/settings',
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Xin chào, {currentUser.name}!
                </h1>
                <p className="text-gray-600">
                  {currentUser.email || currentUser.phone}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalOrders}
            </p>
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {loading ? '...' : stats.pendingOrders}
            </p>
            <p className="text-sm text-gray-600">Đang xử lý</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {loading ? '...' : stats.completedOrders}
            </p>
            <p className="text-sm text-gray-600">Hoàn thành</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-xl font-bold text-rose-600">
              {loading ? '...' : formatPrice(stats.totalSpent)}
            </p>
            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow relative"
            >
              <div className={`p-4 rounded-full ${item.color} relative`}>
                <item.icon size={24} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
            {orders.length > 0 && (
              <Link
                to="/user/orders"
                className="text-rose-600 hover:text-rose-700 text-sm font-medium"
              >
                Xem tất cả →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Chưa có đơn hàng nào</p>
              <Link 
                to="/"
                className="text-rose-600 hover:text-rose-700 text-sm mt-2 inline-block"
              >
                Bắt đầu mua sắm →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <Link
                  key={order._id}
                  to={`/user/orders`}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium">Đơn #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className={`text-xs ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'cancelled' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {order.status === 'pending' ? 'Chờ xác nhận' :
                       order.status === 'confirmed' ? 'Đã xác nhận' :
                       order.status === 'shipping' ? 'Đang giao' :
                       order.status === 'delivered' ? 'Hoàn thành' :
                       'Đã hủy'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info - Development only */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">User: {currentUser?.name}</p>
            <p className="text-gray-600">Orders: {orders.length}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;