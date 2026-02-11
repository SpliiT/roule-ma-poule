async function testQueryOrder() {
    const queries = ['rockrider 520', '520 rockrider'];
    for (const q of queries) {
        const url = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(q)}&per_page=5&stolenness=all`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Query: ${q}`);
            data.bikes?.forEach(b => {
                console.log(`- ${b.manufacturer_name} ${b.frame_model}`);
            });
            console.log('---');
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
testQueryOrder();
