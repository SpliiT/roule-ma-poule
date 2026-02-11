async function testDetailedResults() {
    const q = 'rockrider 520';
    const url = `https://bikeindex.org/api/v3/search?query=${encodeURIComponent(q)}&per_page=20&stolenness=all`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`Query: ${q}`);
        data.bikes?.forEach(b => {
            console.log(`- Brand: ${b.manufacturer_name} | Model: ${b.frame_model} | Stolen: ${b.stolen} | L_Img: ${!!b.large_img} | Thmb: ${!!b.thumb}`);
        });
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testDetailedResults();
