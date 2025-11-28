// frontend/src/pages/products/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, currentUser, clearCart } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: '',
    paymentMethod: 'COD'
  });

  // Auto-fill user info
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  // Validate cart
  useEffect(() => {
    if (!cart || cart.length === 0) {
      console.log('⚠️ Cart is empty, redirecting...');
    }
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => 
    sum + ((item.price || item.newPrice || 0) * (item.quantity || 1)), 0
  );
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Vui lòng nhập địa chỉ');
      return false;
    }
    if (!formData.ward.trim()) {
      setError('Vui lòng nhập phường/xã');
      return false;
    }
    if (!formData.district.trim()) {
      setError('Vui lòng nhập quận/huyện');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Vui lòng nhập tỉnh/thành phố');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cart
    if (!cart || cart.length === 0) {
      alert('Giỏ hàng trống!');
      navigate('/cart');
      return;
    }

    // Validate user
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đặt hàng!');
      navigate('/login');
      return;
    }

    // Validate form
    setError('');
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('📦 Creating order...');
      console.log('🌐 API URL:', API_URL);
      console.log('👤 User:', currentUser);
      console.log('🛒 Cart items:', cart.length);

      const orderData = {
        items: cart.map(item => ({
          productId: item.id || item.productId,
          name: item.name || item.title,
          price: item.price || item.newPrice,
          quantity: item.quantity || 1,
          image: item.image || item.coverImage,
          size: item.selectedSize
        })),
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          ward: formData.ward.trim(),
          district: formData.district.trim(),
          city: formData.city.trim()
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note.trim(),
        subtotal,
        shippingFee,
        totalAmount
      };

      console.log('📤 Order data:', orderData);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      console.log('🔑 Token exists:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Order created successfully');
        clearCart();
        alert(`Đặt hàng thành công! Mã đơn hàng: #${data.order._id.slice(-8)}`);
        navigate('/user/orders');
      } else {
        throw new Error(data.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      
      if (error.message.includes('token')) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.');
      } else {
        setError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  // Redirect if cart empty
  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Quay lại giỏ hàng</span>
        </button>

        <h1 className="text-2xl md:text-3xl font-serif mb-8">Thanh toán</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0901234567"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="email@example.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ward"
                      required
                      value={formData.ward}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Phường 1"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Quận 1"
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="TP. Hồ Chí Minh"
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Ghi chú về đơn hàng của bạn..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="w-4 h-4 text-rose-600"
                      disabled={loading}
                    />
                    <div className="ml-3 flex items-center gap-3">
                      <CreditCard size={20} />
                      <div>
                        <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>

                {/* Products */}
                <div className="space-y-3 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 flex-1 pr-2">
                        {item.name || item.title} × {item.quantity || 1}
                      </span>
                      <span className="font-medium">
                        {formatPrice((item.price || item.newPrice) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-rose-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt hàng'
                  )}
                </button>

                {subtotal < 500000 && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Debug Info - Development only */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Cart items: {cart.length}</p>
            <p className="text-gray-600">User: {currentUser?.name || 'Not logged in'}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;