import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../../data/mockData';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = useOutletContext();
  
  // Tính tổng tiền có tính số lượng
  const totalPrice = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = item.price || item.newPrice || 0;
    return sum + (price * quantity);
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Tiếp tục mua sắm</span>
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif mb-1">Giỏ hàng của bạn</h1>
            <p className="text-gray-500 text-sm">{cart.length} sản phẩm</p>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const price = item.price || item.newPrice || 0;
              const quantity = item.quantity || 1;
              const name = item.name || item.title || 'Sản phẩm';
              const image = item.image || item.coverImage || '/placeholder.jpg';
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                  <img 
                    src={image} 
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-base md:text-lg line-clamp-1">
                          {name}
                        </h3>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartItemQuantity(index, quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(index, quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-rose-600 font-bold text-lg">
                        {formatPrice(price * quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {totalPrice >= 500000 ? 'Miễn phí' : formatPrice(30000)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-rose-600">
                  {formatPrice(totalPrice >= 500000 ? totalPrice : totalPrice + 30000)}
                </span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                Thanh toán
              </button>

              {totalPrice < 500000 && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  Mua thêm {formatPrice(500000 - totalPrice)} để được miễn phí vận chuyển
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;






















































