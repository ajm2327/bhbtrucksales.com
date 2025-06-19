const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { requireAuth } = require('../middleware/auth');
const { fileExists } = require('../utils/filemanager');
const router = express.Router();

// configure multer for image uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const truckId = req.params.truckId || 'temp';
        const uploadPath = path.join(__dirname, '../uploads/trucks', truckId);

        try {
            await fs.ensureDir(uploadPath);
            cb(null, uploadPath);

        } catch (error) {
            console.error('Error creating upload directory:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        //generate unique filname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uploadPath);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        //check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
        }

    }
});

//POST /api/uploads/truck-images/:truckId - upload images for a truck
router.post('/truck-images/:truckId', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const { truckId } = req.params;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded',
                code: 'NO_FILES'
            });
        }

        //process uploaded files
        const uploadedImages = req.files.map((file, indedx) => ({
            url: `/uploads/trucks/${truckId}/${file.filename}`,
            caption: req.body.captions ? req.body.captions[index] || `Image ${index + 1}` : `Image ${index + 1}`,
            isPrimary: index === 0 && (!req.body.primaryIndex || req.body.primaryIndex == index),
            filename: file.filename,
            originalName: file.originalName,
            size: file.size
        }));

        res.json({
            success: true,
            data: {
                images: uploadedImages,
                count: uploadedImages.length
            },
            message: `Successfully uploaded ${uploadedImages.length} image(s)`
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload images',
            code: 'UPLOAD_ERROR'
        });
    }
});

//GET /api/uploads/truck-mages/:truckId - list images for a truck
router.get('/truck-images/:truckId', requireAuth, async (req, res) => {
    try {
        const { truckId } = req.params;
        const imagesPath = path.join(__dirname, '..uploads/trucks', truckId);

        if (!await fs.pathExists(imagesPath)) {
            return res.json({
                success: true,
                data: { images: [] },
                message: 'No images found'
            });
        }

        const files = await fs.readdir(imagesPath);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        const images = await Promise.all(imageFiles.map(async (file) => {
            const filePath = path.join(imagesPath, file);
            const stats = await fs.stat(filePath);

            return {
                url: `/uploads/trucks/${truckId}/${file}`,
                filename: file,
                size: stats.size,
                uploadedAt: stats.birthtime
            };
        }));

        res.json({
            success: true,
            data: { images },
            message: `Found ${images.length} image(s)`
        });
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list images',
            code: 'LIST_ERROR'
        });
    }
});


// delete /api/uploads/truck-imagse/:truckId/:filename - delete specific image

router.delete('/truck-images/:truckId/:filename', requireAuth, async (req, res) => {
    try {
        const { truckId, filename } = req.params;

        //validate filename to prevent path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename',
                code: 'INVALID_FILENAME'
            });
        }

        const filePath = path.join(__dirname, '../uploads/trucks', truckId, filename);

        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Image not found',
                code: 'NOT_FOUND'
            });
        }

        await fs.remove(filePath);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image',
            code: 'DELETE_ERROR'
        });
    }
});


//DELETE /api/uploads/truck-images/:truckId - delete all images for a truck
router.delete('/truck-images/:truckId', requireAuth, async (req, res) => {
    try {
        const { truckId } = req.params;
        const imagesPath = path.join(__dirname, '../uploads/trucks', truckId);

        if (await fs.pathExists(imagesPath)) {
            await fs.remove(imagesPath);
        }

        res.json({
            success: true,
            message: 'All images deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting truck images:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete images',
            code: 'DELETE_ERROR'
        });
    }
});


router.post('/general', requireAuth, upload.array('images', 5), async (req, res) => {
    try {
        if (!res.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded',
                code: 'NO_FILES'
            });
        }

        const generalPath = path.join(__dirname, '../uploads/general');
        await fs.ensureDir(generalPath);

        const uploadedFiles = [];

        for (const file of req.files) {
            const newPath = path.join(generalPath, file.filename);
            await fs.move(file.path, newPath);

            uploadedFiles.push({
                url: `/uploads/general/${file.filename}`,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size
            });
        }

        res.json({
            success: true,
            data: { files: uploadedFiles },
            message: `Successfully uploaded ${uploadedFiles.length} file(s)`
        });
    } catch (error) {
        console.error('General upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload files',
            code: 'UPLOAD_ERROR'
        });
    }
});


// error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum file size is 10MB per file.',
                code: 'FILE_TOO_LARGE'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 10 files per upload.',
                code: 'TOO_MANY_FILES'
            });
        }
    }

    if (error.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            error: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }

    console.error('Upload error:', error);
    res.status(500).json({
        success: false,
        error: 'Upload failed',
        code: 'UPLOAD_ERROR'
    });
});

module.exports = router;