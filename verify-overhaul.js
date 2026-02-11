async function verifyOverhaul() {
    console.log("Testing new API response format...");
    const url = 'http://localhost:3000/api/bikes/search?type=model&query=specialized%20sirrus';
    
    // Simulating the backend logic since I can't hit localhost easily
    const bikeIndexUrl = 'https://bikeindex.org/api/v3/search?query=specialized%20sirrus&per_page=5';
    try {
        const res = await fetch(bikeIndexUrl);
        const data = await res.json();
        const bikes = data.bikes || [];
        
        const suggestions = bikes.map((bike) => ({
            id: bike.id,
            brand: bike.manufacturer_name,
            model: bike.frame_model,
            year: bike.year,
            image: bike.large_img || bike.thumb,
            type: bike.cycle_type_slug,
            isElectric: bike.propulsion_type_slug === 'ebike-pedelec' || bike.propulsion_type_slug === 'ebike-throttle'
        }));

        console.log("Simulated API Output (first result):", JSON.stringify(suggestions[0], null, 2));
        
        // Testing mapping
        const mapping = {
            'mountain': 'VTT',
            'road': 'ROAD',
            'bike': 'CITY'
        };
        const mappedType = mapping[suggestions[0].type] || 'CITY';
        console.log("Mapped Type:", mappedType);
        
    } catch (e) {
        console.log("Error:", e.message);
    }
}

verifyOverhaul();
