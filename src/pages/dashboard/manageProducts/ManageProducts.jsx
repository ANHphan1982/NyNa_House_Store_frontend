// frontend/src/pages/dashboard/manageProducts/ManageProducts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Package, RefreshCw } from 'lucide-react';
import { formatPrice } from '../../../data/mockData'; // 🔥 FIX: 3 cấp lên
import API_URL from '../../../utils/api'; // 🔥 FIX: 3 cấp lên

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['Tất cả', 'Quần áo', 'Giày dép', 'Mỹ phẩm', 'Thực phẩm', 'Tiêu dùng','Gia dụng'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching ALL products (including inactive) from:', API_URL);

      const token = localStorage.getItem('token');
      
      // 🔥 FIX: Fetch tất cả products (bao gồm inactive) cho admin
      const response = await fetch(`${API_URL}/api/products?limit=1000&includeInactive=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📡 Response:', data);

      if (data.success) {
        setProducts(data.products || []);
        console.log('✅ Products loaded:', data.products.length);
      } else {
        console.error('❌ Failed to load products:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('🗑️ Deleting product:', productId);
      
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Delete response status:', response.status);

      const data = await response.json();
      console.log('📦 Delete response:', data);

      if (response.ok && data.success) {
        console.log('✅ Product deleted successfully from MongoDB');
        alert('Xóa sản phẩm thành công!');
        
        // 🔥 Clear cache và reload
        localStorage.removeItem('products');
        window.dispatchEvent(new Event('productsUpdated'));
        
        // Refresh list
        fetchProducts();
      } else {
        console.error('❌ Delete failed:', data.message);
        alert('Lỗi: ' + (data.message || 'Xóa thất bại'));
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Không thể xóa sản phẩm: ' + error.message);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'Tất cả' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm từ MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 text-sm mt-1">
            Tổng: {filteredProducts.length} / {products.length} sản phẩm
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={20} />
            Làm mới
          </button>
          <button
            onClick={() => navigate('/dashboard/products/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
              : 'Chưa có sản phẩm nào trong MongoDB'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {product._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock > 10 ? 'text-green-600' :
                        product.stock > 0 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
          <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
          <p className="text-gray-600">API URL: {API_URL}</p>
          <p className="text-gray-600">Total Products in MongoDB: {products.length}</p>
          <p className="text-gray-600">Filtered: {filteredProducts.length}</p>
          <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
