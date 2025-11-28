import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { formatPrice } from '../../data/mockData';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
          {product.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">
              {product.rating} ({product.reviews || 0} đánh giá)
            </span>
          </div>
        )}
        
        <p className="text-gray-500 text-xs md:text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg md:text-xl font-bold text-rose-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;