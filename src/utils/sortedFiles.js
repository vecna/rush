const fs = require('fs').promises;
const path = require('path');

async function getSortedFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        const detailedFiles = await Promise.all(files.map(async file => {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            return { name: file, mtime: stats.mtime };
        }));

        // Sort files by date, oldest first
        detailedFiles.sort((a, b) => a.mtime - b.mtime);

        // If you just want the sorted file names
        return detailedFiles.map(file => file.name);
    } catch (error) {
        console.error('Failed to read directory:', error);
        throw error;  // Rethrow or handle error as needed
    }
}

module.exports = { getSortedFiles };