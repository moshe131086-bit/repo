const mockProvider = require('./mockProvider');
const amazonProvider = require('./amazonProvider');

const searchProducts = async (query, origin, exchangeRates) => {
    // Check if API Key is set
    if (process.env.RAPID_API_KEY) {
        try {
            const results = await amazonProvider.searchProducts(query, origin, exchangeRates);
            if (results.length > 0) {
                return results;
            }
        } catch (err) {
            console.error('Amazon Provider Failed, falling back to Mock:', err.message);
        }
    }
    
    // Default / Fallback
    return mockProvider.searchProducts(query, origin, exchangeRates);
};

const getProductById = async (id, origin, exchangeRates) => {
    // For prototype, we primarily use Mock Provider for ID lookup 
    // because Amazon Search API results don't persist in our DB, so "IDs" (ASINs) might not be found in local mock data.
    // If we want to support Real API details, we would need to fetch by ASIN from Amazon.
    
    // For now, always check mock first.
    let product = await mockProvider.getProductById(id, origin, exchangeRates);
    
    // If not found in mock and we have API key, try fetching from Amazon (Not implemented yet for single item, but structure allows it)
    
    return product;
};

module.exports = { searchProducts, getProductById };
