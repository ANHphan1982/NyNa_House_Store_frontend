// src/pages/user/UserOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { Package, ArrowLeft, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { formatPrice } from '../../data/mockData';

const UserOrders = () => {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  
  // 🔥 HOOKS PHẢI Ở TRÊN CÙNG
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 useEffect PHẢI Ở TRÊN - TRƯỚC early return
  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // 🔥 BÂY GIỜ MỚI CHECK early return
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem đơn hàng.</p>
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
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('🔄 Fetching orders...');

      const response = await fetch('http://localhost:5000/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📦 Orders response:', data);

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif">Đơn hàng của tôi</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tổng: {orders.length} đơn hàng
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
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
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Mã đơn hàng</p>
                      <p className="font-mono font-semibold">#{order._id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt</p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
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
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => navigate('/')}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
      </div>
    </div>
  );
};

export default UserOrders;