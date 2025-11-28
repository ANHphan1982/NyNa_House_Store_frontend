import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import InputField from '../addProduct/InputField';
import SelectField from '../addProduct/SelectField';

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

  const categories = ['Quần áo', 'Giày dép', 'Mỹ phẩm', 'Thực phẩm', 'Tiêu dùng'];

  useEffect(() => {
    // Load product data
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === parseInt(id));

    if (product) {
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
      setSizes(product.sizes || ['']);
    } else {
      alert('Không tìm thấy sản phẩm!');
      navigate('/dashboard/manage-products');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    try {
      const validSizes = sizes.filter(size => size.trim() !== '');

      const updatedProduct = {
        id: parseInt(id),
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        image: formData.image,
        description: formData.description,
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        stock: parseInt(formData.stock),
        sizes: validSizes
      };

      // Get existing products
      const products = JSON.parse(localStorage.getItem('products')) || [];
      
      // Update product
      const updatedProducts = products.map(p => 
        p.id === parseInt(id) ? updatedProduct : p
      );
      
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      alert('Cập nhật sản phẩm thành công!');
      navigate('/dashboard/manage-products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Tên sản phẩm"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
            />

            <SelectField
              label="Danh mục"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories}
              required
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
            />

            <InputField
              label="Số lượt đánh giá"
              name="reviews"
              type="number"
              value={formData.reviews}
              onChange={handleChange}
              placeholder="100"
              min="0"
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
                />
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSizeField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSizeField}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mt-2"
            >
              <Plus size={18} />
              Thêm kích thước
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              {loading ? 'Đang cập nhật...' : 'Cập Nhật Sản Phẩm'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-products')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;