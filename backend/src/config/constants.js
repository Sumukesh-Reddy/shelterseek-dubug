module.exports = {
    // User roles
    USER_ROLES: {
      TRAVELER: 'traveller',
      HOST: 'host',
      ADMIN: 'admin'
    },
  
    // Room status
    ROOM_STATUS: {
      PENDING: 'pending',
      VERIFIED: 'verified',
      REJECTED: 'rejected',
      APPROVED: 'approved'
    },
  
    // Booking status
    BOOKING_STATUS: {
      CONFIRMED: 'confirmed',
      PENDING: 'pending',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      CHECKED_IN: 'checked_in',
      CHECKED_OUT: 'checked_out'
    },
  
    // Payment status
    PAYMENT_STATUS: {
      PENDING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded'
    },
  
    // Payment methods
    PAYMENT_METHODS: {
      CREDIT_CARD: 'credit_card',
      DEBIT_CARD: 'debit_card',
      UPI: 'upi',
      NET_BANKING: 'net_banking',
      WALLET: 'wallet'
    },
  
    // Message types
    MESSAGE_TYPES: {
      TEXT: 'text',
      IMAGE: 'image',
      FILE: 'file'
    },
  
    // OTP expiry (10 minutes)
    OTP_EXPIRY: 10 * 60 * 1000,
  
    // JWT expiry
    JWT_EXPIRY: '90d',
  
    // Pagination defaults
    PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 20,
      MAX_LIMIT: 100
    },
  
    // File upload limits
    UPLOAD: {
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
      MAX_FILES: 12,
      ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
  
    // Rate limiting
    RATE_LIMIT: {
      API: { max: 100, window: 60 * 60 * 1000 }, // 100 per hour
      AUTH: { max: 10, window: 60 * 60 * 1000 }, // 10 per hour
      AI_CHAT: { max: 30, window: 60 * 60 * 1000 } // 30 per hour
    },
  
    // Popular locations for search
    POPULAR_LOCATIONS: {
      hyderabad: ['hyderabad', 'hyd'],
      chitoor: ['chittoor', 'chittor'],
      sricity: ['sri city', 'sri-city'],
      goa: ['north goa', 'south goa', 'panaji', 'calangute', 'baga'],
      mumbai: ['bandra', 'colaba', 'juhu', 'andheri', 'navi mumbai']
    },
  
    // Search patterns for AI
    SEARCH_PATTERNS: {
      budget: ['cheap', 'affordable', 'economy', 'low cost', 'inexpensive'],
      luxury: ['premium', 'deluxe', '5-star', 'high-end', 'exclusive'],
      hostel: ['dormitory', 'backpacker'],
      resort: ['vacation', 'holiday'],
      apartment: ['flat', 'unit'],
      family: ['kids', 'children', 'large', 'spacious'],
      pool: ['swimming', 'jacuzzi', 'hot tub'],
      wifi: ['internet', 'connection', 'online'],
      breakfast: ['meal', 'food', 'dining']
    },
  
    // Email templates
    EMAIL_TEMPLATES: {
      OTP: 'otp',
      BOOKING_CONFIRMATION: 'booking_confirmation',
      PASSWORD_RESET: 'password_reset'
    },
  
    // Database collections
    COLLECTIONS: {
      USERS: 'LoginData',
      ROOMS: 'RoomData',
      ROOMS_TRAVELER: 'RoomDataTraveler',
      BOOKINGS: 'bookings',
      MESSAGES: 'messages',
      CHAT_ROOMS: 'chatrooms',
      SESSIONS: 'sessions'
    },
  
    // GridFS buckets
    GRIDFS_BUCKETS: {
      IMAGES: 'images',
      DOCUMENTS: 'documents'
    }
  };