async function testManufacturers() {
    const url = 'https://bikeindex.org/api/v3/manufacturers?query=specialized';
    try {
        const res = await fetch(url);
        console.log(`${url} -> ${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log(JSON.stringify(data).substring(0, 500));
    } catch (e) {
        console.log(`${url} -> Error: ${e.message}`);
    }
}

testManufacturers();
