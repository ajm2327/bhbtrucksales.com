const fs = require('fs-extra');
const path = require('path');

class FileManager {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.backupDir = path.join(this.dataDir, 'backups');
        this.uploadsDir = path.join(__dirname, '../uploads');
        this.trucksUploadsDir = path.join(this.uploadsDir, 'trucks');
        this.generalUploadsDir = path.join(this.uploadsDir, 'general')

        //this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.ensureDir(this.dataDir);
            await fs.ensureDir(this.backupDir);
            await fs.ensureDir(this.uploadsDir);
            await fs.ensureDir(path.join(this.trucksUploadsDir));
            await fs.ensureDir(path.join(this.generalUploadsDir, 'general'));

            console.log('All required directories ensured');
        } catch (error) {
            console.error('Error creating directories:', error);
        }
    }

    /**
     * Read json file safely
     * @param {string} filename - name of json file
     * @returns {Object} Parsed json data
     */
    async readJSON(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);

            if (!await fs.pathExists(filePath)) {
                throw new Error(`File ${filename} does not exist`);
            }

            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error);
            throw new Error(`Failed to read ${filename}: ${error.message}`);
        }
    }

    /**
     * * Write json file safely with backup
     * @param {string} filename
     * @param {Object} data
     * @returns {boolean}
     */
    async writeJSON(filename, data) {
        try {

            const filePath = path.join(this.dataDir, filename);

            // create backup before writing
            if (await fs.pathExists(filePath)) {
                await this.createBackup(filename);
            }

            // add timestamp to data
            data.lastUpdated = new Date().toISOString();

            // write file atomically (write to temp file, then rename)
            const tempPath = `${filePath}.tmp`;
            await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
            await fs.move(tempPath, filePath, { overwrite: true });

            console.log(`Successfully wrote ${filename}`);
            return true;
        } catch (error) {
            console.error(`Error writing ${filename}:`, error);
            throw new Error(`Failed to write ${filename}: ${error.message}`);
        }
    }

    /**
     * Create backup of exisitng file
     * @param {string}
     */

    async createBackup(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);

            if (await fs.pathExists(filePath)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupName = `${filename.replace('.json', '')}_${timestamp}.json`;
                const backupPath = path.join(this.backupDir, backupName);

                await fs.copy(filePath, backupPath);
                console.log(`Create backup: ${backupName}`);

                //clean old backups, keep 10
                await this.cleanOldBackups(filename);
            }
        } catch (error) {
            console.error(`Error creating backup for ${filename}:`, error);
        }
    }

    /**
     * Clean old backup files (keep last 10)
     * @param {string} filename
     */

    async cleanOldBackups(filename) {
        try {
            const baseFilename = filename.replace('.json', '');
            const files = await fs.readdir(this.backupDir);

            const backupFiles = files
                .filter(file => file.startsWith(baseFilename) && file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    time: fs.statSync(path.join(this.backupDir, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);

            const filesToDelete = backupFiles.slice(10);

            for (const file of filesToDelete) {
                await fs.remove(file.path);
                console.log(`Deleted old backup: ${file.name}`);
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    /**
     * get trucks data
     * @returns {object} truck data
     */
    async getTrucks() {
        return await this.readJSON('trucks.json');
    }


    /**
     * Save trucks data
     * @param {Object} trucksData
     * @returns {boolean}
     */

    async saveTrucks(trucksData) {
        return await this.writeJSON('trucks.json', trucksData);
    }

    /**
     * Get single truck by ID
     * @param {string} truckId
     * @returns {Object|null}
     */

    async getTruckById(truckId) {
        try {
            const trucksData = await this.getTrucks();
            return trucksData.trucks.find(truck => truck.id === truckId) || null;

        } catch (error) {
            console.error(`Error getting truck ${truckId}:`, error);
            return null;
        }
    }

    /**
     * Get site settings data
     * @returns {Object} site settings
     */
    async getSiteSettings() {
        try {
            const data = await this.getTrucks();
            return data.siteSettings || {
                announcement: {
                    isActive: false,
                    title: "",
                    message: "",
                    createdAt: ""
                },
                banner: {
                    imageUrl: "",
                    altText: "BHB Truck Sales"
                },
                logo: {
                    imageUrl: "",
                    altText: "BHB Truck Sales Logo"
                }
            };
        } catch (error) {
            console.error('Error getting site settings:', error);
            return null;
        }
    }

    /** 
     * get about page content
     * @returns {Object} about page data
     */
    async getAboutPage() {
        try {
            const data = await this.getTrucks();
            return data.aboutPage || {
                title: "About BHB Truck Sales",
                content: []
            };
        } catch (error) {
            console.error('Error getting about page:', error);
            return null;
        }
    }

    /**
     * Update site settings
     * @param {Object} siteSettings
     * @returns {boolean}
     */
    async saveSiteSettings(siteSettings) {
        try {
            const data = await this.getTrucks();
            data.siteSettings = siteSettings;
            return await this.writeJSON('trucks.json', data);
        } catch (error) {
            console.error('Error saving site settings:', error);
            throw error;
        }
    }

    /**
     * Update about page content
     * @param {Object}
     * @returns {boolean}
     */
    async saveAboutPage(aboutPageData) {
        try {
            const data = await this.getTrucks();
            data.aboutPage = aboutPageData;
            return await this.writeJSON('trucks.json', data);
        } catch (error) {
            console.error('Error saving about page:', error);
            throw error;
        }
    }

    /**
     * Check if file exists
     * @param {string} filename
     * @returns {boolean}
     */

    async fileExists(filename) {
        const filePath = path.join(this.dataDir, filename);
        return await fs.pathExists(filePath);
    }

    /**
     * Create truck upload directrory
     * @param {string} truckId
     * @returns {string} directory path
     */
    async createTruckUploadDir(truckId) {
        const truckDir = path.join(this.truckUploadsDir, truckId);
        await fs.ensureDir(truckDir);
        return truckDir;
    }

    /** 
     * delete truck upload directory and all images
     * @param {string}
     * 
     */
    async deleteTruckUploadDir(truckId) {
        const truckDir = path.join(this.trucksUploadsDir, truckId);
        if (await fs.pathExists(truckDir)) {
            await fs.remove(truckDir);
            console.log(`Deleted truck upload directory: ${truckId}`);
        }
    }

    /** 
     * Get upload directory paths
     * @returns {Object} directory paths
     */
    getUploadPaths() {
        return {
            uploads: this.uploadsDir,
            trucks: this.trucksUploadsDir,
            general: this.generalUploadsDir
        };
    }

    /**
     * Clean up temp upload directory
     */
    async cleanTempUploads() {
        try {
            const tempPath = path.join(this.trucksUploadsDir, 'temp');
            if (await fs.pathExists(tempPath)) {
                await fs.remove(tempPath);
                console.log('Cleaned up temp upload directory');
            }
        } catch (error) {
            console.error('Error cleaning temp uploads:', error);
        }
    }
}

module.exports = new FileManager();