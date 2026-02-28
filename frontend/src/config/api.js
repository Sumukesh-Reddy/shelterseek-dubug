// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    GOOGLE: `${API_BASE_URL}/auth/google`,
    STATUS: `${API_BASE_URL}/auth/status`,
  },
  
  // User endpoints
  USERS: {
    COUNTS: `${API_BASE_URL}/api/users/counts`,
    NEW_CUSTOMERS: `${API_BASE_URL}/api/users/new-customers`,
    HOSTS: `${API_BASE_URL}/api/users/hosts`,
    GET_BY_EMAIL: (email) => `${API_BASE_URL}/api/users/${email}`,
    ALL: `${API_BASE_URL}/api/users`,
    LIKED_ROOMS: `${API_BASE_URL}/api/users/traveler/liked-rooms`,
    VIEWED_ROOMS: `${API_BASE_URL}/api/users/traveler/viewed-rooms`,
    CLEAR_HISTORY: `${API_BASE_URL}/api/users/traveler/clear-history`,
    PROFILE_UPDATE: `${API_BASE_URL}/api/users/profile`,
  },
  
  // Room endpoints
  ROOMS: {
    ALL: `${API_BASE_URL}/api/rooms`,
    COUNT: `${API_BASE_URL}/api/rooms/count`,
    HOST: (email) => `${API_BASE_URL}/api/rooms/host/${email}`,
    IMAGES: (id) => `${API_BASE_URL}/api/rooms/images/${id}`,
    LISTINGS: `${API_BASE_URL}/api/rooms/listings`,
    LISTING_BY_ID: (id) => `${API_BASE_URL}/api/rooms/listings/${id}`,
    STATUS_UPDATE: (id) => `${API_BASE_URL}/api/rooms/listings/${id}/status`,
    BOOK: (id) => `${API_BASE_URL}/api/rooms/${id}/book`,
    QR: (id) => `${API_BASE_URL}/api/rooms/${id}/qr`,
  },
  
  // Booking endpoints
  BOOKINGS: {
    SUMMARY: `${API_BASE_URL}/api/bookings/summary`,
    STATS: `${API_BASE_URL}/api/bookings/stats`,
    REVENUE: `${API_BASE_URL}/api/bookings/revenue`,
    CREATE: `${API_BASE_URL}/api/bookings`,
    HISTORY: `${API_BASE_URL}/api/bookings/history`,
    HOST: `${API_BASE_URL}/api/bookings/host`,
    TRAVELER: (email) => `${API_BASE_URL}/api/bookings/traveler/${email}`,
    HOST_ANALYTICS: `${API_BASE_URL}/api/bookings/analytics/host`,
  },
  
  // Chat endpoints
  CHAT: {
    ROOM: `${API_BASE_URL}/api/chat/room`,
    ROOMS: `${API_BASE_URL}/api/chat/rooms`,
    ROOM_BY_ID: (id) => `${API_BASE_URL}/api/chat/room/${id}`,
    MESSAGES: (id) => `${API_BASE_URL}/api/chat/messages/${id}`,
    SEARCH_USERS: `${API_BASE_URL}/api/chat/users/search`,
    TEST_MESSAGE: `${API_BASE_URL}/api/chat/test-message`,
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard/stats`,
    RECENT_ACTIVITIES: `${API_BASE_URL}/api/admin/recent-activities`,
    TRENDS: `${API_BASE_URL}/api/admin/trends`,
    ERROR_LOGS: `${API_BASE_URL}/api/admin/error-logs`,
    DELETE_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
  },
  
  // AI Chat endpoint
  AI_CHAT: `${API_BASE_URL}/api/ai/chat`,
  
  // Image endpoint
  IMAGES: (id) => `${API_BASE_URL}/api/images/${id}`,
};

export default API_BASE_URL;