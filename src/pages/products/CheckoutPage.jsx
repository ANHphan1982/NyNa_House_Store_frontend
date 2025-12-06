// frontend/src/pages/products/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, CreditCard, MapPin, User } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useOutletContext();

  // 🔥 Check if user is logged in
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!user;

  // 🔥 STATE: Guest info (for non-logged-in users)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // 🔥 STATE: Shipping address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    ward: '',
    district: '',
    city: 'TP. Hồ Chí Minh'
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = item.price || item.newPrice || 0;
    return sum + (price * quantity);
  }, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // 🔥 VALIDATE & SUBMIT
  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    // Validate cart
    if (cart.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    // 🔥 Validate guest info if not logged in
    if (!isLoggedIn) {
      if (!guestInfo.name || guestInfo.name.trim().length < 2) {
        setError('Vui lòng nhập tên (ít nhất 2 ký tự)');
        return;
      }
      if (!guestInfo.phone || !/^0\d{9}$/.test(guestInfo.phone)) {
        setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
        return;
      }
    }

    // Validate shipping address
    if (!shippingAddress.fullName || shippingAddress.fullName.trim().length < 2) {
      setError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!shippingAddress.phone || !/^0\d{9}$/.test(shippingAddress.phone)) {
      setError('Số điện thoại người nhận không hợp lệ');
      return;
    }
    if (!shippingAddress.address || shippingAddress.address.trim().length < 5) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 🔥 Build request body
      const requestBody = {
        products: cart.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity || 1,
          size: item.selectedSize || 'M',
          name: item.name || item.title,
          price: item.price || item.newPrice
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          email: shippingAddress.email?.trim() || '',
          address: shippingAddress.address.trim(),
          ward: shippingAddress.ward?.trim() || '',
          district: shippingAddress.district?.trim() || '',
          city: shippingAddress.city?.trim() || 'TP. Hồ Chí Minh'
        },
        paymentMethod: paymentMethod,
        note: note.trim()
      };

      // 🔥 Add guestInfo if not logged in
      if (!isLoggedIn) {
        requestBody.guestInfo = {
          name: guestInfo.name.trim(),
          phone: guestInfo.phone.trim(),
          email: guestInfo.email?.trim() || ''
        };
      }

      console.log('📦 Sending order:', requestBody);

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      console.log('📡 Response:', data);

      if (response.ok && data.success) {
        alert(`✅ Đặt hàng thành công! Mã đơn: ${data.order.orderNumber}`);
        
        // Clear cart
        clearCart();

        // Redirect based on user type
        if (isLoggedIn) {
          navigate('/user/orders');
        } else {
          // Show success message with order info for guest
          alert(`Cảm ơn bạn đã đặt hàng!\n\nLưu lại số điện thoại ${guestInfo.phone} để tra cứu đơn hàng.`);
          navigate('/');
        }
      } else {
        setError(data.message || 'Đặt hàng thất bại');
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Quay lại giỏ hàng</span>
        </button>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-serif mb-8">Thanh toán</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 🔥 INFO: Guest checkout notice */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              💡 <strong>Mẹo:</strong> Bạn có thể{' '}
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                className="text-blue-600 underline hover:text-blue-800 font-semibold"
              >
                đăng nhập
              </button>
              {' '}để theo dõi đơn hàng dễ dàng hơn. Hoặc tiếp tục mua hàng không cần tài khoản.
            </p>
          </div>
        )}

        <form onSubmit={handleCheckout}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 🔥 GUEST INFO (Only show if not logged in) */}
              {!isLoggedIn && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={20} />
                    <h2 className="text-xl font-semibold">Thông tin người mua</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Vui lòng nhập thông tin để chúng tôi có thể liên hệ với bạn.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="0901234567"
                        pattern="^0\d{9}$"
                        title="Số điện thoại phải có 10 số và bắt đầu bằng 0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email (tùy chọn)
                      </label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} />
                  <h2 className="text-xl font-semibold">Thông tin giao hàng</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="0901234567"
                      pattern="^0\d{9}$"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email (tùy chọn)
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="123 Nguyễn Huệ"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phường/Xã</label>
                      <input
                        type="text"
                        value={shippingAddress.ward}
                        onChange={(e) => setShippingAddress({...shippingAddress, ward: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Phường Bến Nghé"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                      <input
                        type="text"
                        value={shippingAddress.district}
                        onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Quận 1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                      placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng giờ hành chính..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={20} />
                  <h2 className="text-xl font-semibold">Phương thức thanh toán</h2>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="BANK"
                      checked={paymentMethod === 'BANK'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Chuyển khoản trước khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">Ví MoMo</div>
                      <div className="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</div>
                    </div>
                  </label>
                </div>

                {/* Bank info (show only if BANK selected) */}
                {paymentMethod === 'BANK' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium mb-2">Thông tin chuyển khoản:</p>
                    <div className="text-sm space-y-1">
                      <p>Ngân hàng: <strong>Vietcombank</strong></p>
                      <p>Số tài khoản: <strong>1234567890</strong></p>
                      <p>Chủ tài khoản: <strong>NGUYEN VAN A</strong></p>
                      <p className="text-rose-600 mt-2">
                        Nội dung: <strong>NYNAHOUSE {!isLoggedIn ? guestInfo.phone : user.phone}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
                
                {/* Cart items summary */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item, index) => {
                    const name = item.name || item.title || 'Sản phẩm';
                    const price = item.price || item.newPrice || 0;
                    const quantity = item.quantity || 1;
                    
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="flex-1">{name} x {quantity}</span>
                        <span className="font-medium">{formatPrice(price * quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-rose-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>

                {subtotal < 500000 && (
                  <p className="text-xs text-center text-gray-500 mt-4 p-3 bg-green-50 rounded-lg">
                    💚 Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;