import * as cheerio from 'cheerio';

async function fetchUsdInr() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        console.log('USD-INR (Free API):', data.rates.INR);
    } catch (e) {
        console.log('Error', e);
    }
}

async function fetchGold() {
    try {
        // Fetch BankBazaar Gold
        const response = await fetch('https://www.bankbazaar.com/gold-rate-india.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find 24K and 22K from the page
        // The table usually has "24 Carat Gold Rate Per Gram" or similar
        // We can just use a regex on the whole HTML for "₹ 7,185" or something
        // or find the first occurrence of `₹` followed by digits in the table.
        // Actually, let's extract all matches of `₹ [0-9,]+`
        const matches = html.match(/₹\s*([0-9,]+)/g);
        console.log('BankBazaar Gold rates found:', matches ? matches.slice(0, 10) : 'none');
    } catch (e) {
        console.log('Error', e);
    }
}

fetchUsdInr();
fetchGold();
