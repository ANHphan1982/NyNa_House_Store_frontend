// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, ChevronDown, LayoutDashboard, Package, ShoppingBag, CreditCard, LogOut } from 'lucide-react';

const Navbar = ({ cart = [], currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleMenuItemClick = (path) => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate(path);
  };

  // Tính tổng số lượng sản phẩm trong giỏ
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // 🔥 SAFE GET USER NAME với fallback
  const getUserName = () => {
    return currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-rose-600" />
            <span className="text-xl font-bold text-gray-900">Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900 transition-colors">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              Giới thiệu
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Wishlist - Chỉ hiển thị khi đã đăng nhập */}
            {currentUser && (
              <Link 
                to="/wishlist" 
                className="hidden md:block p-2 text-gray-700 hover:text-rose-600 transition-colors"
                title="Yêu thích"
              >
                <Heart size={24} />
              </Link>
            )}

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              title="Giỏ hàng"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 text-xs font-bold rounded px-1.5 py-0.5 min-w-[20px] text-center">
                {cartItemCount}
              </span>
            </Link>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={getUserName()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {getUserInitial()}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`hidden md:block text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email || currentUser.phone}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleMenuItemClick('/user/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-gray-500" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => handleMenuItemClick('/user/orders')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Package size={18} className="text-gray-500" />
                        Orders
                      </button>

                      <button
                        onClick={() => handleMenuItemClick('/cart')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingBag size={18} className="text-gray-500" />
                        Cart Page
                      </button>

                      <button
                        onClick={() => handleMenuItemClick('/checkout')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <CreditCard size={18} className="text-gray-500" />
                        Check Out
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm font-medium">Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors py-2"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors py-2"
              >
                Sản phẩm
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 transition-colors py-2"
              >
                Giới thiệu
              </Link>
              
              {currentUser ? (
                <>
                  <div className="border-t pt-3 mt-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {getUserInitial()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getUserName()}</p>
                        <p className="text-xs text-gray-500">{currentUser.email || currentUser.phone}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMenuItemClick('/user/dashboard')}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 py-2"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('/user/orders')}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 py-2"
                  >
                    <Package size={18} />
                    Orders
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('/cart')}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 py-2"
                  >
                    <ShoppingBag size={18} />
                    Cart Page
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('/checkout')}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 py-2"
                  >
                    <CreditCard size={18} />
                    Check Out
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 hover:text-red-700 py-2 border-t pt-3"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gray-900 text-white text-center py-2 rounded-lg hover:bg-gray-800 transition-colors mt-2"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;