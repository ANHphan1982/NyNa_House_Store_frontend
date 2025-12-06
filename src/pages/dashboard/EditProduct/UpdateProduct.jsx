// frontend/src/pages/dashboard/EditProduct/UpdateProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Link as LinkIcon } from 'lucide-react';
import InputField from '../addProduct/InputField';
import SelectField from '../addProduct/SelectField';
import API_URL from '../../../utils/api';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🔥 EXISTING STATE (GIỮ NGUYÊN)
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

  // 🔥 NEW STATE - For Cloudinary Upload
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [originalImage, setOriginalImage] = useState(''); // Store original image URL

  const categories = ['Quần áo', 'Giày dép', 'Mỹ phẩm', 'Thực phẩm', 'Tiêu dùng', 'Gia dụng'];

  // 🔥 EXISTING useEffect (GIỮ NGUYÊN)
  useEffect(() => {
    fetchProduct();
  }, [id]);

  // 🔥 EXISTING fetchProduct (GIỮ NGUYÊN)
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
        setOriginalImage(product.image); // 🔥 Store original image
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

  // 🔥 EXISTING FUNCTIONS (GIỮ NGUYÊN)
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

  // 🔥 NEW FUNCTION - Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB');
      e.target.value = '';
      return;
    }

    console.log('✅ File selected:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
    setImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔥 NEW FUNCTION - Upload to Cloudinary
  const uploadToCloudinary = async () => {
    if (!imageFile) {
      console.log('⚠️ No file to upload');
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token không tồn tại. Vui lòng đăng nhập lại.');
      }

      console.log('📤 Uploading to Cloudinary...');

      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Image uploaded:', data.imageUrl);
        return data.imageUrl;
      } else {
        throw new Error(data.message || 'Upload thất bại');
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 🔥 MODIFIED - Submit handler with Cloudinary support
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔥 DETERMINE FINAL IMAGE URL
      let finalImageUrl = '';

      if (imageMode === 'upload') {
        // If user selected a new file, upload it
        if (imageFile) {
          console.log('🔄 Uploading new image to Cloudinary...');
          finalImageUrl = await uploadToCloudinary();
          
          if (!finalImageUrl) {
            setError('Upload ảnh thất bại. Vui lòng thử lại.');
            setLoading(false);
            return;
          }
          
          console.log('✅ Upload successful, URL:', finalImageUrl);
        } else {
          // No new file selected, keep original image
          finalImageUrl = originalImage;
          console.log('✅ Keeping original image:', finalImageUrl);
        }
      } else {
        // Use URL input
        finalImageUrl = formData.image.trim();
        
        if (!finalImageUrl) {
          setError('Vui lòng nhập URL ảnh');
          setLoading(false);
          return;
        }
        
        console.log('✅ Using URL from input:', finalImageUrl);
      }

      const validSizes = sizes.filter(size => size.trim() !== '');

      // 🔥 UPDATE PRODUCT DATA (GIỮ NGUYÊN LOGIC CŨ)
      const updatedData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        image: finalImageUrl, // 🔥 Use final image URL
        description: formData.description.trim(),
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        stock: parseInt(formData.stock),
        sizes: validSizes
      };

      console.log('📄 Updating product:', id);
      console.log('📦 Update data:', updatedData);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại!');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // 🔥 CALL API BACKEND (GIỮ NGUYÊN)
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
        
        // 🔥 CLEAR CACHE (GIỮ NGUYÊN)
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

  // 🔥 EXISTING Loading State (GIỮ NGUYÊN)
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
          {/* 🔥 EXISTING FIELDS (GIỮ NGUYÊN) */}
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

          {/* 🔥 NEW/UPDATED - Image Input Section with Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ảnh sản phẩm <span className="text-red-500">*</span>
            </label>

            {/* Current Image Preview */}
            {originalImage && !imageFile && imageMode === 'url' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                <img 
                  src={originalImage} 
                  alt="Current" 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/128x128/e2e8f0/64748b?text=Error';
                  }}
                />
              </div>
            )}

            {/* Image Mode Toggle Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setImageMode('url');
                  setImageFile(null);
                  setImagePreview('');
                }}
                disabled={loading || uploading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  imageMode === 'url'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <LinkIcon size={18} />
                Nhập URL
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setImageMode('upload');
                  // Don't clear formData.image here - keep original as fallback
                }}
                disabled={loading || uploading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  imageMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Upload size={18} />
                Upload Ảnh Mới
              </button>
            </div>

            {/* URL Input Mode */}
            {imageMode === 'url' && (
              <div>
                <InputField
                  label=""
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg hoặc link Facebook"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Nhập URL ảnh mới hoặc giữ nguyên ảnh hiện tại
                </p>
                
                {/* URL Preview (if changed) */}
                {formData.image && formData.image !== originalImage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview ảnh mới:</p>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/160x160/e2e8f0/64748b?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* File Upload Mode */}
            {imageMode === 'upload' && (
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="imageFileInput"
                    disabled={loading || uploading}
                  />
                  <label 
                    htmlFor="imageFileInput"
                    className={`cursor-pointer ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-gray-600">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-base font-medium mb-1">
                        Click để chọn ảnh mới
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF, WEBP • Tối đa 5MB
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Không chọn file = giữ nguyên ảnh cũ
                      </p>
                    </div>
                  </label>
                </div>

                {/* File Preview */}
                {imagePreview && imageFile ? (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Ảnh mới sẽ upload:</p>
                    <div className="flex items-start gap-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          📁 {imageFile.name}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          Kích thước: {(imageFile.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                            document.getElementById('imageFileInput').value = '';
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                          disabled={loading || uploading}
                        >
                          ✕ Xóa và chọn lại
                        </button>
                      </div>
                    </div>
                  </div>
                ) : originalImage ? (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      ℹ️ Chưa chọn ảnh mới → Sẽ giữ nguyên ảnh hiện tại
                    </p>
                    <img 
                      src={originalImage} 
                      alt="Current" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* 🔥 EXISTING FIELDS (GIỮ NGUYÊN) */}
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

          {/* Sizes (GIỮ NGUYÊN) */}
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

          {/* Submit Buttons (GIỮ NGUYÊN) */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? '⏳ Đang upload ảnh...' : loading ? 'Đang cập nhật...' : 'Cập Nhật Sản Phẩm'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-products')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              disabled={loading || uploading}
            >
              Hủy
            </button>
          </div>
        </form>

        {/* Debug Info (GIỮ NGUYÊN) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Product ID: {id}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
            <p className="text-gray-600">Image Mode: {imageMode}</p>
            <p className="text-gray-600">Has New File: {imageFile ? 'Yes' : 'No'}</p>
            <p className="text-gray-600">Original Image: {originalImage ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;