import React from 'react';

const Hero = () => {
  return (
    <div className="relative h-[350px] md:h-[450px] bg-gray-900 flex items-center justify-center overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80" 
        alt="Store" 
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative z-10 text-center text-white px-4">
        <h2 className="text-sm md:text-lg font-light tracking-widest mb-2 md:mb-3 uppercase">
          NyNa House Store
        </h2>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-primary mb-4 md:mb-6">
          Phong Cách - Chất lượng - Giá rẻ nhất
        </h1>
        <button className="px-6 py-2 md:px-8 md:py-3 bg-white text-gray-900 font-semibold text-xs md:text-sm tracking-widest hover:bg-gray-100 transition-colors uppercase">
          Khám Phá Ngay
        </button>
      </div>
    </div>
  );
};

export default Hero;