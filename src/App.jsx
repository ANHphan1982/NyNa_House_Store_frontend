// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS } from './data/mockData';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
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

  // 🔥 Load products và lắng nghe thay đổi
  useEffect(() => {
    // Function để load products
    const loadProducts = () => {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        console.log('📦 Products loaded:', parsed.length, 'items');
        setProducts(parsed);
      } else {
        console.log('📦 No products found, using INITIAL_PRODUCTS');
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
      }
    };

    // Load lần đầu
    loadProducts();

    // 🔥 Lắng nghe sự kiện 'productsUpdated'
    const handleProductsUpdate = () => {
      console.log('🔔 Products updated event received!');
      loadProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
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

  // Cart functions
  const addToCart = (product, size = null) => {
    const newItem = {
      ...product,
      selectedSize: size,
      quantity: 1,
      cartId: Date.now()
    };
    const newCart = [...cart, newItem];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (cartId, quantity) => {
    const newCart = cart.map(item => 
      item.cartId === cartId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
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
          updateCartQuantity,
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