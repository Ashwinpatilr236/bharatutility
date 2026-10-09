import * as fs from 'fs/promises';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'fuel-prices.json');

async function fetchNDTVPrice(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const html = await response.text();
        
        // NDTV has a very reliable meta description:
        // content="Today's New Delhi Petrol Price is 94.72 rupee per litre..."
        const regex = /Today's .*? Price is ([0-9.]+) rupee/i;
        const match = html.match(regex);
        
        if (match && match[1]) {
            return parseFloat(match[1]);
        }
        return 0;
    } catch (e) {
        console.error('Failed to fetch from NDTV', e);
        return 0;
    }
}

async function scrapePrices() {
    try {
        console.log('Fetching fuel prices from NDTV...');
        
        let delhiPetrol = await fetchNDTVPrice('https://www.ndtv.com/fuel-prices/petrol-price-in-new-delhi-city');
        let delhiDiesel = await fetchNDTVPrice('https://www.ndtv.com/fuel-prices/diesel-price-in-new-delhi-city');
        let delhiCng = await fetchNDTVPrice('https://www.ndtv.com/fuel-prices/cng-price-in-new-delhi-city');

        console.log(`Delhi Petrol: ${delhiPetrol}, Diesel: ${delhiDiesel}, CNG: ${delhiCng}`);

        // Default fallbacks if scraping fails (current prices)
        if (!delhiPetrol) delhiPetrol = 94.72;
        if (!delhiDiesel) delhiDiesel = 87.62;
        if (!delhiCng) delhiCng = 74.09;

        const data = {
            lastUpdated: new Date().toISOString(),
            cities: [
                {
                    city: 'Delhi (NCR)',
                    state: 'Delhi',
                    petrol: delhiPetrol,
                    diesel: delhiDiesel,
                    cng: delhiCng
                }
            ]
        };

        const dir = path.dirname(DATA_FILE);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Successfully updated fuel prices at', DATA_FILE);

    } catch (error) {
        console.error('Error in script:', error);
        process.exit(1);
    }
}

scrapePrices();
