const express = require('express');
const router = express.Router();
const { requireAuth, checkAuth } = require('../middleware/auth');
const fileManager = require('../utils/filemanager');

// GET /admin - Main dashboard (require auth)
router.get('/', requireAuth, async (req, res) => {
    try {
        // Fetch trucks data
        const trucksData = await fileManager.getTrucks();
        const siteSettings = await fileManager.getSiteSettings();
        const aboutPage = await fileManager.getAboutPage();

        // Create HTML dashboard
        const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - BHB Truck Sales</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }

        .admin-header {
            background: #1e40af;
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .admin-header h1 {
            font-size: 1.5rem;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .truck-count {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #1e40af;
            color: white;
        }

        .btn-primary:hover {
            background: #1d4ed8;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        .btn-danger {
            background: #dc2626;
            color: white;
        }

        .btn-danger:hover {
            background: #b91c1c;
        }

        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }

        .admin-main {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .search-filter {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .search-filter input,
        .search-filter select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }

        .search-filter input:focus,
        .search-filter select:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .table-container {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .trucks-table {
            width: 100%;
            border-collapse: collapse;
        }

        .trucks-table th {
            background: #f1f5f9;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }

        .trucks-table td {
            padding: 1rem;
            border-bottom: 1px solid #f3f4f6;
        }

        .trucks-table tr:hover {
            background: #f8fafc;
        }

        .truck-image {
            width: 60px;
            height: 40px;
            object-fit: cover;
            border-radius: 0.25rem;
        }

        .truck-image-placeholder {
            width: 60px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .price-cell {
            font-weight: 600;
            color: #059669;
        }

        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-new { background: #dcfce7; color: #166534; }
        .status-used { background: #fef3c7; color: #92400e; }
        .status-available { background: #dbeafe; color: #1e40af; }
        .status-unavailable { background: #fee2e2; color: #dc2626; }
        .status-featured { background: #f3e8ff; color: #7c3aed; }

        .actions-cell {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: white;
            border-radius: 0.5rem;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #1e40af;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .image-upload {
            border: 2px dashed #d1d5db;
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: border-color 0.2s;
            background: #f9fafb;
        }

        .image-upload:hover {
            border-color: #1e40af;
            background: #eff6ff;
        }

        .image-upload.dragover {
            border-color: #1e40af;
            background: #eff6ff;
        }

        .image-preview {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .preview-item {
            position: relative;
            aspect-ratio: 4/3;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            overflow: hidden;
            background: #f3f4f6;
        }

        .preview-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .preview-controls {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            display: flex;
            gap: 0.25rem;
        }

        .preview-btn {
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            border-radius: 0.25rem;
            width: 1.5rem;
            height: 1.5rem;
            font-size: 0.75rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-btn:hover {
            background: rgba(0,0,0,0.9);
        }

        .primary-indicator {
            position: absolute;
            top: 0.25rem;
            left: 0.25rem;
            background: #059669;
            color: white;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.625rem;
            font-weight: 600;
        }

        .image-caption {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 0.25rem;
            font-size: 0.75rem;
        }

        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
        }

        .notification {
            position: fixed;
            top: 1rem;
            right: 1rem;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1100;
            min-width: 300px;
        }

        .notification.success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .notification.error {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .loading {
            opacity: 0.6;
            pointer-events: none;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #6b7280;
        }

        .empty-state h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .upload-progress {
            background: #e5e7eb;
            border-radius: 0.25rem;
            height: 0.5rem;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .upload-progress-bar {
            background: #059669;
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 0.25rem;
        }

        @media (max-width: 768px) {
            .admin-header {
                flex-direction: column;
                gap: 1rem;
            }

            .action-bar {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .trucks-table {
                font-size: 0.875rem;
            }

            .trucks-table th,
            .trucks-table td {
                padding: 0.5rem;
            }

            .image-preview {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            }
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <header class="admin-header">
        <h1>🚛 BHB Truck Sales Admin</h1>
        <div class="header-actions">
            <span class="truck-count" id="truckCount">${trucksData.trucks.length} trucks total</span>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="admin-main">
        <!-- Action Bar -->
        <div class="action-bar">
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary" onclick="openAddModal()">+ Add New Truck</button>
                <button class="btn btn-secondary" onclick="openSiteSettingsModal()">Site Settings</button>
                <button class="btn btn-secondary" onclick="openAboutPageModal()">About Page</button>
            </div>
            <div class="search-filter">
                <input type="text" placeholder="Search trucks..." id="searchInput" onkeyup="filterTrucks()">
                <select id="filterCondition" onchange="filterTrucks()">
                    <option value="">All Conditions</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Certified">Certified</option>
                </select>
                <select id="filterStatus" onchange="filterTrucks()">
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>
        </div>

        <!-- Trucks Table -->
        <div class="table-container">
            <table class="trucks-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Year</th>
                        <th>Make/Model</th>
                        <th>Stock #</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="trucksTableBody">
                    <!-- Populated by JavaScript -->
                </tbody>
            </table>
        </div>
    </main>

    <!-- Add/Edit Modal -->
    <div id="truckModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add New Truck</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form id="truckForm">
                <div class="modal-body">
                    <!-- Truck Form Section -->
                    <div id="truckFormSection">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="year">Year *</label>
                                <input type="number" id="year" name="year" required min="1900" max="2030">
                            </div>
                            <div class="form-group">
                                <label for="make">Make *</label>
                                <input type="text" id="make" name="make" required>
                            </div>
                            <div class="form-group">
                                <label for="model">Model *</label>
                                <input type="text" id="model" name="model" required>
                            </div>
                            <div class="form-group">
                                <label for="condition">Condition</label>
                                <select id="condition" name="condition">
                                    <option value="New">New</option>
                                    <option value="Used">Used</option>
                                    <option value="Certified">Certified</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="stockNumber">Stock Number</label>
                                <input type="text" id="stockNumber" name="stockNumber">
                            </div>
                            <div class="form-group">
                                <label for="vinNumber">VIN Number</label>
                                <input type="text" id="vinNumber" name="vinNumber">
                            </div>
                            <div class="form-group">
                                <label for="price">Price</label>
                                <input type="number" id="price" name="price">
                            </div>
                            <div class="form-group">
                                <label for="engine">Engine</label>
                                <input type="text" id="engine" name="engine">
                            </div>
                            <div class="form-group">
                                <label for="transmission">Transmission</label>
                                <input type="text" id="transmission" name="transmission">
                            </div>
                            <div class="form-group">
                                <label for="drivetrain">Drivetrain</label>
                                <input type="text" id="drivetrain" name="drivetrain">
                            </div>
                            <div class="form-group">
                                <label for="exteriorColor">Exterior Color</label>
                                <input type="text" id="exteriorColor" name="exteriorColor">
                            </div>
                            <div class="form-group">
                                <label for="interiorColor">Interior Color</label>
                                <input type="text" id="interiorColor" name="interiorColor">
                            </div>
                            <div class="form-group full-width">
                                <label for="overview">Overview</label>
                                <textarea id="overview" name="overview" placeholder="Detailed description of the truck..."></textarea>
                            </div>
                            
                            <!-- Image Upload Section -->
                            <div class="form-group full-width">
                                <label>Truck Images</label>
                                <div class="image-upload" onclick="triggerImageUpload()" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                                    <div style="pointer-events: none;">
                                        <div style="font-size: 2rem; margin-bottom: 1rem;">📸</div>
                                        <p><strong>Click to upload</strong> or drag and drop images here</p>
                                        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Supports JPG, PNG, GIF, WebP (max 10MB each)</p>
                                    </div>
                                    <input type="file" id="imageUpload" multiple accept="image/*" style="display: none;" onchange="handleImageUpload(event)">
                                </div>
                                <div class="image-preview" id="imagePreview">
                                    <!-- Images will be displayed here -->
                                </div>
                            </div>
                            
                            <div class="form-group full-width">
                                <label>Status Options</label>
                                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                                        <input type="checkbox" id="isAvailable" name="isAvailable" checked>
                                        Available for Sale
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                                        <input type="checkbox" id="isFeatured" name="isFeatured">
                                        Featured Truck
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Site Settings Section (initially hidden) -->
                    <div id="siteSettingsSection" style="display: none;">
                        <h3 style="margin-bottom: 1rem; font-size: 1.2rem; font-weight: 600;">Site Settings</h3>
                        
                        <!-- Announcement Management -->
                        <div class="form-group">
                            <label>Announcement Banner</label>
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                                    <input type="checkbox" id="announcementActive"> Active
                                </label>
                            </div>
                            <input type="text" id="announcementTitle" placeholder="Announcement title...">
                            <textarea id="announcementMessage" placeholder="Announcement message..." style="margin-top: 0.5rem;"></textarea>
                        </div>

                        <!-- Banner Management -->
                        <div class="form-group">
                            <label>Hero Banner Image</label>
                            <div class="image-upload" onclick="triggerBannerUpload()" ondrop="handleBannerDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
                                <div style="pointer-events: none;">
                                    <div style="font-size: 2rem; margin-bottom: 1rem;">🖼️</div>
                                    <p><strong>Click to upload banner image</strong></p>
                                </div>
                                <input type="file" id="bannerUpload" accept="image/*" style="display: none;" onchange="handleBannerUpload(event)">
                            </div>
                            <div id="bannerPreview" style="margin-top: 1rem;"></div>
                            <input type="text" id="bannerAltText" placeholder="Alt text..." style="margin-top: 0.5rem;">
                        </div>
                    </div>

                    <!-- About Page Section (initially hidden) -->
                    <div id="aboutPageSection" style="display: none;">
                        <h3 style="margin-bottom: 1rem; font-size: 1.2rem; font-weight: 600;">About Page Content</h3>
                        
                        <div class="form-group">
                            <label for="aboutTitle">Page Title</label>
                            <input type="text" id="aboutTitle" placeholder="About page title...">
                        </div>
                        
                        <div class="form-group">
                            <label>Content Sections</label>
                            <div id="aboutContentContainer">
                                <!-- Content sections will be populated by JavaScript -->
                            </div>
                            <button type="button" class="btn btn-secondary" onclick="addAboutSection()">+ Add Section</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="saveBtn">Save Truck</button>
                    <button type="button" class="btn btn-primary" onclick="saveSiteSettings()" id="saveSettingsBtn" style="display: none;">Save Settings</button>
                    <button type="button" class="btn btn-primary" onclick="saveAboutPage()" id="saveAboutBtn" style="display: none;">Save About Page</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Embedded Data -->
    <script>
        window.trucksData = ${JSON.stringify(trucksData)};
        window.siteSettings = ${JSON.stringify(siteSettings)};
        window.aboutPage = ${JSON.stringify(aboutPage)};
        window.csrfToken = "${Date.now()}";
    </script>

    <script src="/admin-dashboard.js"></script>

</body>
</html>
        `;

        res.send(dashboardHTML);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router;