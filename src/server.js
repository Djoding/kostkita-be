require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const logger = require('./config/logger');
require('./config/passport');

const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(passport.initialize());

app.get('/health', async (req, res) => {
    try {
        const prisma = require('./config/database');
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);

app.get(`/api/${API_VERSION}`, (req, res) => {
    res.json({
        success: true,
        message: 'Kosan Management API',
        version: API_VERSION,
        documentation: {
            auth: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/auth`,
            users: `${req.protocol}://${req.get('host')}/api/${API_VERSION}/users`,
        },
        endpoints: [
            'POST /auth/register - Register new user',
            'POST /auth/login - Login user',
            'GET /auth/google - Google OAuth',
            'GET /auth/profile - Get user profile',
            'POST /auth/change-password - Change password',
            'GET /users - Get all users (Admin)',
            'GET /users/profile - Get current user profile',
            'PUT /users/profile - Update user profile',
            'GET /users/search - Search users',
        ]
    });
});

app.use(notFoundHandler);

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📖 API Documentation: http://localhost:${PORT}/api/${API_VERSION}`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info('HTTP server closed');

        try {
            const prisma = require('./config/database');
            await prisma.$disconnect();
            logger.info('Database connection closed');

            process.exit(0);
        } catch (error) {
            logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error('Forcing shutdown due to timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = app;