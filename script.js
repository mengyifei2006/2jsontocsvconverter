document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const csvOutput = document.getElementById('csv-output');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');

    convertBtn.addEventListener('click', () => {
        const jsonText = jsonInput.value.trim();
        if (!jsonText) {
            csvOutput.value = 'Error: JSON input is empty.';
            return;
        }

        try {
            let jsonData = JSON.parse(jsonText);
            const csv = jsonToCsv(jsonData);
            csvOutput.value = csv;
        } catch (error) {
            csvOutput.value = `Error: Invalid JSON format.\n${error.message}`;
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!csvOutput.value) return;
        navigator.clipboard.writeText(csvOutput.value)
            .then(() => alert('CSV copied to clipboard!'))
            .catch(err => alert('Failed to copy: ' + err));
    });

    downloadBtn.addEventListener('click', () => {
        if (!csvOutput.value) return;
        const blob = new Blob([csvOutput.value], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        csvOutput.value = '';
    });

    function jsonToCsv(jsonData) {
        // Handle case where jsonData is not an array, but a single object.
        if (!Array.isArray(jsonData)) {
            if (typeof jsonData === 'object' && jsonData !== null) {
                jsonData = [jsonData]; // Convert single object to array with one element
            } else {
                return 'Error: Input must be an array of objects or a single JSON object.';
            }
        }
        
        if (jsonData.length === 0) {
            return ''; // Return empty string for empty array
        }

        // Ensure all items are objects
        const allObjects = jsonData.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));
        if (!allObjects) {
            return 'Error: All items in the JSON array must be objects.';
        }
        
        // Collect all unique keys to form the header row
        const headerSet = new Set();
        jsonData.forEach(row => {
            Object.keys(row).forEach(key => headerSet.add(key));
        });
        const headers = Array.from(headerSet);

        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of jsonData) {
            const values = headers.map(header => {
                const value = row[header];
                // Handle null, undefined, and objects gracefully
                let escaped = '';
                if (value !== null && value !== undefined) {
                    if (typeof value === 'object') {
                        escaped = JSON.stringify(value).replace(/"/g, '""');
                    } else {
                        escaped = ('' + value).replace(/"/g, '""');
                    }
                }
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }
});