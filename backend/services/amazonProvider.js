// Amazon Provider (via RapidAPI)
// This provider fetches real data when RAPID_API_KEY is present.

const axios = require('axios');
const { countries } = require('../data');

// Map our country codes to Amazon domains/TLDs used by APIs
const amazonDomains = {
    'US': 'US',
    'UK': 'GB',
    'DE': 'DE',
    'JP': 'JP',
    'FR': 'FR',
    'IL': 'US', // Israel usually shops from US or DE. Mapping to US for default.
    'TH': 'US'  // Fallback
};

const searchProducts = async (query, origin, exchangeRates) => {
    const apiKey = process.env.RAPID_API_KEY;
    const apiHost = process.env.RAPID_API_HOST || 'real-time-amazon-data.p.rapidapi.com';

    console.log(`[AmazonProvider] Searching for "${query}" via RapidAPI...`);

    try {
        // 1. We need to search in multiple countries to compare prices.
        // Doing this in real-time for ALL countries is slow and expensive (API quota).
        // For this prototype, we will search in the ORIGIN country + US + one other (e.g., DE) to demonstrate.
        
        // Let's define target countries to check
        const targetCountries = ['US', 'DE', 'JP', 'UK'];
        // Ensure origin is included if it's a supported amazon domain
        // (Skipping for now to keep it simple: we just fetch from US and simulate the comparison for the demo if we can't afford 5 calls per search)
        
        // BETTER STRATEGY FOR DEMO:
        // Fetch from ONE main source (e.g. Amazon US) to get the product details and image.
        // Then *estimate* the prices in other regions based on known indexes or just fetch from one more.
        
        // REAL STRATEGY:
        // We will perform a search on Amazon US to get the "Base" items.
        // Then we return those items.
        // The comparison part is tricky without fetching price from every country for every item.
        // For this Implementation: We will fetch the search results from US.
        // And we will 'simulate' the international prices by just applying a random variance 
        // because making 50 API calls (10 results * 5 countries) per user search is not feasible for a free tier.
        
        // However, if the user searches for a specific product (barcode/ASIN), we COULD fetch exact prices.
        
        const options = {
            method: 'GET',
            url: `https://real-time-amazon-data.p.rapidapi.com/search`,
            params: {
                query: query,
                country: 'US', // Search in US store
                page: '1'
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        };

        const response = await axios.request(options);
        const apiData = response.data.data.products; // Adjust based on actual API response structure
        
        if (!apiData || apiData.length === 0) return [];

        // Transform API data to our App structure
        return apiData.map(item => {
            const priceUSD = item.product_price ? parseFloat(item.product_price.replace('$', '').replace(',', '')) : 0;
            
            // If no price, skip
            if (!priceUSD) return null;

            // Normalize to our data structure
            // We have the US Price. We need to generate/estimate others or fetch them (Mocking the others for now to save API calls)
            
            const prices = {};
            
            // Set Real US Price
            prices['US'] = priceUSD;
            
            // Estimate others based on typical market differences + exchange rates (Mocking the cross-country diff)
            // In a full production app, we would take the ASIN and check other marketplaces.
            prices['DE'] = Math.round(priceUSD * 0.95); // Euro number usually lower but value higher
            prices['UK'] = Math.round(priceUSD * 0.85);
            prices['JP'] = Math.round(priceUSD * 110); // Yen is huge number
            prices['IL'] = Math.round(priceUSD * 4.5); // Import taxes etc
            prices['TH'] = Math.round(priceUSD * 35);

            // Now run standard comparison logic using our exchange rates
            const originRate = exchangeRates[origin] || 1;
            const shelfPriceAtOrigin = prices[origin]; // Estimated shelf price at origin

            const comparisons = Object.keys(prices).map(countryCode => {
                if (countryCode === origin) return null;
                const country = countries.find(c => c.code === countryCode);
                if (!country) return null;

                const shelfPriceInLocal = prices[countryCode];
                const localRate = exchangeRates[countryCode];
                
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
                id: item.asin,
                name: item.product_title.substring(0, 50) + (item.product_title.length > 50 ? '...' : ''),
                category: item.product_category || 'General',
                image: item.product_photo,
                basePriceILS: 0, // Not used in this mode
                originPrice: shelfPriceAtOrigin,
                comparisons
            };
        }).filter(Boolean);

    } catch (error) {
        console.error('Error in AmazonProvider:', error.message);
        return [];
    }
};

module.exports = { searchProducts };
