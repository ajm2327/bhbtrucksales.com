/**
 * Simple session-based authentication middleware
 */

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }

    // If it's an API request, return JSON error
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        });
    }

    // If it's a web request, redirect to login
    res.redirect('/admin/login');
};

// Middleware to check auth status without redirecting
const checkAuth = (req, res, next) => {
    req.isAuthenticated = !!(req.session && req.session.authenticated);
    next();
};

// Middleware to log authentication events
const authLog = (action, success, userAgent = 'Unknown') => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    console.log(`[${timestamp}] AUTH ${action.toUpperCase()} ${status} - User-Agent: ${userAgent}`);
};

module.exports = {
    requireAuth,
    checkAuth,
    authLog
};