async function testFiltering() {
    // Test searching for "sirrus" with and without manufacturer Specialized
    const urls = [
        'https://bikeindex.org/api/v3/search?query=sirrus&per_page=5',
        'https://bikeindex.org/api/v3/search?query=sirrus&manufacturer=Specialized&per_page=5',
        'https://bikeindex.org/api/v3/search?manufacturer=Specialized&per_page=5' // Empty query
    ];

    for (const url of urls) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`URL: ${url}`);
            const results = data.bikes.map(b => `${b.manufacturer_name} - ${b.frame_model}`);
            console.log("Results:", results);
            console.log('---');
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}

testFiltering();
