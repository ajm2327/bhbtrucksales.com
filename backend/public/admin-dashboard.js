
// Global variables
let allTrucks = [];
let filteredTrucks = [];
let editingTruckId = null;
let truckImages = []; // Store images for current truck

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, checking for data...');
    console.log('window.trucksData:', window.trucksData);

    // Wait for data to be available with multiple checks
    if (window.trucksData) {
        console.log('Found trucksData:', window.trucksData);
        if (window.trucksData.trucks && Array.isArray(window.trucksData.trucks)) {
            allTrucks = window.trucksData.trucks;
            filteredTrucks = [...allTrucks];
            console.log(`Loaded ${allTrucks.length} trucks`);
            renderTrucksTable();
        } else {
            console.error('trucksData.trucks is not an array:', window.trucksData);
            showNotification('Invalid truck data format', 'error');
        }
    } else {
        console.error('window.trucksData is not available');
        showNotification('Failed to load truck data', 'error');
    }
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
// Form submission - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('truckForm');
    if (form) {
        form.addEventListener('submit', async (e) => {

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
    }
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

// Logo upload functions
function triggerLogoUpload() {
    document.getElementById('logoUpload').click();
}

function handleLogoDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) processLogoFile(files[0]);
}

function handleLogoUpload(e) {
    const files = e.target.files;
    if (files.length > 0) processLogoFile(files[0]);
}

function processLogoFile(file) {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        showNotification('Please select a valid image file', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Logo too large (max 5MB)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        window.logoImageData = { file: file, url: e.target.result };
        renderLogoPreview();
    };
    reader.readAsDataURL(file);
}

function renderLogoPreview() {
    const preview = document.getElementById('logoPreview');
    if (window.logoImageData) {
        preview.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${window.logoImageData.url}" alt="Logo preview" style="max-width: 100px; height: 100px; object-fit: contain; border-radius: 0.5rem; border: 2px solid #e5e7eb;">
                <button type="button" onclick="removeLogoImage()" style="position: absolute; top: -5px; right: -5px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px;">×</button>
            </div>
        `;
    } else {
        preview.innerHTML = '';
    }
}

function removeLogo() {
    window.logoImageData = null;
    renderLogoPreview();
}


// Site Settings and About Page Management Functions
function openSiteSettingsModal() {
    document.getElementById('modalTitle').textContent = 'Site Settings';

    // Hide truck form, show site settings
    document.getElementById('truckFormSection').style.display = 'none';
    document.getElementById('siteSettingsSection').style.display = 'block';
    document.getElementById('aboutPageSection').style.display = 'none';

    // Show/hide correct save buttons
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('saveSettingsBtn').style.display = 'block';
    document.getElementById('saveAboutBtn').style.display = 'none';

    // Populate current settings
    const settings = window.siteSettings;
    document.getElementById('announcementActive').checked = settings.announcement.isActive;
    document.getElementById('announcementTitle').value = settings.announcement.title;
    document.getElementById('announcementMessage').value = settings.announcement.message;
    document.getElementById('bannerAltText').value = settings.banner.altText;

    // Show current logo if exists
    if (settings.logo && settings.logo.imageUrl) {
        window.logoImageData = { url: settings.logo.imageUrl, existing: true };
        renderLogoPreview();
    }

    document.getElementById('truckModal').classList.add('show');
}

// Banner upload functions
function triggerBannerUpload() {
    document.getElementById('bannerUpload').click();
}

function handleBannerDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) processBannerFile(files[0]);
}

function handleBannerUpload(e) {
    const files = e.target.files;
    if (files.length > 0) processBannerFile(files[0]);
}

function processBannerFile(file) {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        showNotification('Please select a valid image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('Image too large (max 10MB)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        window.bannerImageData = { file: file, url: e.target.result };
        renderBannerPreview();
    };
    reader.readAsDataURL(file);
}

function renderBannerPreview() {
    const preview = document.getElementById('bannerPreview');
    if (window.bannerImageData) {
        preview.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${window.bannerImageData.url}" alt="Banner preview" style="max-width: 200px; height: 100px; object-fit: cover; border-radius: 0.5rem;">
                <button type="button" onclick="removeBannerImage()" style="position: absolute; top: -5px; right: -5px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px;">×</button>
            </div>
        `;
    } else {
        preview.innerHTML = '';
    }
}

function removeBannerImage() {
    window.bannerImageData = null;
    renderBannerPreview();
}


function openAboutPageModal() {
    document.getElementById('modalTitle').textContent = 'About Page Content';

    // Hide truck form, show about page
    document.getElementById('truckFormSection').style.display = 'none';
    document.getElementById('siteSettingsSection').style.display = 'none';
    document.getElementById('aboutPageSection').style.display = 'block';

    // Show/hide correct save buttons
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('saveSettingsBtn').style.display = 'none';
    document.getElementById('saveAboutBtn').style.display = 'block';

    // Populate current about page data
    const aboutData = window.aboutPage;
    document.getElementById('aboutTitle').value = aboutData.title;
    renderAboutContent(aboutData.content);

    document.getElementById('truckModal').classList.add('show');
}

function renderAboutContent(content) {
    const container = document.getElementById('aboutContentContainer');
    container.innerHTML = content.map((section, index) => `
        <div class="about-section" style="border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <select onchange="changeAboutSectionType(${index}, this.value)" style="margin-right: 1rem;">
                    <option value="paragraph" ${section.type === 'paragraph' ? 'selected' : ''}>Paragraph</option>
                    <option value="image" ${section.type === 'image' ? 'selected' : ''}>Image</option>
                </select>
                <button type="button" onclick="removeAboutSection(${index})" style="background: #dc2626; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">Remove</button>
            </div>
            ${section.type === 'paragraph'
            ? `<textarea placeholder="Enter paragraph text..." style="width: 100%; min-height: 100px;">${section.text || ''}</textarea>`
            : `<div>
                     <div class="image-upload" onclick="triggerAboutImageUpload(${index})" style="margin-bottom: 0.5rem; padding: 1rem;">
                         <p>Click to upload image</p>
                         <input type="file" id="aboutImageUpload${index}" accept="image/*" style="display: none;" onchange="handleAboutImageUpload(event, ${index})">
                     </div>
                     <div id="aboutImagePreview${index}"></div>
                     <input type="text" placeholder="Image caption..." value="${section.caption || ''}" style="width: 100%; margin-top: 0.5rem;">
                   </div>`
        }
        </div>
    `).join('');
}

function triggerAboutImageUpload(index) {
    document.getElementById('aboutImageUpload' + index).click();
}

function handleAboutImageUpload(e, index) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        if (!window.aboutImages) window.aboutImages = {};
        window.aboutImages[index] = { file: file, url: e.target.result };

        const preview = document.getElementById('aboutImagePreview' + index);
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; height: 80px; object-fit: cover; border-radius: 0.5rem;">`;
    };
    reader.readAsDataURL(file);
}

function addAboutSection() {
    const aboutData = window.aboutPage;
    aboutData.content.push({ type: 'paragraph', text: '' });
    renderAboutContent(aboutData.content);
}

function removeAboutSection(index) {
    const aboutData = window.aboutPage;
    aboutData.content.splice(index, 1);
    renderAboutContent(aboutData.content);
}

function changeAboutSectionType(index, newType) {
    const aboutData = window.aboutPage;
    if (newType === 'paragraph') {
        aboutData.content[index] = { type: 'paragraph', text: '' };
    } else {
        aboutData.content[index] = { type: 'image', url: '', caption: '' };
    }
    renderAboutContent(aboutData.content);
}

async function saveSiteSettings() {
    try {
        let logoImageUrl = window.siteSettings.logo?.imageUrl || '';

        // Upload logo image if there's a new one
        if (window.logoImageData && window.logoImageData.file) {
            const formData = new FormData();
            formData.append('images', window.logoImageData.file);

            const uploadResponse = await fetch('/api/uploads/general', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
                logoImageUrl = uploadResult.data.files[0].url;
            } else {
                showNotification('Failed to upload logo image', 'error');
                return;
            }
        }

        let bannerImageUrl = '';
        // Upload banner image if there's one
        if (window.bannerImageData && window.bannerImageData.file) {
            const formData = new FormData();
            formData.append('images', window.bannerImageData.file);

            const uploadResponse = await fetch('/api/uploads/general', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
                bannerImageUrl = uploadResult.data.files[0].url;
            } else {
                showNotification('Failed to upload banner image', 'error');
                return;
            }
        }

        const settingsData = {
            announcement: {
                isActive: document.getElementById('announcementActive').checked,
                title: document.getElementById('announcementTitle').value,
                message: document.getElementById('announcementMessage').value,
                createdAt: new Date().toISOString()
            },
            banner: {
                imageUrl: bannerImageUrl || window.siteSettings.banner.imageUrl,
                altText: document.getElementById('bannerAltText').value
            },
            logo: {
                imageUrl: logoImageUrl,
                altText: "BHB Truck Sales Logo"
            }
        };

        const response = await fetch('/api/trucks/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(settingsData)
        });

        const result = await response.json();
        if (result.success) {
            window.siteSettings = settingsData;
            window.logoImageData = null;
            window.bannerImageData = null;
            showNotification('Site settings updated successfully!', 'success');
            closeModal();
        } else {
            showNotification(result.error || 'Failed to update settings', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save settings', 'error');
    }
}

async function saveAboutPage() {
    try {
        // Collect data from form
        const aboutData = {
            title: document.getElementById('aboutTitle').value,
            content: []
        };

        // Get all content sections
        const sections = document.querySelectorAll('.about-section');
        sections.forEach((section, index) => {
            const type = section.querySelector('select').value;
            if (type === 'paragraph') {
                const text = section.querySelector('textarea').value;
                if (text.trim()) {
                    aboutData.content.push({ type: 'paragraph', text: text.trim() });
                }
            } else {
                const inputs = section.querySelectorAll('input');
                const url = inputs[0].value.trim();
                const caption = inputs[1].value.trim();
                if (url) {
                    aboutData.content.push({ type: 'image', url, caption });
                }
            }
        });

        const response = await fetch('/api/trucks/about-page', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(aboutData)
        });

        const result = await response.json();
        if (result.success) {
            window.aboutPage = aboutData;
            showNotification('About page updated successfully!', 'success');
            closeModal();
        } else {
            showNotification(result.error || 'Failed to update about page', 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save about page', 'error');
    }
}

// Update the closeModal function to reset all sections
function closeModal() {
    document.getElementById('truckModal').classList.remove('show');
    document.getElementById('truckForm').reset();

    // Reset all sections visibility
    document.getElementById('truckFormSection').style.display = 'block';
    document.getElementById('siteSettingsSection').style.display = 'none';
    document.getElementById('aboutPageSection').style.display = 'none';

    // Reset buttons
    document.getElementById('saveBtn').style.display = 'block';
    document.getElementById('saveSettingsBtn').style.display = 'none';
    document.getElementById('saveAboutBtn').style.display = 'none';

    truckImages = [];
    editingTruckId = null;
}