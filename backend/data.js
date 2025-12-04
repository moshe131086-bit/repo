const countries = [
    { code: 'IL', name: 'ישראל', currency: 'ILS', symbol: '₪', region: 'Asia' },
    { code: 'US', name: 'ארצות הברית', currency: 'USD', symbol: '$', region: 'North America' },
    { code: 'DE', name: 'גרמניה', currency: 'EUR', symbol: '€', region: 'Europe' },
    { code: 'UK', name: 'אנגליה', currency: 'GBP', symbol: '£', region: 'Europe' },
    { code: 'TH', name: 'תאילנד', currency: 'THB', symbol: '฿', region: 'Asia' },
    { code: 'JP', name: 'יפן', currency: 'JPY', symbol: '¥', region: 'Asia' }
];

const exchangeRates = {
    'ILS': 1,
    'USD': 3.75,
    'EUR': 4.05,
    'GBP': 4.75,
    'THB': 0.10,
    'JPY': 0.025
};

// Updated prices to be realistic Shelf Prices in LOCAL CURRENCY
const products = [
    {
        id: 'p1',
        name: 'Labubu The Monster',
        category: 'Toys',
        image: 'https://placehold.co/400x400/FF6B6B/FFFFFF/png?text=Labubu+Toy',
        basePriceILS: 150, 
        prices: { 
            'IL': 150,   // ILS
            'US': 40,    // USD (~150 ILS)
            'TH': 1200,  // THB (~120 ILS)
            'JP': 4500,  // JPY (~110 ILS)
            'DE': 35,    // EUR (~140 ILS)
            'UK': 30     // GBP (~140 ILS)
        }
    },
    {
        id: 'p2',
        name: 'iPhone 15 128GB',
        category: 'Electronics',
        image: 'https://placehold.co/400x400/4ECDC4/FFFFFF/png?text=iPhone+15',
        basePriceILS: 3500,
        prices: { 
            'IL': 3999, // ILS
            'US': 799,  // USD
            'JP': 124800, // JPY
            'DE': 949,  // EUR
            'TH': 32900, // THB
            'UK': 799   // GBP
        }
    },
    {
        id: 'p3',
        name: 'MAC Lipstick',
        category: 'Cosmetics',
        image: 'https://placehold.co/400x400/FFD93D/333333/png?text=MAC+Lipstick',
        basePriceILS: 110,
        prices: { 
            'IL': 115, 
            'US': 23, 
            'UK': 22, 
            'DE': 24, 
            'TH': 900, 
            'JP': 3500 
        }
    },
    {
        id: 'p4',
        name: 'Levi\'s 501 Jeans',
        category: 'Clothing',
        image: 'https://placehold.co/400x400/1A535C/FFFFFF/png?text=Levis+Jeans',
        basePriceILS: 400,
        prices: { 
            'IL': 450, 
            'US': 60, 
            'UK': 80, 
            'DE': 90, 
            'TH': 2500, 
            'JP': 11000 
        }
    },
    {
        id: 'p5',
        name: 'Sony WH-1000XM5',
        category: 'Electronics',
        image: 'https://placehold.co/400x400/333333/FFFFFF/png?text=Sony+Headphones',
        basePriceILS: 1400,
        prices: { 
            'IL': 1600, 
            'US': 348, 
            'JP': 48000, 
            'DE': 329, 
            'TH': 11000, 
            'UK': 299 
        }
    },
    {
        id: 'p6',
        name: 'Matcha Tea Set',
        category: 'Food',
        image: 'https://placehold.co/400x400/95D5B2/1B4332/png?text=Matcha+Set',
        basePriceILS: 200,
        prices: { 
            'IL': 250, 
            'US': 40, 
            'JP': 3000, 
            'DE': 45, 
            'TH': 1500, 
            'UK': 35 
        }
    },
    {
        id: 'p7',
        name: 'Nintendo Switch OLED',
        category: 'Electronics',
        image: 'https://placehold.co/400x400/E60012/FFFFFF/png?text=Nintendo+Switch',
        basePriceILS: 1600,
        prices: { 
            'IL': 1750, 
            'US': 349, 
            'JP': 37980, 
            'DE': 349, 
            'TH': 12900, 
            'UK': 309 
        }
    },
    {
        id: 'p8',
        name: 'Dyson Airwrap',
        category: 'Beauty',
        image: 'https://placehold.co/400x400/FF0099/FFFFFF/png?text=Dyson+Airwrap',
        basePriceILS: 2500,
        prices: { 
            'IL': 2800, 
            'US': 599, 
            'JP': 63000, 
            'DE': 549, 
            'TH': 21900, 
            'UK': 479 
        }
    },
    {
        id: 'p9',
        name: 'Nike Air Force 1',
        category: 'Clothing',
        image: 'https://placehold.co/400x400/111111/FFFFFF/png?text=Nike+AF1',
        basePriceILS: 450,
        prices: { 
            'IL': 550, 
            'US': 110, 
            'JP': 12000, 
            'DE': 119, 
            'TH': 3800, 
            'UK': 109 
        }
    },
    {
        id: 'p10',
        name: 'iPad Air 5',
        category: 'Electronics',
        image: 'https://placehold.co/400x400/999999/FFFFFF/png?text=iPad+Air',
        basePriceILS: 2800,
        prices: { 
            'IL': 3100, 
            'US': 599, 
            'JP': 92800, 
            'DE': 699, 
            'TH': 23900, 
            'UK': 669 
        }
    }
];

const countryDeals = {
    'US': ['Electronics', 'Clothing (Brands)', 'Vitamins', 'Beauty', 'Toys'],
    'TH': ['Clothing (Local)', 'Food', 'Toys', 'Spa Products', 'Electronics'],
    'JP': ['Electronics', 'Anime Figures', 'Cosmetics', 'Watches', 'Food', 'Clothing'],
    'DE': ['Cosmetics (Pharmacy)', 'Kitchenware', 'Chocolate', 'Beer', 'Clothing', 'Beauty'],
    'UK': ['Tea', 'Fashion', 'Books', 'Beauty'],
    'IL': ['Dead Sea Products', 'Bamba', 'Food']
};

module.exports = { countries, exchangeRates, products, countryDeals };
