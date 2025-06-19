const express = require('express');
const router = express.Router();
const { requireAuth, checkAuth } = require('../middleware/auth');
const fileManager = require('../utils/filemanager');

// GET /admin - Main dashboard (require auth)
router.get('/', requireAuth, async (req, res) => {
    try {
        // Fetch trucks data
        const trucksData = await fileManager.getTrucks();

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
            max-width: 800px;
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
        }

        .image-upload:hover {
            border-color: #1e40af;
        }

        .image-preview {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .preview-item {
            position: relative;
            width: 100px;
            height: 80px;
        }

        .preview-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.25rem;
        }

        .preview-remove {
            position: absolute;
            top: -0.5rem;
            right: -0.5rem;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 50%;
            width: 1.5rem;
            height: 1.5rem;
            font-size: 0.75rem;
            cursor: pointer;
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
            <button class="btn btn-primary" onclick="openAddModal()">+ Add New Truck</button>
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
                            <input type="number" id="price" name="price" step="0.01">
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
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="saveBtn">Save Truck</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Embedded Data -->
    <script>
        window.trucksData = ${JSON.stringify(trucksData)};
        window.csrfToken = "${Date.now()}"; // Simple CSRF token
    </script>
    
    <!-- Dashboard JavaScript -->
    <script>
        // Global variables
        let allTrucks = window.trucksData.trucks || [];
        let filteredTrucks = [...allTrucks];
        let editingTruckId = null;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            renderTrucksTable();
        });

        // Render trucks table
        function renderTrucksTable() {
            const tbody = document.getElementById('trucksTableBody');
            
            if (filteredTrucks.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="8" class="empty-state">
                            <h3>No trucks found</h3>
                            <p>Add your first truck or adjust your search filters.</p>
                        </td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = filteredTrucks.map(truck => {
                const primaryImage = truck.images && truck.images.find(img => img.isPrimary) || truck.images?.[0];
                const formattedPrice = truck.price ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(truck.price) : 'N/A';

                return \`
                    <tr>
                        <td>
                            \${primaryImage 
                                ? \`<img src="\${primaryImage.url}" alt="Truck" class="truck-image" onerror="this.style.display='none'">\`
                                : \`<div class="truck-image-placeholder">🚛</div>\`
                            }
                        </td>
                        <td>\${truck.year || 'N/A'}</td>
                        <td>
                            <strong>\${truck.make || 'N/A'}</strong><br>
                            <small>\${truck.model || 'N/A'}</small>
                        </td>
                        <td>\${truck.stockNumber || 'N/A'}</td>
                        <td class="price-cell">\${formattedPrice}</td>
                        <td><span class="status-badge status-\${(truck.condition || 'used').toLowerCase()}">\${truck.condition || 'Used'}</span></td>
                        <td>
                            <span class="status-badge status-\${truck.isAvailable ? 'available' : 'unavailable'}">
                                \${truck.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            \${truck.isFeatured ? '<span class="status-badge status-featured">Featured</span>' : ''}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-secondary" onclick="editTruck('\${truck.id}')">Edit</button>
                            <button class="btn btn-sm btn-secondary" onclick="toggleAvailable('\${truck.id}')">\${truck.isAvailable ? 'Hide' : 'Show'}</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTruck('\${truck.id}')">Delete</button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        // Filter trucks
        function filterTrucks() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const conditionFilter = document.getElementById('filterCondition').value;
            const statusFilter = document.getElementById('filterStatus').value;

            filteredTrucks = allTrucks.filter(truck => {
                const matchesSearch = !searchTerm || 
                    (truck.make?.toLowerCase().includes(searchTerm)) ||
                    (truck.model?.toLowerCase().includes(searchTerm)) ||
                    (truck.stockNumber?.toLowerCase().includes(searchTerm)) ||
                    (truck.year?.toString().includes(searchTerm));

                const matchesCondition = !conditionFilter || truck.condition === conditionFilter;
                
                const matchesStatus = !statusFilter || 
                    (statusFilter === 'available' && truck.isAvailable) ||
                    (statusFilter === 'unavailable' && !truck.isAvailable);

                return matchesSearch && matchesCondition && matchesStatus;
            });

            renderTrucksTable();
        }

        // Modal functions
        function openAddModal() {
            editingTruckId = null;
            document.getElementById('modalTitle').textContent = 'Add New Truck';
            document.getElementById('truckForm').reset();
            document.getElementById('truckModal').classList.add('show');
        }

        function editTruck(truckId) {
            editingTruckId = truckId;
            const truck = allTrucks.find(t => t.id === truckId);
            if (!truck) return;

            document.getElementById('modalTitle').textContent = 'Edit Truck';
            
            // Populate form
            Object.keys(truck).forEach(key => {
                const field = document.getElementById(key);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = truck[key];
                    } else {
                        field.value = truck[key] || '';
                    }
                }
            });

            document.getElementById('truckModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('truckModal').classList.remove('show');
            document.getElementById('truckForm').reset();
            editingTruckId = null;
        }

        // CRUD operations
        async function saveTruck(formData) {
            try {
                const url = editingTruckId ? \`/api/trucks/\${editingTruckId}\` : '/api/trucks';
                const method = editingTruckId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(\`Truck \${editingTruckId ? 'updated' : 'created'} successfully!\`, 'success');
                    await refreshTrucks();
                    closeModal();
                } else {
                    showNotification(result.error || 'Failed to save truck', 'error');
                }
            } catch (error) {
                console.error('Save error:', error);
                showNotification('Failed to save truck', 'error');
            }
        }

        async function deleteTruck(truckId) {
            const truck = allTrucks.find(t => t.id === truckId);
            if (!truck) return;

            if (!confirm(\`Are you sure you want to delete the \${truck.year} \${truck.make} \${truck.model}?\`)) {
                return;
            }

            try {
                const response = await fetch(\`/api/trucks/\${truckId}\`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('Truck deleted successfully!', 'success');
                    await refreshTrucks();
                } else {
                    showNotification(result.error || 'Failed to delete truck', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                showNotification('Failed to delete truck', 'error');
            }
        }

        async function toggleAvailable(truckId) {
            try {
                const response = await fetch(\`/api/trucks/\${truckId}/toggle\`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ field: 'available' })
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('Truck status updated!', 'success');
                    await refreshTrucks();
                } else {
                    showNotification(result.error || 'Failed to update status', 'error');
                }
            } catch (error) {
                console.error('Toggle error:', error);
                showNotification('Failed to update status', 'error');
            }
        }

        // Refresh trucks data
        async function refreshTrucks() {
            try {
                const response = await fetch('/api/trucks',{
                credentials: 'include'});
                const result = await response.json();
                
                if (result.success) {
                    allTrucks = result.data.trucks;
                    filteredTrucks = [...allTrucks];
                    document.getElementById('truckCount').textContent = \`\${allTrucks.length} trucks total\`;
                    filterTrucks(); // Re-apply current filters
                }
            } catch (error) {
                console.error('Refresh error:', error);
            }
        }

        // Form submission
        document.getElementById('truckForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const truckData = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                if (key === 'isAvailable' || key === 'isFeatured') {
                    truckData[key] = true; // Checkbox was checked
                } else if (key === 'price' || key === 'year') {
                    truckData[key] = value ? Number(value) : null;
                } else {
                    truckData[key] = value || null;
                }
            }

            // Set unchecked checkboxes to false
            if (!truckData.isAvailable) truckData.isAvailable = false;
            if (!truckData.isFeatured) truckData.isFeatured = false;

            await saveTruck(truckData);
        });

        // Utility functions
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 5000);
        }

        async function logout() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/admin/login';
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Close modal on backdrop click
        document.getElementById('truckModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });
    </script>
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