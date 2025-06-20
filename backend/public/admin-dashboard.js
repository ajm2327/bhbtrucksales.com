
// Global variables
let allTrucks = window.trucksData.trucks || [];
let filteredTrucks = [...allTrucks];
let editingTruckId = null;
let truckImages = []; // Store images for current truck

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    renderTrucksTable();
});

// Image upload functions
function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    processImageFiles(files);
}

function handleImageUpload(e) {
    const files = e.target.files;
    processImageFiles(files);
}

function processImageFiles(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            showNotification(`${file.name} is not a supported image format`, 'error');
            continue;
        }

        if (file.size > maxSize) {
            showNotification(`${file.name} is too large (max 10MB)`, 'error');
            continue;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = {
                file: file,
                url: e.target.result,
                caption: `${file.name.replace(/\.[^/.]+$/, "")}`,
                isPrimary: truckImages.length === 0
            };
            truckImages.push(imageData);
            renderImagePreview();
        };
        reader.readAsDataURL(file);
    }
}

function renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = truckImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.url}" alt="Preview ${index + 1}">
            ${img.isPrimary ? '<div class="primary-indicator">Primary</div>' : ''}
            <div class="preview-controls">
                ${!img.isPrimary ? `<button type="button" class="preview-btn" onclick="setPrimaryImage(${index})" title="Set as primary">★</button>` : ''}
                <button type="button" class="preview-btn" onclick="removeImage(${index})" title="Remove">×</button>
            </div>
            <div class="image-caption">${img.caption}</div>
        </div>
    `).join('');
}

function setPrimaryImage(index) {
    truckImages.forEach((img, i) => {
        img.isPrimary = i === index;
    });
    renderImagePreview();
}

function removeImage(index) {
    truckImages.splice(index, 1);
    // If we removed the primary image, make the first one primary
    if (truckImages.length > 0 && !truckImages.some(img => img.isPrimary)) {
        truckImages[0].isPrimary = true;
    }
    renderImagePreview();
}

// Render trucks table
function renderTrucksTable() {
    const tbody = document.getElementById('trucksTableBody');

    if (filteredTrucks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <h3>No trucks found</h3>
                    <p>Add your first truck or adjust your search filters.</p>
                </td>
            </tr>
        `;
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

        return `
            <tr>
                <td>
                    ${primaryImage
                ? `<img src="${primaryImage.url}" alt="Truck" class="truck-image" onerror="this.style.display='none'">`
                : `<div class="truck-image-placeholder">🚛</div>`
            }
                </td>
                <td>${truck.year || 'N/A'}</td>
                <td>
                    <strong>${truck.make || 'N/A'}</strong><br>
                    <small>${truck.model || 'N/A'}</small>
                </td>
                <td>${truck.stockNumber || 'N/A'}</td>
                <td class="price-cell">${formattedPrice}</td>
                <td><span class="status-badge status-${(truck.condition || 'used').toLowerCase()}">${truck.condition || 'Used'}</span></td>
                <td>
                    <span class="status-badge status-${truck.isAvailable ? 'available' : 'unavailable'}">
                        ${truck.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    ${truck.isFeatured ? '<span class="status-badge status-featured">Featured</span>' : ''}
                </td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-secondary" onclick="editTruck('${truck.id}')">Edit</button>
                    <button class="btn btn-sm btn-secondary" onclick="toggleAvailable('${truck.id}')">${truck.isAvailable ? 'Hide' : 'Show'}</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTruck('${truck.id}')">Delete</button>
                </td>
            </tr>
        `;
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
    truckImages = []; // Clear images
    document.getElementById('modalTitle').textContent = 'Add New Truck';
    document.getElementById('truckForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
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

    // Load existing images
    truckImages = truck.images ? truck.images.map(img => ({
        ...img,
        existing: true // Mark as existing image
    })) : [];
    renderImagePreview();

    document.getElementById('truckModal').classList.add('show');
}

function closeModal() {
    document.getElementById('truckModal').classList.remove('show');
    document.getElementById('truckForm').reset();
    truckImages = [];
    editingTruckId = null;
}

// CRUD operations
async function saveTruck(formData) {
    try {
        let finalImages = truckImages.filter(img => img.existing); // Keep existing images

        // For new trucks, save the truck FIRST to get the real ID
        if (!editingTruckId) {
            // Create truck without images first
            const response = await fetch('/api/trucks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ...formData, images: [] }) // Empty images for now
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Validation error details:', result);
                showNotification(result.error || 'Failed to create truck', 'error');

                // Show detailed validation errors if available
                if (result.details) {
                    result.details.forEach(detail => {
                        console.error('Validation:', detail.msg, 'for field:', detail.path);
                    });
                }
                return;
            }

            // Now we have the real truck ID
            const newTruckId = result.data.id;

            // Upload images to the correct folder
            const newImages = truckImages.filter(img => !img.existing);
            if (newImages.length > 0) {
                const uploadedImages = await uploadImages(newTruckId, newImages);
                if (uploadedImages) {
                    finalImages = [...finalImages, ...uploadedImages];
                }

                // Update the truck with the real image URLs
                const updateResponse = await fetch('/api/trucks/' + newTruckId, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ ...formData, images: finalImages })
                });

                if (!updateResponse.ok) {
                    showNotification('Truck created but failed to update images', 'error');
                }
            }

            showNotification('Truck created successfully!', 'success');
            await refreshTrucks();
            closeModal();

        } else {
            // Editing existing truck - normal flow
            const newImages = truckImages.filter(img => !img.existing);
            if (newImages.length > 0) {
                const uploadedImages = await uploadImages(editingTruckId, newImages);
                if (uploadedImages) {
                    finalImages = [...finalImages, ...uploadedImages];
                }
            }

            formData.images = finalImages;

            const response = await fetch('/api/trucks/' + editingTruckId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Truck updated successfully!', 'success');
                await refreshTrucks();
                closeModal();
            } else {
                console.error('Validation error details:', result);
                showNotification(result.error || 'Failed to update truck', 'error');

                // Show detailed validation errors if available
                if (result.details) {
                    result.details.forEach(detail => {
                        console.error('Validation:', detail.msg, 'for field:', detail.path);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save truck', 'error');
    }
}

async function uploadImages(truckId, imagesToUpload) {
    try {
        const formData = new FormData();
        imagesToUpload.forEach((img, index) => {
            formData.append('images', img.file);
            formData.append('captions', img.caption);
        });

        const response = await fetch('/api/uploads/truck-images/' + truckId, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Return the uploaded images with correct URLs
            return result.data.images;
        } else {
            showNotification('Failed to upload images', 'error');
            return null;
        }
    } catch (error) {
        console.error('Image upload error:', error);
        showNotification('Failed to upload images', 'error');
        return null;
    }
}

async function deleteTruck(truckId) {
    const truck = allTrucks.find(t => t.id === truckId);
    if (!truck) return;

    if (!confirm(`Are you sure you want to delete the ${truck.year} ${truck.make} ${truck.model}?`)) {
        return;
    }

    try {
        const response = await fetch('/api/trucks/' + truckId, {
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
        const response = await fetch('/api/trucks/' + truckId + '/toggle', {
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
        const response = await fetch('/api/trucks', {
            credentials: 'include'
        });
        const result = await response.json();

        if (result.success) {
            allTrucks = result.data.trucks;
            filteredTrucks = [...allTrucks];
            document.getElementById('truckCount').textContent = `${allTrucks.length} trucks total`;
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
        } else if (key === 'year') {
            // Year must be a number, not null
            truckData[key] = value ? Number(value) : undefined;
        } else if (key === 'price') {
            // Price is just a string field like everything else
            truckData[key] = value.trim() || null;
        } else {
            // Don't send empty strings, send undefined instead
            truckData[key] = value.trim() || undefined;
        }
    }

    // Remove undefined values to avoid sending them
    Object.keys(truckData).forEach(key => {
        if (truckData[key] === undefined) {
            delete truckData[key];
        }
    });

    // Set unchecked checkboxes to false
    if (!truckData.isAvailable) truckData.isAvailable = false;
    if (!truckData.isFeatured) truckData.isFeatured = false;

    await saveTruck(truckData);
});

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/admin/login';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin/login';
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