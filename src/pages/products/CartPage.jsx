// frontend/src/pages/products/CartPage.jsx
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

  // 🔥 FIX: Tạo unique key cho mỗi cart item
  const getUniqueKey = (item, index) => {
    const id = item.id || item._id || item.productId;
    const size = item.selectedSize || 'none';
    // Combine id, size, and index to create unique key
    return `${id}-${size}-${index}`;
  };

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
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm?')) {
                  clearCart();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
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
              const stock = item.stock || 999; // Default high stock if not provided
              
              return (
                <div 
                  key={getUniqueKey(item, index)} 
                  className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
                >
                  <img 
                    src={image} 
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/96?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-base md:text-lg line-clamp-2">
                          {name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.category}
                          {item.selectedSize && ` • Size: ${item.selectedSize}`}
                        </p>
                        {stock < 10 && stock > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Chỉ còn {stock} sản phẩm
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          console.log('🗑️ Removing item at index:', index);
                          removeFromCart(index);
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Quantity Control */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (quantity <= 1) {
                              if (confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
                                removeFromCart(index);
                              }
                            } else {
                              updateCartItemQuantity(index, quantity - 1);
                            }
                          }}
                          disabled={quantity <= 1}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                            quantity <= 1 
                              ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                          title={quantity <= 1 ? 'Số lượng tối thiểu' : 'Giảm số lượng'}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => {
                            if (quantity >= stock) {
                              alert(`Chỉ còn ${stock} sản phẩm trong kho`);
                            } else {
                              updateCartItemQuantity(index, quantity + 1);
                            }
                          }}
                          disabled={quantity >= stock}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                            quantity >= stock
                              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                          title={quantity >= stock ? 'Đã đạt tồn kho' : 'Tăng số lượng'}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-600 font-bold text-lg">
                          {formatPrice(price * quantity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(price)}/sp
                        </p>
                      </div>
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
                  <span className="text-gray-600">Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {totalPrice >= 500000 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(30000)
                    )}
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
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold mb-3"
              >
                Thanh toán
              </button>

              <button 
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Tiếp tục mua sắm
              </button>

              {totalPrice < 500000 && (
                <p className="text-xs text-center text-gray-500 mt-4 p-3 bg-green-50 rounded-lg">
                  💚 Mua thêm {formatPrice(500000 - totalPrice)} để được miễn phí vận chuyển
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






















































