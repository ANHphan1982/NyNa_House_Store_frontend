// Mock Products Data
export const INITIAL_PRODUCTS = [
  { 
    id: 1, 
    name: 'Đồng Hồ Bạc Tối Giản', 
    category: 'Mỹ phẩm', 
    price: 1200000, 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', 
    description: 'Chiếc đồng hồ bạc tối giản mang lại vẻ đẹp thanh lịch và sang trọng.',
    rating: 4.5,
    reviews: 128,
    sizes: ['38mm', '42mm', '45mm'],
    stock: 15
  },
  { 
    id: 2, 
    name: 'Túi Xách Da Nâu', 
    category: 'Quần áo', 
    price: 4500000, 
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', 
    description: 'Túi xách da thật màu nâu bò, được gia công tỉ mỉ từng đường kim mũi chỉ.',
    rating: 4.8,
    reviews: 256,
    sizes: ['M', 'L'],
    stock: 8
  },
  { 
    id: 3, 
    name: 'Kính Mát Designer', 
    category: 'Tiêu dùng', 
    price: 890000, 
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80', 
    description: 'Kính mát thời trang với khả năng chống tia UV 100%.',
    rating: 4.3,
    reviews: 89,
    sizes: ['One Size'],
    stock: 23
  },
  { 
    id: 4, 
    name: 'Giày Sneaker Trắng', 
    category: 'Giày dép', 
    price: 1500000, 
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80', 
    description: 'Đôi sneaker trắng tinh khôi, dễ dàng phối hợp với mọi loại trang phục.',
    rating: 4.7,
    reviews: 342,
    sizes: ['39', '40', '41', '42', '43'],
    stock: 30
  },
  { 
    id: 5, 
    name: 'Set Rau Củ Hữu Cơ', 
    category: 'Thực phẩm', 
    price: 300000, 
    image: 'https://images.unsplash.com/photo-1615485290385-2593dee08ce8?auto=format&fit=crop&w=400&q=80', 
    description: 'Bộ sản phẩm rau củ quả hữu cơ tươi ngon, được thu hoạch trong ngày.',
    rating: 4.6,
    reviews: 167,
    sizes: ['1kg', '2kg', '5kg'],
    stock: 50
  },
  { 
    id: 6, 
    name: 'Áo Khoác Măng Tô', 
    category: 'Quần áo', 
    price: 2100000, 
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80', 
    description: 'Áo khoác măng tô dáng dài, chất liệu dạ cao cấp giữ ấm cực tốt.',
    rating: 4.9,
    reviews: 412,
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12
  },
];

// Categories
export const CATEGORIES = ['Tất cả', 'Quần áo', 'Giày dép', 'Mỹ phẩm', 'Thực phẩm', 'Tiêu dùng'];

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};