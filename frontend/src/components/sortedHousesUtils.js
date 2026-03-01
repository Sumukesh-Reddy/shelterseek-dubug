export function processImagePaths(images) {
  const placeholder = ".../public/images/photo1.png"; // Adjust path as needed
  
  if (!Array.isArray(images)) {
    return [placeholder];
  }
  
  return images.map(img => {
    if (typeof img === 'string') {
      // Already processed URL
      if (img.startsWith('http') || img.startsWith('/')) {
        return img;
      }
      // ObjectId format
      if (/^[0-9a-fA-F]{24}$/.test(img)) {
        return `/api/images/${img}`;
      }
    }
    return placeholder;
  });
}

export function categorizeSize(size) {
  const sizes = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  };
  return sizes[size.toLowerCase()] || 'Medium';
}

export function formatCurrency(number) {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR' 
  }).format(number);
}