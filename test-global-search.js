async function testGlobalSearch() {
    const queries = ['rockrider 520', 'decathlon 520', 'specialized sirrus'];
    for (const q of queries) {
        const url = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(q)}&per_page=10&stolenness=non`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log(`Query: ${q}`);
            data.bikes?.forEach(b => {
                console.log(`- Brand: ${b.manufacturer_name} | Model: ${b.frame_model} | Title: ${b.title}`);
            });
            console.log('---');
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}
testGlobalSearch();
