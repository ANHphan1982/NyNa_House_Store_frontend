// src/pages/home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import Hero from '../../components/home/Hero';
import ProductCard from '../../components/home/ProductCard';
import { CATEGORIES } from '../../data/mockData';

const Home = () => {
  // Get context from App.jsx via Outlet
  const { products, addToCart } = useOutletContext();
  
  // 🔥 THÊM STATE selectedCategory VÀO ĐÂY
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce search term (giảm lag khi gõ nhanh)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      
      // Save to search history if not empty and not duplicate
      if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
        const newHistory = [searchTerm.trim(), ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchHistory]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // 🔥 FILTER PRODUCTS BY CATEGORY AND SEARCH TERM
  const filteredProducts = products.filter(product => {
    // Filter by category
    const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    
    if (!debouncedSearchTerm) {
      return matchCategory;
    }
    
    // Filter by search term (search in name, description, and category)
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower);
    
    return matchCategory && matchSearch;
  });

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Quick search from history
  const quickSearch = (term) => {
    setSearchTerm(term);
    setDebouncedSearchTerm(term);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div>
      {/* Hero Banner */}
      <Hero />

      {/* Search Bar & Categories */}
      <div className="bg-white py-6 md:py-8 border-b sticky top-[73px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={20} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm... (VD: giày, áo, túi, đồng hồ)"
                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm md:text-base transition-all"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            {debouncedSearchTerm && (
              <div className="text-center mt-3">
                <p className="text-sm text-gray-600">
                  Tìm thấy <span className="font-bold text-rose-600">{filteredProducts.length}</span> sản phẩm cho 
                  <span className="font-semibold"> "{debouncedSearchTerm}"</span>
                  {selectedCategory !== 'Tất cả' && (
                    <span> trong danh mục <span className="font-semibold">{selectedCategory}</span></span>
                  )}
                </p>
              </div>
            )}

            {/* Search History */}
            {!searchTerm && searchHistory.length > 0 && (
              <div className="max-w-2xl mx-auto mt-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 font-medium">Tìm kiếm gần đây</p>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Xóa
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => quickSearch(term)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium shrink-0">
              <Filter size={16} />
              <span className="hidden md:inline">Danh mục:</span>
            </div>
            <div className="flex gap-2 md:gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-xs md:text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-serif mb-2">
            {debouncedSearchTerm 
              ? `Kết quả tìm kiếm: "${debouncedSearchTerm}"` 
              : selectedCategory === 'Tất cả' 
                ? 'Tất Cả Sản Phẩm' 
                : selectedCategory
            }
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-sm">
              {filteredProducts.length} sản phẩm
            </p>
            {debouncedSearchTerm && selectedCategory !== 'Tất cả' && (
              <span className="text-xs text-gray-400">
                • Lọc theo {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-500 mb-6">
              {debouncedSearchTerm 
                ? `Không có sản phẩm nào khớp với "${debouncedSearchTerm}"`
                : 'Không có sản phẩm nào trong danh mục này.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {debouncedSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Xóa tìm kiếm
                </button>
              )}
              {selectedCategory !== 'Tất cả' && (
                <button
                  onClick={() => setSelectedCategory('Tất cả')}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
                >
                  Xem tất cả
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;