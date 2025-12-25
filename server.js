// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Weather endpoint
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        // Validate inputs
        if ((!lat || !lon) && !city) {
            return res.status(400).json({ error: 'Lat/lon or city name required' });
        }
        
        let url;
        if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        }
        
        const response = await axios.get(url, {
            timeout: 5000 // 5 second timeout
        });
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        console.error('Weather API error:', error.message);
        
        // Send user-friendly error messages
        if (error.response?.status === 401) {
            res.status(500).json({ error: 'Server authentication error' });
        } else if (error.response?.status === 404) {
            res.status(404).json({ error: 'City not found' });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({ error: 'Request timeout' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});