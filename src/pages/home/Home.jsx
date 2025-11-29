// frontend/src/pages/home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, X, Filter, Grid, List } from 'lucide-react';
import Hero from '../../components/home/Hero';
import ProductCard from '../../components/home/ProductCard';
import { CATEGORIES } from '../../data/mockData';

const Home = () => {
  // Get context from App.jsx via Outlet
  const { products, addToCart } = useOutletContext();
  
  // Category & View state
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      
      // Save to search history
      if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
        const newHistory = [searchTerm.trim(), ...searchHistory.slice(0, 4)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load search history
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    
    if (!debouncedSearchTerm) {
      return matchCategory;
    }
    
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
    setShowSearchHistory(false);
  };

  // Quick search from history
  const quickSearch = (term) => {
    setSearchTerm(term);
    setDebouncedSearchTerm(term);
    setShowSearchHistory(false);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <Hero />

      {/* Search Bar & Filters - Sticky on Mobile */}
      <div className="bg-white border-b sticky top-0 md:top-[73px] z-30 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
          {/* Search Bar */}
          <div className="mb-3 md:mb-4">
            <div className="relative max-w-3xl mx-auto">
              <Search 
                className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={18} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 border-2 border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm md:text-base transition-all"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            {debouncedSearchTerm && (
              <div className="text-center mt-2 md:mt-3">
                <p className="text-xs md:text-sm text-gray-600">
                  Tìm thấy <span className="font-bold text-rose-600">{filteredProducts.length}</span> sản phẩm
                  {selectedCategory !== 'Tất cả' && (
                    <span className="hidden sm:inline"> trong <span className="font-semibold">{selectedCategory}</span></span>
                  )}
                </p>
              </div>
            )}

            {/* Search History Dropdown */}
            {showSearchHistory && !searchTerm && searchHistory.length > 0 && (
              <div className="absolute left-0 right-0 max-w-3xl mx-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-gray-500">Tìm kiếm gần đây</p>
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
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Categories & View Mode */}
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Categories Filter - Horizontal Scroll on Mobile */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium shrink-0">
                <Filter size={14} />
                <span className="hidden sm:inline">Danh mục:</span>
              </div>
              <div className="flex gap-1.5 md:gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap text-xs md:text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Xem dạng lưới"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Xem dạng danh sách"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif mb-1 md:mb-2">
            {debouncedSearchTerm 
              ? `Kết quả tìm kiếm` 
              : selectedCategory === 'Tất cả' 
                ? 'Tất Cả Sản Phẩm' 
                : selectedCategory
            }
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-gray-600 text-xs sm:text-sm">
              {filteredProducts.length} sản phẩm
            </p>
            {debouncedSearchTerm && (
              <span className="text-xs text-gray-400">
                • "{debouncedSearchTerm}"
              </span>
            )}
            {selectedCategory !== 'Tất cả' && (
              <span className="text-xs text-gray-400">
                • {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl">
            <div className="inline-block p-4 md:p-6 bg-gray-100 rounded-full mb-3 md:mb-4">
              <Search size={40} className="text-gray-400 md:w-12 md:h-12" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 px-4">
              {debouncedSearchTerm 
                ? `Không có sản phẩm nào khớp với "${debouncedSearchTerm}"`
                : 'Không có sản phẩm nào trong danh mục này.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4">
              {debouncedSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="px-5 md:px-6 py-2 md:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm md:text-base"
                >
                  Xóa tìm kiếm
                </button>
              )}
              {selectedCategory !== 'Tất cả' && (
                <button
                  onClick={() => setSelectedCategory('Tất cả')}
                  className="px-5 md:px-6 py-2 md:py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 active:scale-95 transition-all font-medium text-sm md:text-base"
                >
                  Xem tất cả
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Products Grid/List */
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'
              : 'flex flex-col gap-4'
          }>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id || product._id} 
                product={product} 
                onAddToCart={addToCart}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Scroll to Top Button - Mobile */}
        {filteredProducts.length > 6 && (
          <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-20">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 md:p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
              aria-label="Scroll to top"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;