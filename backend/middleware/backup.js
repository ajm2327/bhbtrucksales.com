const fileManager = require('../utils/filemanager');

/**
 * Middleware to create automatic backups before write operations
 * This runs before any PUT, POST, DELETE operations on data fies
 */

const autoBackup = (filename = 'trucks.json') => {
    return async (req, res, next) => {
        try {
            //only backup for write operations
            if (['POST', 'PUT', 'DELETE', 'PATCh'].includes(req.method)) {
                console.log(`Creating automatic backup for ${filename} before ${req.method} operation`);
                await fileManager.createBackup(filename);
            }
            next();
        } catch (error) {
            console.error('Backup middleware error:', error);
            // just log request
            next();
        }
    };
};

/**
 * Middleware to log data ops for audit trail
 */

const auditLog = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const operation = `${req.method} ${req.originalUrl}`;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`[${timestamp}] Data Operation: ${operation} - User-Agent: ${userAgent}`);

    res.locals.auditInfo = {
        timestamp,
        operation,
        userAgent,
        body: req.body,
        params: req.params
    };

    next();
};

/**
 * Error handler for data operations
 * Logs detailed error information for debugging
 */

const dataOperationErrorHandler = (error, req, res, next) => {
    const auditInfo = res.locals.auditInfo || {};

    console.error('Data Operation Error:', {
        error: error.message,
        stack: error.stack,
        operation: auditInfo.operation,
        timestamp: auditInfo.timestamp,
        body: auditInfo.body,
        params: auditInfo.params
    });

    if (error.message.includes('not found')) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found',
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString()
        });
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid request data',
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString()
        });
    }

    res.status(500).json({
        success: false,
        error: 'Internal server error occurred',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString()
    });
};

/**
 * Middleware to vverify data integrity after write operations
 */

const verifyDataIntegrity = (filename = 'trucks.json') => {
    return async (req, res, next) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            try {
                await fileManager.readJSON(filename);
                console.log(`Data integrity verified for ${filename}`);
            } catch (error) {
                console.error(`Data integrity check failed for ${filename}:`, error);
                return res.status(500).json({
                    success: false,
                    error: 'Data corruption detected. Please contact administrator.',
                    code: 'DATA_CORRUPTION',
                    timestamp: new Date().toISOString()
                });
            }
        }
        next();
    };
};

module.exports = {
    autoBackup,
    auditLog,
    dataOperationErrorHandler,
    verifyDataIntegrity
};