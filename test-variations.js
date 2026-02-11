async function testVariations() {
    const variations = [
        'https://bikeindex.org/api/v3/manufacturers?query=specialized',
        'https://bikeindex.org/api/v3/manufacturers?q=specialized',
        'https://bikeindex.org/api/v3/manufacturers?name=specialized',
        'https://bikeindex.org/api/v3/search?query=specialized&per_page=1',
        'https://bikeindex.org/api/v3/autocomplete/manufacturer?query=specialized',
    ];

    for (const url of variations) {
        try {
            const res = await fetch(url);
            console.log(`URL: ${url}`);
            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`Data (preview): ${JSON.stringify(data).substring(0, 200)}`);
            }
            console.log('---');
        } catch (e) {
            console.log(`URL: ${url} -> Error: ${e.message}`);
            console.log('---');
        }
    }
}

testVariations();
