// frontend/src/pages/user/UserOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  AlertCircle 
} from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const UserOrders = () => {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  
  // 🔥 HOOKS PHẢI Ở TRÊN CÙNG
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // 🔥 useEffect PHẢI Ở TRÊN - TRƯỚC early return
  useEffect(() => {
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
        navigate('/login');
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
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Orders response:', data);

      if (data.success) {
        setOrders(data.orders || []);
        console.log('✅ Orders loaded:', data.orders?.length || 0);
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

  const cancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Hủy đơn hàng thành công!');
        fetchOrders(); // Reload orders
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert('Không thể hủy đơn hàng');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        icon: Clock,
        text: 'Chờ xác nhận',
        color: 'text-yellow-600 bg-yellow-100'
      },
      confirmed: {
        icon: CheckCircle,
        text: 'Đã xác nhận',
        color: 'text-blue-600 bg-blue-100'
      },
      shipping: {
        icon: Truck,
        text: 'Đang giao',
        color: 'text-purple-600 bg-purple-100'
      },
      delivered: {
        icon: CheckCircle,
        text: 'Đã giao',
        color: 'text-green-600 bg-green-100'
      },
      cancelled: {
        icon: XCircle,
        text: 'Đã hủy',
        color: 'text-red-600 bg-red-100'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  // 🔥 BÂY GIỜ MỚI CHECK early return
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem đơn hàng.</p>
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

  // Filter orders
  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Quay lại Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif">Đơn hàng của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tổng: {orders.length} đơn hàng
            </p>
          </div>

          {/* Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-sm text-red-700 hover:text-red-800 underline mt-1"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {selectedFilter === 'all' ? 'Chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng'}
            </h2>
            <p className="text-gray-500 mb-6">
              {selectedFilter === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                : 'Không có đơn hàng nào với trạng thái này.'
              }
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag size={20} />
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const canCancel = ['pending', 'confirmed'].includes(order.status);

              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Mã đơn hàng</p>
                      <p className="font-mono font-semibold">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt</p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                        <StatusIcon size={16} />
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.size && (
                            <p className="text-sm text-gray-500">Size: {item.size}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Tổng tiền</p>
                      <p className="text-xl font-bold text-rose-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {canCancel && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => navigate('/')}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Mua lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Debug Info - Development only */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">User: {currentUser?.name}</p>
            <p className="text-gray-600">Total Orders: {orders.length}</p>
            <p className="text-gray-600">Filtered: {filteredOrders.length}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;