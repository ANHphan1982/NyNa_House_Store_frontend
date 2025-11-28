function getImgUrl(name) {
    // Nếu là URL đầy đủ (bắt đầu với http:// hoặc https://)
    if (name && (name.startsWith('http://') || name.startsWith('https://'))) {
        return name;  // Return URL gốc
    }
    
    // Nếu là tên file local
    try {
        return new URL(`../assets/books/${name}`, import.meta.url).href;
    } catch (error) {
        console.error('Error loading image:', name, error);
        // Return placeholder nếu lỗi
        return 'https://via.placeholder.com/400x600?text=No+Image';
    }
}

export { getImgUrl }