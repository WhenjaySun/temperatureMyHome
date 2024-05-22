require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

const API_URL = process.env.API_URL;

let temperatureData = {
    labels: [],
    datasets: [
        { label: 'Armbian Temp 0', data: [] },
        { label: 'Armbian Temp 1', data: [] },
        { label: 'OpenWrt Temp 0', data: [] },
        { label: 'OpenWrt Temp 6', data: [] }
    ]
};

async function fetchWithRetry(url, options = {}, retries = 10, delay = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt < retries) {
                console.error(`Fetch attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`Fetch attempt ${attempt} failed. No more retries left.`);
                throw error;
            }
        }
    }
}

async function fetchTemperatureData() {
    try {
        const data = await fetchWithRetry(API_URL);
        const timestamp = new Date();

        temperatureData.labels.push(timestamp);
        temperatureData.datasets[0].data.push({ x: timestamp, y: data.armbian_temp_0 });
        temperatureData.datasets[1].data.push({ x: timestamp, y: data.armbian_temp_1 });
        temperatureData.datasets[2].data.push({ x: timestamp, y: data.openwrt_temp_0 });
        temperatureData.datasets[3].data.push({ x: timestamp, y: data.openwrt_temp_6 });

        // Keep only the last 100 data points to avoid memory overflow
        if (temperatureData.labels.length > 100) {
            temperatureData.labels.shift();
            temperatureData.datasets.forEach(dataset => dataset.data.shift());
        }
    } catch (error) {
        console.error('Error fetching temperature data:', error);
    }
}

// Fetch data every minute
setInterval(fetchTemperatureData, 60000);
fetchTemperatureData(); // Initial fetch

app.get('/api/temperature-data', (req, res) => {
    res.json(temperatureData);
});

app.use(express.static('public')); // Serve static files from 'public' directory

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
