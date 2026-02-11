async function testBikeStructure() {
    const url = 'https://bikeindex.org/api/v3/search?query=specialized&per_page=1';
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.bikes && data.bikes.length > 0) {
            console.log(JSON.stringify(data.bikes[0], null, 2));
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

testBikeStructure();
