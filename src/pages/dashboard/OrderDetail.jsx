// frontend/src/pages/dashboard/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';
import API_URL from '../../utils/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('🔍 Fetching order from:', `${API_URL}/api/orders/${id}`);

      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: 'GET',  // ✅ CORRECT: Use POST
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📦 Order detail:', data);

      if (data.success) {
        setOrder(data.order);
      } else {
        alert('Không tìm thấy đơn hàng');
        navigate('/dashboard/manage-orders');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      alert('Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!confirm(`Xác nhận cập nhật trạng thái thành "${getStatusLabel(newStatus)}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        alert('Cập nhật trạng thái thành công!');
        fetchOrderDetail();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
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

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
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
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={18} />
        {config.label}
      </span>
    );
  };

  const getAvailableActions = (currentStatus) => {
    const actions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipping', 'cancelled'],
      shipping: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return actions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate('/dashboard/manage-orders')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/dashboard/manage-orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Quay lại danh sách đơn hàng</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Đơn hàng #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Sản phẩm đã đặt
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Địa chỉ giao hàng
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>{order.shippingAddress?.phone}</span>
                </div>
                {order.shippingAddress?.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span>{order.shippingAddress?.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 mt-3">
                  <MapPin size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p>{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.ward}, {order.shippingAddress?.district}</p>
                    <p>{order.shippingAddress?.city}</p>
                  </div>
                </div>
                {order.note && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Ghi chú:</p>
                    <p className="text-sm text-gray-600">{order.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tổng quan đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{formatPrice(order.shippingFee)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">Tổng cộng:</span>
                  <span className="font-bold text-rose-600 text-lg">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <CreditCard size={18} />
                  <span className="text-sm">Phương thức thanh toán:</span>
                </div>
                <p className="font-medium text-gray-900 mt-1">{order.paymentMethod}</p>
                {order.isPaid && (
                  <p className="text-sm text-green-600 mt-1">✓ Đã thanh toán</p>
                )}
              </div>
            </div>

            {/* Actions */}
            {getAvailableActions(order.status).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h2>
                <div className="space-y-2">
                  {getAvailableActions(order.status).map((action) => (
                    <button
                      key={action}
                      onClick={() => updateOrderStatus(action)}
                      disabled={updating}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                        action === 'cancelled'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-rose-600 text-white hover:bg-rose-700'
                      } disabled:opacity-50`}
                    >
                      {updating ? 'Đang cập nhật...' : `Chuyển sang: ${getStatusLabel(action)}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;