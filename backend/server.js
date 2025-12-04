require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs'); // Import FS
const db = require('./db');
const productService = require('./services/productService');
const alertService = require('./services/alertService');
const { countries, products, countryDeals, exchangeRates: defaultRates } = require('./data');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve Static Files from Frontend Build (Production Mode)
const distPath = path.join(__dirname, '../frontend/dist');
const indexPath = path.join(distPath, 'index.html');

app.use(express.static(distPath));

// Check if build exists on startup
if (!fs.existsSync(indexPath)) {
    console.warn('\n⚠️  WARNING: Frontend build not found at:', indexPath);
    console.warn('   Please run "npm run build" in the root directory before starting the server.\n');
}

// In-memory storage for rates
let currentRates = { ...defaultRates };

// Fetch rates on startup
const fetchRates = async () => {
    try {
        console.log('Fetching real-time exchange rates...');
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/ILS');
        if (res.data && res.data.rates) {
            currentRates = res.data.rates;
            if (!currentRates['ILS']) currentRates['ILS'] = 1;
            console.log('Exchange rates updated successfully.');
        }
    } catch (error) {
        console.error('Failed to fetch rates, using defaults:', error.message);
    }
};

fetchRates();
setInterval(fetchRates, 3600000); // Update rates every hour

// Run Alert Worker every 60 seconds (for demo)
setInterval(() => {
    alertService.checkAlerts(currentRates);
}, 60000);

// API Endpoints

app.get('/api/countries', (req, res) => {
    res.json(countries);
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const origin = req.query.origin || 'IL';

    if (!query) return res.json([]);

    const results = await productService.searchProducts(query, origin, currentRates);
    res.json(results);
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const origin = req.query.origin || 'IL';
    
    const product = await productService.getProductById(id, origin, currentRates);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
});

app.get('/api/deals/:countryCode', (req, res) => {
    const { countryCode } = req.params;
    const dealCategories = countryDeals[countryCode] || [];
    
    const deals = products.filter(p => {
        return dealCategories.some(cat => cat.includes(p.category) || p.category.includes(cat));
    }).map(p => {
        return {
            ...p,
            priceInDestination: p.prices[countryCode]
        };
    });

    res.json({
        categories: dealCategories,
        products: deals
    });
});

// --- DB INTEGRATED ENDPOINTS ---

app.get('/api/favorites', (req, res) => {
    db.all('SELECT product_id FROM favorites', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const favIds = new Set(rows.map(r => r.product_id));
        const favProducts = products.filter(p => favIds.has(p.id));
        res.json(favProducts);
    });
});

app.post('/api/favorites', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send({ error: 'Missing ID' });

    db.run('INSERT OR IGNORE INTO favorites (product_id) VALUES (?)', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

app.delete('/api/favorites/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM favorites WHERE product_id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

app.post('/api/alerts', (req, res) => {
    const { email, product_id, target_price } = req.body;

    if (!email || !product_id || !target_price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare('INSERT INTO alerts (email, product_id, target_price) VALUES (?, ?, ?)');
    stmt.run(email, product_id, target_price, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, alertId: this.lastID });
    });
    stmt.finalize();
});

// Catch-All Route for React Router (Must be last)
// Supports Express 5 wildcard syntax
app.get(/(.*)/, (req, res) => {
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>Frontend Build Not Found ⚠️</h1>
                <p>The file <code>${indexPath}</code> is missing.</p>
                <p>Please run the following command in your terminal to build the frontend:</p>
                <pre style="background: #f4f4f4; padding: 15px; display: inline-block; border-radius: 5px;">npm run build</pre>
                <p>Then refresh this page.</p>
            </div>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
