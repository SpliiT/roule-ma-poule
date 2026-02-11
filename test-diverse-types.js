async function testDiverseTypes() {
    const queries = ['specialized rockhopper', 'trek road', 'cargo bike', 'electric gravel', 'folding bike'];
    for (const q of queries) {
        const url = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(q)}&per_page=3`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Query: ${q}`);
            data.bikes?.forEach(b => {
                console.log(`- ${b.manufacturer_name} ${b.frame_model}: type=${b.cycle_type_slug}, propulsion=${b.propulsion_type_slug}`);
            });
            console.log('---');
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
testDiverseTypes();
