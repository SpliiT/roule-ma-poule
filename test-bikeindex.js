async function testEndpoints() {
    const endpoints = [
        'https://bikeindex.org/api/v3/manufacturers',
        'https://bikeindex.org/api/v3/autocomplete',
        'https://bikeindex.org/api/v3/search/autocomplete',
        'https://bikeindex.org/api/v3/selections/manufacturers',
    ];

    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            console.log(`${url} -> ${res.status} ${res.statusText}`);
        } catch (e) {
            console.log(`${url} -> Error: ${e.message}`);
        }
    }
}

testEndpoints();
