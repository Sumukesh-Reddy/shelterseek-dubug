const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const mkdirp = require('mkdirp');
const http = require('http');

const { errorLogger } = require('./utils/logger');
const { initializeConnections } = require('./config/database');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const server = http.createServer(app);

// Create uploads directory
const uploadsDir = path.join(__dirname, '../public/uploads');
mkdirp.sync(uploadsDir);

// ========== SOCKET.IO SETUP - MUST BE FIRST ==========
const { Server } = require('socket.io');
const setupSocket = require('./sockets/chatSocket');

console.log('🔌 Initializing Socket.IO...');

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  path: '/socket.io/',
  transports: ['polling', 'websocket'], // Polling first, then websocket
  allowEIO3: true,
  serveClient: false,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
  allowUpgrades: true,
  cookie: false
});

// Initialize Socket.IO
setupSocket(io);
app.set('io', io);

console.log('✅ Socket.IO initialized');

// ========== DATABASE CONNECTIONS ==========
initializeConnections();

// ========== MIDDLEWARE ==========
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Logging
const logDirectory = path.join(__dirname, '../logs');
mkdirp.sync(logDirectory);

const accessLogStream = require('rotating-file-stream').createStream('access.log', {
  interval: '1d',
  path: logDirectory,
});
app.use(morgan('combined', { stream: accessLogStream }));

// Error logging middleware
app.use(errorLogger);

// Static files
app.use('/uploads', express.static(uploadsDir));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== ROUTES ==========
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test routes
app.get('/api/test/traveler-only', 
  require('./middleware/authMiddleware').authenticateToken, 
  require('./middleware/authMiddleware').roleMiddleware.travelerOnly, 
  (req, res) => {
    res.json({ success: true, message: 'Welcome traveler!', user: req.user.email });
});

app.get('/api/test/host-only', 
  require('./middleware/authMiddleware').authenticateToken, 
  require('./middleware/authMiddleware').roleMiddleware.hostOnly, 
  (req, res) => {
    res.json({ success: true, message: 'Welcome host!', user: req.user.email });
});

app.get('/api/test/admin-only', 
  require('./middleware/authMiddleware').authenticateToken, 
  require('./middleware/authMiddleware').roleMiddleware.adminOnly, 
  (req, res) => {
    res.json({ success: true, message: 'Welcome admin!', user: req.user.email });
});

app.get('/debug-env', (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER || 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? `Set (${process.env.EMAIL_PASS.length} chars)` : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
  });
});

// ❌ NO MIDDLEWARE BLOCKING SOCKET.IO - REMOVED COMPLETELY

// 404 handler - Let Socket.IO handle its own paths
app.all('*', (req, res, next) => {
  // If it's a Socket.IO path, just return 404 silently (Socket.IO will handle it)
  if (req.originalUrl.includes('/socket.io/')) {
    return res.status(404).end();
  }
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;