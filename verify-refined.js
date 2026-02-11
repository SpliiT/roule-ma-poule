async function verifyRefinedSearch() {
    // Testing filtered search
    const url = 'https://bikeindex.org/api/v3/search?query=specialized&stolenness=non&per_page=20';
    try {
        const res = await fetch(url);
        const data = await res.json();
        const bikes = data.bikes || [];
        
        // Manual filter check (what my backend does now)
        const withImages = bikes.filter(b => b.large_img || b.thumb);
        const stolen = withImages.filter(b => b.stolen);
        
        console.log(`Total bikes from API (non-stolen request): ${bikes.length}`);
        console.log(`Bikes with images: ${withImages.length}`);
        console.log(`Stolen bikes found in "non-stolen" results: ${stolen.length}`);
        
        if (withImages.length > 0) {
            console.log("Example Refined Suggestion:", {
                brand: withImages[0].manufacturer_name,
                model: withImages[0].frame_model,
                hasImage: true,
                stolen: withImages[0].stolen
            });
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
verifyRefinedSearch();
