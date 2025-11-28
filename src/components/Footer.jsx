import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Top Section */}
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold font-serif mb-4">
              NyNa<span className="text-rose-500">.</span>Store
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Mang đến trải nghiệm mua sắm đẳng cấp và tiện lợi cho mọi gia đình.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-rose-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-rose-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-rose-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 tracking-wider">Mua sắm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#products" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Tất cả sản phẩm
                </a>
              </li>
              <li>
                <a href="#new" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Hàng mới về
                </a>
              </li>
              <li>
                <a href="#collections" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Bộ sưu tập
                </a>
              </li>
              <li>
                <a href="#sale" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Khuyến mãi
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 tracking-wider">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#contact" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#shipping" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a href="#returns" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Đổi trả hàng
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-rose-500 transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase mb-4 tracking-wider">Nhận tin mới</h4>
            <p className="text-gray-400 text-sm mb-4">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt!
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            {/* Copyright */}
            <p className="text-center md:text-left">
              © 2025 NyNa House Store. All rights reserved.
            </p>

            {/* Legal Links */}
            <ul className="flex gap-6">
              <li>
                <a href="#privacy" className="hover:text-rose-500 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-rose-500 transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;