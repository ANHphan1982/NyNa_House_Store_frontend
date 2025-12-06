// frontend/src/components/ProductCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiShoppingCart } from 'react-icons/fi';
import { addToCart } from '../redux/features/cart/cartSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  // Default placeholder image
  const placeholderImage = 'https://via.placeholder.com/400x400?text=No+Image';

  const handleImageError = () => {
    console.log('❌ Image load failed:', product.image);
    setImageError(true);
  };

  const handleProductClick = () => {
    // 🔥 FIX: Always use _id (ObjectId) for navigation
    console.log('📍 Navigating to product:', product._id);
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking cart button
    dispatch(addToCart(product));
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div 
      onClick={handleProductClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={imageError ? placeholderImage : product.image}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Stock Badge */}
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Hết hàng
          </div>
        )}
        
        {/* Discount Badge */}
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-rose-600 transition-colors">
          {product.name || product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-rose-600">
              {formatPrice(product.price)}
            </p>
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </p>
            )}
          </div>
          
          {/* Stock Info */}
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Còn lại: <span className="font-semibold">{product.stock}</span>
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full btn-primary px-4 py-2 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="text-lg" />
          <span>{product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;












































