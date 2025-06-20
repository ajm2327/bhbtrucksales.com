const { body, param, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array(),
            timestamp: new Date().toISOString()
        });
    }
    next();
};

// Truck validation rules - minimal validation for flexibility
const truckValidationRules = () => {
    return [
        // Core required fields for ID generation only
        body('year')
            .isInt({ min: 1800, max: 2100 })
            .withMessage('Year must be a valid number'),

        body('make')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Make is required'),

        body('model')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Model is required'),

        body('stockNumber')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Stock number is required'),

        body('modelCode')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Model code must be less than 50 characters'),

        body('condition')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Condition must be less than 50 characters'),

        body('vinNumber')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('VIN must be less than 50 characters'),

        body('price')
            .optional()
            .isLength({ max: 50 })
            .withMessage('Price must be a positive number'),

        body('isAvailable')
            .optional()
            .isBoolean()
            .withMessage('isAvailable must be true or false'),

        body('isFeatured')
            .optional()
            .isBoolean()
            .withMessage('isFeatured must be true or false'),

        // All specs optional with generous limits
        body('engine')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Engine info too long'),

        body('transmission')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Transmission info too long'),

        body('drivetrain')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Drivetrain info too long'),

        body('exteriorColor')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Exterior color too long'),

        body('interiorColor')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Interior color too long'),

        body('overview')
            .optional()
            .trim()
            .isLength({ max: 5000 })
            .withMessage('Overview too long'),

        // Images validation - basic structure only
        body('images')
            .optional()
            .isArray()
            .withMessage('Images must be an array'),

        body('images.*.url')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Image URL too long'),

        body('images.*.caption')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Image caption too long'),

        body('images.*.isPrimary')
            .optional()
            .isBoolean()
            .withMessage('isPrimary must be true or false'),

        // Specifications - all optional, generous limits
        body('specifications')
            .optional()
            .isObject()
            .withMessage('Specifications must be an object'),

        // Allow any specification fields with reasonable text limits
        body('specifications.**')
            .optional()
            .custom((value) => {
                if (typeof value === 'string' && value.length > 1000) {
                    throw new Error('Specification text too long');
                }
                return true;
            })
    ];
};

// Truck ID validation
const truckIdValidation = () => {
    return [
        param('id')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Truck ID is required and must be valid')
    ];
};

// Update validation (allows partial updates)
const truckUpdateValidationRules = () => {
    return [
        // Core fields optional for updates
        body('year')
            .optional()
            .isInt({ min: 1800, max: 2100 })
            .withMessage('Year must be a valid number'),

        body('make')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Make must be less than 100 characters'),

        body('model')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Model must be less than 100 characters'),

        body('stockNumber')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Stock number must be less than 50 characters'),

        // All other fields same as create validation but optional
        body('modelCode')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Model code must be less than 50 characters'),

        body('condition')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Condition must be less than 50 characters'),

        body('price')
            .optional()
            .isLength({ max: 50 })
            .withMessage('Price must be a positive number'),

        body('overview')
            .optional()
            .trim()
            .isLength({ max: 5000 })
            .withMessage('Overview too long'),

        // Specification wildcard for flexibility
        body('specifications.**')
            .optional()
            .custom((value) => {
                if (typeof value === 'string' && value.length > 1000) {
                    throw new Error('Specification text too long');
                }
                return true;
            })
    ];
};

module.exports = {
    truckValidationRules,
    truckUpdateValidationRules,
    truckIdValidation,
    handleValidationErrors
};