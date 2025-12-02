// frontend/src/pages/products/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Phone, Mail, User, AlertCircle, Loader2, Clock } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart = [], clearCart, currentUser } = useOutletContext();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [previousOrderLoaded, setPreviousOrderLoaded] = useState(false);

  // 🔥 FETCH PREVIOUS ORDER DATA
  useEffect(() => {
    const fetchPreviousOrder = async () => {
      // Only fetch if user is logged in and has temp email (registered by phone)
      if (!currentUser) return;
      
      const isTempEmail = currentUser.email && currentUser.email.includes('@temp.local');
      
      // If user has real email, no need to fetch (they can use their own email)
      if (!isTempEmail && currentUser.email) return;

      try {
        setLoadingPrevious(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;

        console.log('🔍 Fetching previous orders to pre-fill address...');

        const response = await fetch(`${API_URL}/api/orders/user?limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log('⚠️ Could not fetch previous orders');
          return;
        }

        const data = await response.json();
        
        if (data.success && data.orders && data.orders.length > 0) {
          const lastOrder = data.orders[0];
          const lastAddress = lastOrder.shippingAddress;
          
          console.log('✅ Found previous order, pre-filling address...');
          
          setFormData(prev => ({
            ...prev,
            // Only update if current values are empty
            email: prev.email && !prev.email.includes('@temp.local') ? prev.email : (lastAddress.email || prev.email),
            address: prev.address || lastAddress.address || '',
            city: prev.city || lastAddress.city || '',
            district: prev.district || lastAddress.district || '',
            ward: prev.ward || lastAddress.ward || ''
          }));
          
          setPreviousOrderLoaded(true);
          console.log('✅ Address pre-filled from previous order');
        } else {
          console.log('ℹ️ No previous orders found');
        }
      } catch (error) {
        console.error('❌ Error fetching previous order:', error);
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPreviousOrder();
  }, [currentUser]);

  // Update form khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || prev.fullName,
        phone: currentUser?.phone || prev.phone,
        // Only update email if it's not temp email
        email: currentUser?.email && !currentUser?.email.includes('@temp.local') 
          ? currentUser?.email 
          : prev.email
      }));
    }
  }, [currentUser]);

  // Redirect nếu giỏ hàng trống
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // 🔥 DEBUG: Log cart structure
  useEffect(() => {
    console.log('=== CART DEBUG ===');
    console.log('Cart length:', cart.length);
    cart.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        _id: item._id,
        id: item.id,
        productId: item.productId,
        name: item.name || item.title,
        quantity: item.quantity,
        price: item.price
      });
    });
  }, [cart]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const shippingFee = 30000;
  const subtotal = calculateTotal();
  const total = subtotal + shippingFee;

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('=== CHECKOUT STARTED ===');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    if (cart.length === 0) {
      setError('Giỏ hàng trống');
      console.log('❌ Cart is empty');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Vui lòng đăng nhập để đặt hàng');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('🛒 Processing cart items...');

      // 🔥 Format products with comprehensive ID extraction
      const products = cart.map((item, index) => {
        let productId = item._id || item.id || item.productId;
        
        if (!productId && item.product) {
          productId = item.product._id || item.product.id;
        }

        if (!productId) {
          console.error(`❌ Item ${index} has no valid ID:`, item);
          throw new Error(`Sản phẩm "${item.name || item.title}" không có mã hợp lệ`);
        }

        let quantity = parseInt(item.quantity);
        if (isNaN(quantity) || quantity < 1) {
          console.warn(`⚠️ Item ${index} has invalid quantity, defaulting to 1`);
          quantity = 1;
        }

        let price = parseFloat(item.price || item.newPrice || 0);
        if (isNaN(price) || price <= 0) {
          console.error(`❌ Item ${index} has invalid price:`, item.price);
          throw new Error(`Sản phẩm "${item.name || item.title}" không có giá hợp lệ`);
        }

        const product = {
          productId: productId,
          name: item.name || item.title,
          quantity: quantity,
          price: price,
          image: item.image || '',
          size: item.selectedSize || null
        };

        console.log(`✅ Product ${index} formatted:`, product);
        return product;
      });

      console.log('📦 Total products to send:', products.length);

      if (!products || products.length === 0) {
        throw new Error('Không có sản phẩm hợp lệ trong giỏ hàng');
      }

      // 🔥 Create full address
      const fullAddress = [
        formData.address.trim(),
        formData.ward.trim(),
        formData.district.trim(),
        formData.city.trim()
      ].filter(part => part !== '').join(', ');

      const orderData = {
        products: products,
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: fullAddress || formData.address.trim(),
          city: formData.city.trim() || 'N/A',
          district: formData.district.trim() || 'N/A',
          ward: formData.ward.trim() || 'N/A'
        },
        paymentMethod: paymentMethod,
        notes: formData.notes.trim(),
        totalAmount: total
      };

      console.log('📤 Sending order data:');
      console.log(JSON.stringify(orderData, null, 2));

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
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tạo đơn hàng');
      }

      if (data.success) {
        console.log('✅ Order created successfully:', data.order?._id);
        
        clearCart();
        alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
        navigate('/user/orders');
      } else {
        throw new Error(data.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      console.error('Error stack:', error.stack);
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại giỏ hàng</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Loading Previous Order */}
        {loadingPrevious && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="text-blue-600 animate-spin" size={20} />
              <p className="text-sm text-blue-800">Đang tải thông tin từ đơn hàng trước...</p>
            </div>
          </div>
        )}

        {/* Previous Order Loaded */}
        {previousOrderLoaded && !loadingPrevious && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-green-600" size={20} />
              <p className="text-sm text-green-800">
                ✓ Đã tự động điền thông tin từ đơn hàng trước của bạn
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-shake">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-rose-600" size={20} />
                  <h2 className="text-lg font-semibold">Thông tin khách hàng</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="0901234567"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="email@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-rose-600" size={20} />
                  <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, tên đường) *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="VD: 123 Đường Lê Lợi, Phường 1, Quận 1, TP.HCM"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="VD: Phường 1"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="VD: Quận 1"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="VD: TP. Hồ Chí Minh"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (Tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                      placeholder="Ghi chú về đơn hàng..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-rose-600" size={20} />
                  <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-500">Chuyển khoản trước khi nhận hàng</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="text-rose-600" size={20} />
                <h2 className="text-lg font-semibold">Đơn hàng của bạn</h2>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3 py-3 border-b">
                    <img
                      src={item.image}
                      alt={item.name || item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name || item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        SL: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-rose-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-rose-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || loadingPrevious}
                className="w-full mt-6 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
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

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với{' '}
                <a href="#" className="text-rose-600 hover:underline">
                  Điều khoản sử dụng
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-2">🔍 Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Cart items: {cart.length}</p>
            <p className="text-gray-600">User email: {currentUser?.email || 'N/A'}</p>
            <p className="text-gray-600">Is temp email: {currentUser?.email?.includes('@temp.local') ? 'Yes' : 'No'}</p>
            <p className="text-gray-600">Previous order loaded: {previousOrderLoaded ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;