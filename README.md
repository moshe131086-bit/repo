# Global Price 🌍

Global Price is a modern web application for comparing product prices across different countries, helping users find the best deals globally and plan shopping for their travels.

## Features

- **Global Search:** Compare the price of a product in your home country vs. major international markets (US, Japan, Germany, etc.).
- **Real-Time Exchange Rates:** Automatically converts prices using live exchange rates.
- **Smart Recommendations:** "Best Buy" recommendations for specific destinations (e.g., what to buy in Japan).
- **Favorites:** Save products to a wishlist.
- **Price Alerts:** Set a target price and get notified (simulated) when the price drops.
- **Product Details:** Historical price charts and detailed comparison tables.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React.
- **Backend:** Node.js, Express, SQLite.
- **Architecture:** Service-based architecture with support for Mock Data and Real APIs (RapidAPI).

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  Clone the repository.
2.  Install dependencies for both frontend and backend:

    ```bash
    cd global-price
    npm install
    # This runs the postinstall script which installs deps in /backend and /frontend
    ```

3.  Build the frontend:

    ```bash
    npm run build
    ```

### Running the App

Start the server (which serves the frontend):

```bash
npm start
```

The application will be available at [http://localhost:3001](http://localhost:3001).

### Development Mode

To run frontend and backend separately (for hot-reloading):

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Configuration

The application uses `dotenv` for configuration. Create a `.env` file in `global-price/backend`:

```env
PORT=3001
RAPID_API_KEY=your_key_here  # Optional: For real Amazon data
```

If no API Key is provided, the system falls back to a realistic Mock Data provider.
"# Global-price." 
