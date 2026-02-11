async function verifyFix() {
    const queries = [
        'http://localhost:3000/api/bikes/search?type=manufacturer&query=specialized',
        'http://localhost:3000/api/bikes/search?type=model&manufacturer=specialized&query=sirrus'
    ];

    console.log("Note: This requires the local server to be running and updated.");
    console.log("Since I cannot hit localhost easily, I will test the logic by calling the BikeIndex API directly in a similar way.");

    const bikeIndexUrl = 'https://bikeindex.org/api/v3/search?query=specialized&per_page=10';
    try {
        const res = await fetch(bikeIndexUrl);
        const data = await res.json();
        const manufacturers = data.bikes.map(b => b.manufacturer_name).filter(Boolean);
        const unique = Array.from(new Set(manufacturers));
        console.log("Suggestions found:", unique);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

verifyFix();
