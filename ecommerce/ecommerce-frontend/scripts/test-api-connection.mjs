// scripts/test-api-connection.mjs
import fetch from 'node-fetch'; // Next.js 13+ usually has global fetch, but we'll use node-fetch if needed or native
// In modern Node (18+), fetch is global. We'll try global first.

async function testConnection(url) {
    console.log(`Testing connection to: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const json = await res.json();
            console.log('Success! Data length:', json.data ? json.data.length : 'N/A');
        } else {
            console.log('Failed to fetch.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
    console.log('---');
}

(async () => {
    await testConnection('http://localhost:8000/api/products/featured');
    await testConnection('http://127.0.0.1:8000/api/products/featured');
})();
