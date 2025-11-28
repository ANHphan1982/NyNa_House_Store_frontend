// frontend/src/pages/products/SingleProduct.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Star, Package } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import API_URL from '../../utils/api';

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useOutletContext();
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH PRODUCT TỪ API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching product:', id);
        console.log('🌐 API URL:', API_URL);

        // Fetch product detail
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
          console.log('✅ Product loaded:', data.product);

          // Fetch related products
          const relatedResponse = await fetch(
            `${API_URL}/api/products/${id}/related`
          );
          const relatedData = await relatedResponse.json();
          
          if (relatedData.success) {
            setRelatedProducts(relatedData.products);
          }
        } else {
          console.error('❌ Product not found');
          setProduct(null);
        }
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // 🔥 Re-fetch khi id thay đổi

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-600 mb-4">
          Sản phẩm có thể đã bị xóa hoặc không tồn tại.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // 🔥 Check size nếu sản phẩm có sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Vui lòng chọn kích thước!');
      return;
    }

    // 🔥 Tạo product object để add vào cart
    const cartItem = {
      id: product.productId || product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      selectedSize: selectedSize,
      stock: product.stock
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>

        {/* Product Detail */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-[400px] md:h-[600px] object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700">
                {product.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-serif mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        size={18}
                        className={i < Math.floor(product.rating) 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews || 0} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-rose-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Kích thước <span className="text-red-500">*</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedSize === size
                            ? 'border-rose-600 bg-rose-50 text-rose-600 font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock - 🔥 HIỂN THỊ REAL-TIME */}
              <div className="mb-6 flex items-center gap-2">
                <Package size={20} className="text-gray-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">Tồn kho:</span>{' '}
                  <span className={product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
                  </span>
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8 space-y-3">
                <h3 className="text-lg font-semibold mb-3">Đặc điểm</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span>Chất lượng cao cấp</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span>Giao hàng miễn phí cho đơn trên 500k</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span>Bảo hành chính hãng</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-4 rounded-lg transition-colors flex items-center justify-center gap-3 font-semibold text-lg ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag size={24} />
                  {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(relatedProduct => (
                <div 
                  key={relatedProduct._id}
                  onClick={() => {
                    navigate(`/products/${relatedProduct.productId || relatedProduct._id}`);
                    window.scrollTo(0, 0); // Scroll to top
                  }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                >
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1 mb-1">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-rose-600 font-bold text-sm">
                      {formatPrice(relatedProduct.price)}
                    </p>
                    {relatedProduct.stock !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Còn {relatedProduct.stock} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info - Development only */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Product ID: {id}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;