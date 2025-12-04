const db = require('../db');
const productService = require('./productService');

// Simple in-memory lock to prevent overlapping checks
let isChecking = false;

const checkAlerts = async (currentRates) => {
    if (isChecking) return;
    isChecking = true;
    console.log('[AlertWorker] Starting price check...');

    try {
        // Fetch all alerts
        db.all('SELECT * FROM alerts', [], async (err, alerts) => {
            if (err) {
                console.error('[AlertWorker] Error fetching alerts:', err.message);
                isChecking = false;
                return;
            }

            if (alerts.length === 0) {
                console.log('[AlertWorker] No active alerts.');
                isChecking = false;
                return;
            }

            console.log(`[AlertWorker] Checking ${alerts.length} alerts...`);

            for (const alert of alerts) {
                try {
                    // Fetch current product details
                    // Assuming target_price was set in ILS (default origin in UI)
                    // We check the price in 'IL' context.
                    const product = await productService.getProductById(alert.product_id, 'IL', currentRates);
                    
                    if (!product) {
                        console.warn(`[AlertWorker] Product ${alert.product_id} not found.`);
                        continue;
                    }

                    const currentPrice = product.originPrice; // This is in ILS based on our logic

                    if (currentPrice <= alert.target_price) {
                        console.log(`\n🔔 [ALERT TRIGGERED] 🔔`);
                        console.log(`To: ${alert.email}`);
                        console.log(`Product: ${product.name}`);
                        console.log(`Current Price: ${currentPrice} ₪`);
                        console.log(`Target Price: ${alert.target_price} ₪`);
                        console.log(`Action: Sending Email...\n`);
                        
                        // "Send" the email (Simulated)
                        
                        // Remove the alert so we don't spam the user every minute
                        db.run('DELETE FROM alerts WHERE id = ?', [alert.id], (delErr) => {
                            if (delErr) console.error('[AlertWorker] Error deleting alert:', delErr.message);
                            else console.log(`[AlertWorker] Alert ${alert.id} removed from DB.`);
                        });
                    }
                } catch (innerErr) {
                    console.error(`[AlertWorker] Error checking alert ${alert.id}:`, innerErr.message);
                }
            }
            isChecking = false;
        });
    } catch (e) {
        console.error('[AlertWorker] Unexpected error:', e);
        isChecking = false;
    }
};

module.exports = { checkAlerts };
