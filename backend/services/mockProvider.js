// Mock Data Provider
// Used when no real API key is provided

const { products, countries } = require('../data');

const getProductById = async (id, origin, exchangeRates) => {
    const product = products.find(p => p.id === id);
    if (!product) return null;

    // Logic similar to searchProducts but for single item
    const originRate = exchangeRates[origin] || 1;
    // Find origin currency
    const originCountry = countries.find(c => c.code === origin);
    const originCurrency = originCountry ? originCountry.currency : 'ILS';

    const shelfPriceAtOrigin = product.prices[origin];
    
    const comparisons = Object.keys(product.prices).map(countryCode => {
        if (countryCode === origin) return null;
        
        const country = countries.find(c => c.code === countryCode);
        if (!country) return null;
        
        const localCurrency = country.currency;
        const shelfPriceInLocal = product.prices[countryCode];
        const localRate = exchangeRates[localCurrency];
        
        if (!localRate) return null;
        
        const priceInOriginCurrency = (shelfPriceInLocal / localRate) * originRate;
        const diff = shelfPriceAtOrigin - priceInOriginCurrency;
        const savingsPercent = Math.round((diff / shelfPriceAtOrigin) * 100);

        return {
            country,
            price: shelfPriceInLocal,
            convertedPrice: Math.round(priceInOriginCurrency),
            savings: Math.round(diff),
            savingsPercent: savingsPercent
        };
    }).filter(Boolean);

    // Mock Price History (Last 6 months)
    // Generate random trend based on base price
    const history = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < 6; i++) {
        const variance = (Math.random() * 0.2) - 0.1; // +/- 10%
        history.push({
            month: months[i],
            price: Math.round(shelfPriceAtOrigin * (1 + variance))
        });
    }

    return {
        ...product,
        originPrice: shelfPriceAtOrigin,
        comparisons,
        history,
        currencySymbol: originCountry ? originCountry.symbol : '?'
    };
};

const searchProducts = async (query, origin, exchangeRates) => {
    // console.log(`[MockProvider] Searching for "${query}" from origin ${origin}`);
    // console.log(`[MockProvider] Rates keys: ${Object.keys(exchangeRates)}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!query) return [];

    return products.filter(p => p.name.toLowerCase().includes(query)).map(p => {
        // Find currency for origin country
        const originCountry = countries.find(c => c.code === origin);
        if (!originCountry) return null; // Should not happen

        const originCurrency = originCountry.currency;
        const originRate = exchangeRates[originCurrency];
        
        // If originRate is undefined, we can't convert properly.
        if (!originRate) {
             console.error(`Missing rate for origin: ${origin} (Currency: ${originCurrency})`);
        }

        const shelfPriceAtOrigin = p.prices[origin];
        
        const comparisons = Object.keys(p.prices).map(countryCode => {
            if (countryCode === origin) return null;
            
            const country = countries.find(c => c.code === countryCode);
            if (!country) return null;
            
            const localCurrency = country.currency;
            const shelfPriceInLocal = p.prices[countryCode];
            const localRate = exchangeRates[localCurrency];
            
            if (!localRate) {
                // console.warn(`Missing rate for ${countryCode} (Currency: ${localCurrency})`);
                return {
                     country,
                     price: shelfPriceInLocal,
                     convertedPrice: null,
                     savings: null,
                     savingsPercent: null
                };
            }
            
            // Conversion logic: (PriceLocal / LocalRate) * OriginRate
            const priceInOriginCurrency = (shelfPriceInLocal / localRate) * originRate;
            
            const diff = shelfPriceAtOrigin - priceInOriginCurrency;
            const savingsPercent = Math.round((diff / shelfPriceAtOrigin) * 100);

            return {
                country,
                price: shelfPriceInLocal,
                convertedPrice: Math.round(priceInOriginCurrency),
                savings: Math.round(diff),
                savingsPercent: savingsPercent
            };
        }).filter(Boolean);

        return {
            ...p,
            originPrice: shelfPriceAtOrigin,
            comparisons
        };
    }).filter(Boolean);
};

module.exports = { searchProducts, getProductById };
