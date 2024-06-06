require('dotenv').config();
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const API_URL = process.env.API_URL;

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/api/device-data', async (req, res) => {
    const dataPoints = req.query.dataPoints || 50;
    const response = await fetch(API_URL + '/api/temp/getAllDeviceData/' + dataPoints);
    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => console.log('Server running on port 3000'));
