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

async function fetchTemperatureData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const timestamp = new Date();

        temperatureData.labels.push(timestamp);
        temperatureData.datasets[0].data.push({ x: timestamp, y: data.armbian_temp_0 });
        temperatureData.datasets[1].data.push({ x: timestamp, y: data.armbian_temp_1 });
        temperatureData.datasets[2].data.push({ x: timestamp, y: data.openwrt_temp_0 });
        temperatureData.datasets[3].data.push({ x: timestamp, y: data.openwrt_temp_6 });

        // Keep only the last 10000 data points to avoid memory overflow
        if (temperatureData.labels.length > 10000) {
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
