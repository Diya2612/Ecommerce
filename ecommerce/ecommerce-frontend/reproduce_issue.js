
// Using global fetch (Node.js 18+)

async function testEndpoints() {
    console.log('Testing Primary URL: http://localhost:8000/api/products/featured');
    try {
        const res1 = await fetch('http://localhost:8000/api/products/featured');
        console.log(`Primary URL Status: ${res1.status}`);
        if (!res1.ok) {
            try {
                const text = await res1.text();
                console.log('Primary URL Error Body:', text);
            } catch (e) {
                console.log('Could not read error body');
            }
        } else {
            const data = await res1.json();
            console.log(`Primary URL Success, items: ${data.data?.length}`);
        }
    } catch (error) {
        console.error('Primary URL Network Error:', error.message);
    }

    console.log('\nTesting Fallback URL: http://127.0.0.1:8000/api/products/featured');
    try {
        const res2 = await fetch('http://127.0.0.1:8000/api/products/featured');
        console.log(`Fallback URL Status: ${res2.status}`);
        if (!res2.ok) {
            const text = await res2.text();
            console.log('Fallback URL Error Body:', text);
        } else {
            const data = await res2.json();
            console.log(`Fallback URL Success, items: ${data.data?.length}`);
        }
    } catch (error) {
        console.error('Fallback URL Network Error:', error.message);
    }
}

testEndpoints();
