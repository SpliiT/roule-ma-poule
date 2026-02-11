async function testStolenness() {
    const params = ['non', 'stolen', 'all', 'proximity'];
    for (const p of params) {
        const url = `https://bikeindex.org/api/v3/search?query=specialized&stolenness=${p}&per_page=5`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Stolenness: ${p}`);
            const results = data.bikes?.map(b => `${b.manufacturer_name} ${b.frame_model} (Stolen: ${b.stolen}) - Image: ${!!(b.large_img || b.thumb)}`);
            console.log("Results:", results);
            console.log('---');
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
testStolenness();
