// src/pages/user/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { User, Package, ShoppingBag, Heart, Settings, CreditCard } from 'lucide-react';
import { formatPrice } from '../../data/mockData';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, cart } = useOutletContext();
  
  // 🔥 HOOKS PHẢI Ở TRÊN CÙNG - TRƯỚC BẤT KỲ RETURN NÀO
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0
  });

  // 🔥 useEffect PHẢI Ở TRÊN - TRƯỚC early return
  useEffect(() => {
    // Chỉ fetch khi có currentUser
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  // 🔥 BẰNG SAU MỚI CHECK early return
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem trang này.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/orders/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        const userOrders = data.orders || [];
        setOrders(userOrders);
        
        // Calculate stats
        const totalSpent = userOrders.reduce((sum, order) => 
          order.status !== 'cancelled' ? sum + order.totalAmount : sum, 0
        );
        
        setStats({
          totalOrders: userOrders.length,
          totalSpent: totalSpent
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const menuItems = [
    {
      icon: Package,
      title: 'Đơn hàng của tôi',
      description: 'Xem lịch sử và theo dõi đơn hàng',
      link: '/user/orders',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: ShoppingBag,
      title: 'Giỏ hàng',
      description: `${cart?.length || 0} sản phẩm trong giỏ`,
      link: '/cart',
      color: 'bg-amber-100 text-amber-600'
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-600">Đơn hàng</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{cart?.length || 0}</p>
            <p className="text-sm text-gray-600">Giỏ hàng</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Yêu thích</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-xl font-bold text-rose-600">{formatPrice(stats.totalSpent)}</p>
            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`p-4 rounded-full ${item.color}`}>
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
          {orders.length === 0 ? (
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
                    <p className="font-medium">Đơn #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">{order.status}</p>
                  </div>
                </Link>
              ))}
              <Link
                to="/user/orders"
                className="block text-center text-rose-600 hover:text-rose-700 text-sm pt-3 border-t"
              >
                Xem tất cả →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;