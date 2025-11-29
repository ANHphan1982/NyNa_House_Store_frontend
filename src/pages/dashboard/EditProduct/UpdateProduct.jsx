// frontend/src/pages/dashboard/EditProduct/UpdateProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import InputField from '../addProduct/InputField';
import SelectField from '../addProduct/SelectField';
import API_URL from '../../../utils/api';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    rating: '',
    reviews: '',
    stock: ''
  });
  const [sizes, setSizes] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['Quần áo', 'Giày dép', 'Mỹ phẩm', 'Thực phẩm', 'Tiêu dùng'];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetchLoading(true);
      console.log('🔍 Fetching product:', id);
      console.log('🌐 API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();

      if (data.success && data.product) {
        const product = data.product;
        console.log('✅ Product loaded:', product);

        setFormData({
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          description: product.description,
          rating: product.rating || '',
          reviews: product.reviews || '',
          stock: product.stock
        });
        setSizes(product.sizes && product.sizes.length > 0 ? product.sizes : ['']);
      } else {
        throw new Error('Không tìm thấy sản phẩm');
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      alert('Không thể tải thông tin sản phẩm!');
      navigate('/dashboard/manage-products');
    } finally {
      setFetchLoading(false);
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

  const handleSizeChange = (index, value) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };

  const addSizeField = () => {
    setSizes([...sizes, '']);
  };

  const removeSizeField = (index) => {
    const newSizes = sizes.filter((_, i) => i !== index);
    setSizes(newSizes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validSizes = sizes.filter(size => size.trim() !== '');

      const updatedData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        description: formData.description.trim(),
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        stock: parseInt(formData.stock),
        sizes: validSizes
      };

      console.log('🔄 Updating product:', id);
      console.log('📦 Update data:', updatedData);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại!');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // 🔥 GỌI API BACKEND
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }

      const data = await response.json();
      console.log('✅ Response:', data);

      if (data.success) {
        console.log('✅ Product updated successfully');
        
        // 🔥 CLEAR CACHE và TRIGGER REFRESH
        localStorage.removeItem('products');
        window.dispatchEvent(new Event('productsUpdated'));

        alert('Cập nhật sản phẩm thành công!');
        navigate('/dashboard/manage-products');
      } else {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      
      if (error.message.includes('fetch')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else if (error.message.includes('token') || error.message.includes('401')) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/dashboard/manage-products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Quay lại danh sách</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Chỉnh Sửa Sản Phẩm</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Tên sản phẩm"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
              disabled={loading}
            />

            <SelectField
              label="Danh mục"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories}
              required
              disabled={loading}
            />

            <InputField
              label="Giá (VNĐ)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="1000000"
              required
              min="0"
              step="1000"
              disabled={loading}
            />

            <InputField
              label="Tồn kho"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              placeholder="10"
              required
              min="0"
              disabled={loading}
            />

            <InputField
              label="Đánh giá (0-5)"
              name="rating"
              type="number"
              value={formData.rating}
              onChange={handleChange}
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
              disabled={loading}
            />

            <InputField
              label="Số lượt đánh giá"
              name="reviews"
              type="number"
              value={formData.reviews}
              onChange={handleChange}
              placeholder="100"
              min="0"
              disabled={loading}
            />
          </div>

          <InputField
            label="Link hình ảnh"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            required
            disabled={loading}
          />

          <InputField
            label="Mô tả sản phẩm"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả chi tiết về sản phẩm..."
            required
            rows={4}
            disabled={loading}
          />

          {/* Sizes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước
            </label>
            {sizes.map((size, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={size}
                  onChange={(e) => handleSizeChange(index, e.target.value)}
                  placeholder="VD: S, M, L hoặc 39, 40, 41"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  disabled={loading}
                />
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSizeField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSizeField}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mt-2 disabled:opacity-50"
              disabled={loading}
            >
              <Plus size={18} />
              Thêm kích thước
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Sản Phẩm'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-products')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>

        {/* Debug Info */}
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

export default UpdateProduct;