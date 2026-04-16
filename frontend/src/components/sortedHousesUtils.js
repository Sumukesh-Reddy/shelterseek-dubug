const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const PLACEHOLDER = '/images/default-house.jpg';

export function processImagePaths(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return [PLACEHOLDER];
  }

  return images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return `${API_BASE}${img}`;
      // ObjectId OR filename — both served by /api/images/:id
      if (img.length > 0) return `${API_BASE}/api/images/${img}`;
    }
    return PLACEHOLDER;
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