import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'daily-rates.json');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
};

async function fetchFuel(url) {
    try {
        const response = await fetch(url, { headers: HEADERS });
        const html = await response.text();
        const regex = /Today's .*? Price is ([0-9.]+) rupee/i;
        const match = html.match(regex);
        return match && match[1] ? parseFloat(match[1]) : 0;
    } catch (e) {
        return 0;
    }
}

async function fetchUsdInr() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        return data.rates.INR;
    } catch (e) {
        return 83.50; // Fallback
    }
}

async function fetchGoldSilver() {
    try {
        // Scrape BankBazaar Gold
        const response = await fetch('https://www.bankbazaar.com/gold-rate-india.html', { headers: HEADERS });
        const html = await response.text();
        
        // Very basic extraction strategy. Usually the first few matches for "₹ xx,xxx" are the 22k and 24k rates for 10g
        const matches = html.match(/₹\s*([0-9,]+)/g);
        let gold24k = 72000;
        let silver1kg = 90000;
        
        if (matches && matches.length >= 2) {
            // Remove ₹ and commas, then parse
            const parseAmount = (str) => parseInt(str.replace(/[^0-9]/g, ''), 10);
            
            // For bankbazaar, the values are often in the 70000+ range. Let's just grab the first valid 24k-looking number (70000 - 90000)
            const amounts = matches.map(parseAmount).filter(v => !isNaN(v) && v > 50000);
            if (amounts.length > 0) {
                // Approximate base values
                gold24k = amounts[0]; // the first large number is usually the current 24k or 22k rate
            }
        }
        return { gold24k, silver1kg };
    } catch (e) {
        return { gold24k: 72000, silver1kg: 90000 };
    }
}

async function run() {
    console.log('Fetching daily rates...');
    
    // 1. Fetch Fuel
    const delhiPetrol = await fetchFuel('https://www.ndtv.com/fuel-prices/petrol-price-in-new-delhi-city') || 94.72;
    const delhiDiesel = await fetchFuel('https://www.ndtv.com/fuel-prices/diesel-price-in-new-delhi-city') || 87.62;
    const delhiCng = await fetchFuel('https://www.ndtv.com/fuel-prices/cng-price-in-new-delhi-city') || 74.09;
    const mumbaiPetrol = await fetchFuel('https://www.ndtv.com/fuel-prices/petrol-price-in-mumbai-city') || 104.21;
    
    // 2. Fetch USD/INR
    const usdInr = await fetchUsdInr();
    
    // 3. Fetch Gold/Silver
    const { gold24k, silver1kg } = await fetchGoldSilver();

    const data = {
        lastUpdated: new Date().toISOString(),
        fuel: {
            delhi: { petrol: delhiPetrol, diesel: delhiDiesel, cng: delhiCng },
            mumbai: { petrol: mumbaiPetrol }
        },
        currency: {
            usdInr: usdInr
        },
        bullion: {
            gold24k_10g: gold24k,
            silver_1kg: silver1kg
        }
    };

    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Successfully updated daily rates at', DATA_FILE);
}

run();
