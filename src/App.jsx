// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockData';
import API_URL from './utils/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Load user từ localStorage
  useEffect(() => {
    console.log('🔄 App mounted - Loading user...');
    
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        console.log('✅ User loaded:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('❌ Error parsing user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // 🔥 FETCH PRODUCTS TỪ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching products from:', API_URL);
        
        const response = await fetch(`${API_URL}/api/products?limit=100`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 API Response:', data);

        if (data.success && data.products && data.products.length > 0) {
          // Format products để match với localStorage format
          const formattedProducts = data.products.map(p => ({
            id: p.productId || p._id,
            _id: p._id,
            productId: p.productId,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image,
            description: p.description,
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            stock: p.stock || 0,
            sizes: p.sizes || []
          }));
          
          console.log('✅ Products loaded from API:', formattedProducts.length);
          setProducts(formattedProducts);
          localStorage.setItem('products', JSON.stringify(formattedProducts));
        } else {
          throw new Error('No products returned from API');
        }
      } catch (error) {
        console.error('❌ Error fetching products from API:', error);
        console.log('⚠️ Fallback to localStorage or mockData');
        
        // Fallback 1: Try localStorage
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          try {
            const parsed = JSON.parse(storedProducts);
            console.log('📦 Using products from localStorage:', parsed.length);
            setProducts(parsed);
          } catch (e) {
            console.error('❌ Error parsing localStorage:', e);
            useMockData();
          }
        } else {
          useMockData();
        }
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      console.log('📦 Using mockData:', INITIAL_PRODUCTS.length);
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
    };

    fetchProducts();

    // 🔥 Listen for products update event
    const handleProductsUpdate = () => {
      console.log('🔔 Products updated event received!');
      fetchProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, []);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('❌ Error parsing cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Lắng nghe storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          const user = JSON.parse(e.newValue);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔥 FIX: Cart functions - DÙNG INDEX thay vì cartId
  const addToCart = (product, size = null) => {
    console.log('➕ Adding to cart:', product.name);
    const newItem = {
      ...product,
      selectedSize: size,
      quantity: 1
    };
    const newCart = [...cart, newItem];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // 🔥 FIX: Remove by INDEX
  const removeFromCart = (indexToRemove) => {
    console.log('🗑️ Removing item at index:', indexToRemove);
    console.log('📦 Current cart before removal:', cart);
    
    const newCart = cart.filter((_, index) => index !== indexToRemove);
    
    console.log('✅ New cart after removal:', newCart);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  // 🔥 FIX: Update by INDEX
  const updateCartItemQuantity = (index, newQuantity) => {
    console.log('🔄 Updating quantity at index:', index, 'to:', newQuantity);
    
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }

    const newCart = cart.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    console.log('✅ Updated cart:', newCart);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    console.log('🧹 Clearing cart...');
    setCart([]);
    localStorage.removeItem('cart');
  };

  const handleLoginSuccess = (user) => {
    console.log('🎉 handleLoginSuccess called with user:', user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    setCart([]);
  };

  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/dashboard');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Đang tải sản phẩm...</p>
          <p className="mt-2 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && (
        <Navbar 
          cart={cart} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}
      
      <main className="flex-grow">
        <Outlet context={{ 
          products, 
          cart, 
          currentUser,
          addToCart, 
          removeFromCart,
          updateCartItemQuantity,
          clearCart,
          setProducts,
          setCurrentUser,
          handleLoginSuccess
        }} />
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;