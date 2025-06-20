const express = require('express');
const router = express.Router();
const fileManager = require('../utils/filemanager');
const { requireAuth } = require('../middleware/auth');
const {
    truckValidationRules,
    truckUpdateValidationRules,
    truckIdValidation,
    handleValidationErrors
} = require('../middleware/validation');

const { autoBackup, auditLog } = require('../middleware/backup');

//Generate truck ID based on truck data
const generateTruckId = (truck) => {
    const base = `${truck.year}-${truck.make}-${truck.model}`;
    const suffix = truck.stockNumber || truck.vinNumber || Date.now();
    return `${base}-${suffix}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// helper function to standardize success response
const successResponse = (res, data, message = 'Operation successful') => {
    res.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    });
};

// standardized error response function
const errorResponse = (res, statusCode, error, code = 'ERROR') => {
    res.status(statusCode).json({
        success: false,
        error,
        code,
        timestamp: new Date().toISOString()
    });
}

// GET /api/trucks - get all trucks (public)
router.get('/', auditLog, async (req, res) => {
    try {
        const trucksData = await fileManager.getTrucks();

        const activeTrucks = trucksData.trucks.filter(truck => truck.isActive);

        let filteredTrucks = activeTrucks;

        const { available, featured, condition, make, year } = req.query;

        if (available === 'true') {
            filteredTrucks = filteredTrucks.filter(truck => truck.isAvailable);
        }

        if (featured === 'true') {
            filteredTrucks = filteredTrucks.filter(truck => truck.isFeatured);
        }

        if (condition) {
            filteredTrucks = filteredTrucks.filter(truck =>
                truck.condition.toLowerCase() === condition.toLowerCase()
            );
        }

        if (make) {
            filteredTrucks = filteredTrucks.filter(truck =>
                truck.make.toLowerCase().includes(make.toLowerCase())
            );
        }

        if (year) {
            filteredTrucks = filteredTrucks.filter(truck =>
                truck.year === parseInt(year)
            );
        }

        successResponse(res, {
            trucks: filteredTrucks,
            total: filteredTrucks.length,
            lastUpdated: trucksData.lastUpdated
        });
    } catch (error) {
        console.error('Error fetching trucks: ', error);
        errorResponse(res, 500, 'Failed to fetch trucks', 'FETCH_ERROR');
    }
});

// site settings 
//get /api/trucks/site-settings - get site settings (public)
router.get('/site-settings', auditLog, async (req, res) => {
    try {
        const siteSettings = await fileManager.getSiteSettings();
        successResponse(res, siteSettings);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        errorResponse(res, 500, 'Failed to fetch site settings', 'FETCH_ERROR');
    }
});

// put /api/trucks/site-settings  update site settings (ADMIN ONLY)
router.put('/site-settings',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    async (req, res) => {
        try {
            await fileManager.saveSiteSettings(req.body);
            successResponse(res, req.body, 'Site settings updated successfully');
        } catch (error) {
            console.error('Error updating site settings:', error);
            errorResponse(res, 500, 'Failed to update site settings', 'UPDATE_ERROR');
        }
    }
);

// GET /api/trucks/about-page - get about page content (public)
router.get('/about-page', auditLog, async (req, res) => {
    try {
        const aboutPage = await fileManager.getAboutPage();
        successResponse(res, aboutPage);

    } catch (error) {
        console.error('Error fetching about page:', error);
        errorResponse(res, 500, 'Failed to fetch about page', 'FETCH_ERROR');
    }
});

// PUT /api/trucks/about-page - UPDATE about page content (ADMIN ONLY)
router.put('/about-page',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    async (req, res) => {
        try {
            await fileManager.saveAboutPage(req.body);
            successResponse(res, req.body, 'About page updated successfully');

        } catch (error) {
            console.error('Error updating about page:', error);
            errorResponse(res, 500, 'Failed to update about page', 'UPDATE_ERROR');
        }
    }
);

// GET /api/trucks/:id - Get single truck (public)
router.get('/:id', truckIdValidation(), handleValidationErrors, auditLog, async (req, res) => {
    try {
        const truck = await fileManager.getTruckById(req.params.id);

        if (!truck) {
            return errorResponse(res, 404, 'Truck not found', 'NOT_FOUND');
        }

        if (!truck.isActive) {
            return errorResponse(res, 404, 'Truck not found', 'NOT_FOUND');
        }

        successResponse(res, truck);
    } catch (error) {
        console.error('Error fetching truck: ', error);
        errorResponse(res, 500, 'Failed to fetch truck', 'FETCH_ERROR');
    }
});

// POST /api/trucks - create new truck (ADMIN ONLY)
router.post('/',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    truckValidationRules(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const trucksData = await fileManager.getTrucks();

            //generate id for new truck
            const newTruckId = generateTruckId(req.body);

            //check if truck Id already exists
            const existingTruck = trucksData.trucks.find(truck => truck.id === newTruckId);
            if (existingTruck) {
                return errorResponse(res, 409, 'Truck with this combination already exists', 'DUPLICATE_TRUCK');
            }

            const newTruck = {
                id: newTruckId,
                ...req.body,
                images: req.body.images || [],
                isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
                isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
                dateAdded: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                isActive: true
            };

            //add to trucks array
            trucksData.trucks.push(newTruck);

            //save to file
            await fileManager.saveTrucks(trucksData);

            successResponse(res, newTruck, 'Truck created successfully');

        } catch (error) {
            console.error('Error creating truck:', error);
            errorResponse(res, 500, 'Failed to create truck', 'CREATE_ERROR');
        }
    }
);

// PUT /api/trucks/:id - update truck (ADMIN ONLY)
router.put('/:id',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    truckIdValidation(),
    truckUpdateValidationRules(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const trucksData = await fileManager.getTrucks();
            const truckIndex = trucksData.trucks.findIndex(truck => truck.id === req.params.id);

            if (truckIndex === -1) {
                return errorResponse(res, 404, 'Truck not found', 'NOT_FOUND');
            }

            // if stock number, check if unique
            if (req.body.stockNumber) {
                const existingStock = trucksData.trucks.find(truck =>
                    truck.stockNumber === req.body.stockNumber && truck.id !== req.params.id
                );
                if (existingStock) {
                    return errorResponse(res, 409, 'Stock number already exists', 'DUPLICATE_STOCK');
                }
            }

            //update truck data
            const updatedTruck = {
                ...trucksData.trucks[truckIndex],
                ...req.body,
                lastModified: new Date().toISOString()
            };

            if (req.body.year || req.body.make || req.body.model || req.body.stockNumber) {
                const newId = generateTruckId(updatedTruck);
                if (newId !== updatedTruck.id) {
                    //check if new ID conflicts
                    const existingNewId = trucksData.trucks.find(truck => truck.id === newId);
                    if (existingNewId) {
                        return errorResponse(res, 409, 'Updated truck data conflicts with existing trucks', 'ID_CONFLICT');
                    }
                    updatedTruck.id = newId;
                }
            }

            trucksData.trucks[truckIndex] = updatedTruck;

            //save to file
            await fileManager.saveTrucks(trucksData);

            successResponse(res, updatedTruck, 'Truck updated successfully');
        } catch (error) {
            console.error('Error updating truck:', error);
            errorResponse(res, 500, 'Failed to update truck', 'UPDATE_ERROR');
        }
    }
);

//DELETE /api/trucks/:id - Delete truck (ADMIN ONLY)
router.delete('/:id',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    truckIdValidation(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const trucksData = await fileManager.getTrucks();
            const truckIndex = trucksData.trucks.findIndex(truck => truck.id === req.params.id);

            if (truckIndex === -1) {
                return errorResponse(res, 404, 'Truck not found', 'NOT_FOUND');
            }

            //remove truck from array
            const deletedTruck = trucksData.trucks.splice(truckIndex, 1)[0];

            // save file
            await fileManager.saveTrucks(trucksData);

            successResponse(res, { deletedTruck }, 'Truck deleted successfully');
        } catch (error) {
            console.error('Error deleting truck:', error);
            errorResponse(res, 500, 'Failed to delete truck', 'DELETE_ERROR');
        }
    }
);

// PATCH /api/trucks/:id/toggle = toggle truck availability or featured status (ADMIN ONLY)
router.patch('/:id/toggle',
    requireAuth,
    autoBackup('trucks.json'),
    auditLog,
    truckIdValidation(),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { field } = req.body; //available, featured or active

            if (!['available', 'featured', 'active'].includes(field)) {
                return errorResponse(res, 400, 'Invalid field. Must be available, featured, or active', 'INVALID_FIELD');
            }

            const trucksData = await fileManager.getTrucks();
            const truckIndex = trucksData.trucks.findIndex(truck => truck.id === req.params.id);

            if (truckIndex === -1) {
                return errorResponse(res, 404, 'Truck not found', 'NOT_FOUND');
            }

            const fieldMap = {
                'available': 'isAvailable',
                'featured': 'isFeatured',
                'active': 'isActive'
            };

            const fieldName = fieldMap[field];

            //toggle boolean field
            trucksData.trucks[truckIndex][fieldName] = !trucksData.trucks[truckIndex][fieldName];
            trucksData.trucks[truckIndex].lastModified = new Date().toISOString();

            // save to file
            await fileManager.saveTrucks(trucksData);

            successResponse(res, {
                id: req.params.id,
                field: fieldName,
                newValue: trucksData.trucks[truckIndex][fieldName]
            }, `Truck ${field} status toggled successfully`);
        } catch (error) {
            console.error('Error toggling truck status:', error);
            errorResponse(res, 500, 'Failed to toggle truck status', 'TOGGLE_ERROR');
        }
    }
);

module.exports = router;