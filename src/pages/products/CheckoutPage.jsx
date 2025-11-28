// src/pages/products/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CreditCard, MapPin, User, Phone, Mail, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../data/mockData';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, currentUser, clearCart } = useOutletContext();
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'COD'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in or cart is empty
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/login');
        return;
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize || null
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        subtotal: subtotal,
        shippingFee: shipping,
        totalAmount: total
      };

      console.log('📦 Creating order:', orderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('📥 Order response:', data);

      if (data.success) {
        // Clear cart
        clearCart();
        
        // Show success message
        alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
        
        // Redirect to orders page
        navigate('/user/orders');
      } else {
        setError(data.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Quay lại giỏ hàng
        </button>

        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-gray-600" size={20} />
                  <h2 className="text-xl font-semibold">Thông tin giao hàng</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Số nhà, tên đường"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Ghi chú về đơn hàng..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-gray-600" size={20} />
                  <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK"
                      disabled
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-500">Sắp ra mắt</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 text-lg"
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Đơn hàng</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.cartId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Tổng cộng</span>
                  <span className="text-rose-600">{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal < 500000 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;