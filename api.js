// api.js - Server-side proxy (if using Node.js/Express)
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/weather', async (req, res) => {
    try {
        const { city, lat, lon } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});
