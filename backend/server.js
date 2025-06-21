require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fileManager = require('./utils/filemanager');
const { dataOperationErrorHandler } = require('./middleware/backup');

//import routes
const truckRoutes = require('./routes/trucks');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const contactRoutes = require('./routes/contact');

//initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// environment configuration
const isDevelopment = process.env.NODE_ENV != 'production';

//security middlware

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: null
        }
    }
}));

// CORS config
const corsOptions = {
    origin: isDevelopment
        ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost']
        : process.env.CORS_ORIGIN?.split(',') || ['http://localhost'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// session middleware for authentication
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public')));




//health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'BHB Truck Sales API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: require('./package.json').version
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', authRoutes); // for login page
app.use('/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/contact', contactRoutes);


//API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'BHB Truck Sales API',
        version: require('./package.json').version,
        endpoints: {
            trucks: {
                'GET /api/trucks': 'Get all trucks (contains optional filters',
                'GET /api/trucks/:id': 'Get single truck by ID',
                'POST /api/trucks/:id': 'Create new truck (admin only)',
                'PUT /api/trucks/:id': 'Update truck (admin only)',
                'DELETE /api/trucks/:id': 'Delete truck (admin only)',
                'PATCH /api/trucks/:id/toggle': 'Toggle truck status (admin only)'
            },
            utility: {
                'GET /api/health': 'API health check',
                'GET /api': 'API documentation'
            }
        },
        filters: {
            // example of filters
            trucks: ['available=true', 'featured=true', 'condition=New|Used|Certified', 'make=WESTERN STAR', 'year=2025']
        }
    });
});

//404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// global error handler
app.use(dataOperationErrorHandler);

// generic error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    res.status(500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
});

// graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

//initialize server
const startServer = async () => {
    try {

        //cehck required vars
        if (!process.env.SESSION_SECRET) {
            throw new Error('SESSION_SECRET environment variable is required');

        }
        if (!process.env.ADMIN_PASSWORD) {
            throw new Error('ADMIN_PASSWORD environment variable is required');
        }
        // ensure data directories exist
        await fileManager.ensureDirectories();

        //verify trucks.json exists and is valid
        try {
            await fileManager.getTrucks();
            console.log('Trucks data file verified');
        } catch (error) {
            console.log('Trucks data file issue:', error.message);
            console.log('Creating default trucks.json file...');

            //create defualt trucks json file
            const defaultTrucksData = {
                trucks: [],
                lastUpdated: new Date().toISOString()
            };
            await fileManager.saveTrucks(defaultTrucksData);
            console.log('Default trucks.json created');
        }

        // start server
        const server = app.listen(PORT, () => {
            console.log('🚛 BHB Truck Sales API Server Started');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            //console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
            console.log(`📋 Admin Dashboard: http://localhost:${PORT}/admin`);
            console.log(`🔐 Admin Login: http://localhost:${PORT}/admin/login`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🚚 Trucks Endpoint: http://localhost:${PORT}/api/trucks`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
        return server;
    } catch (error) {
        console.error('FAILED to start server:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;