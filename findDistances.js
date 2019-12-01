const axios = require("axios");
const fs = require('fs');
const googleInstance = axios.create({
    baseURL: 'https://maps.googleapis.com/maps/api/directions/json'
})
const cajeros = [
    { "lat": 4.726902, "lng": -74.060702 },
    { "lat": 4.711963, "lng": -74.070462 },
    { "lat": 4.593649, "lng": -74.124090 },
    { "lat": 4.672264, "lng": -74.153474 },
    { "lat": 4.666364, "lng": -74.12024 }
]

const puntosWhatever = [
    { lat: 4.709867, lng: -74.111879, name: 'Portal 80' },
    { lat: 4.754351, lng: -74.046478, name: 'Portal Norte' },
    { lat: 4.595608, lng: -74.169169, name: 'Portal Sur' },
    { lat: 4.627144, lng: -74.106822, name: 'Puente Aranda' }
]


async function calc() {
    let i = 1
    let res = [];
    for (const cajero of cajeros) {

        for (const punto of puntosWhatever) {
            let response = { from: punto.name, to: `Cajero ${i}` }

            const { data } = await googleInstance.get('', {
                params: {
                    origin: `${punto.lat},${punto.lng}`,
                    destination: `${cajero.lat},${cajero.lng}`,
                    key: 'AIzaSyB2Cj83JhIz00MNyvTZ7fNmqJs6sgu8OSE'
                }
            });
            
            response.distance = data.routes[0].legs[0].distance.value
            res.push(response);
        }

        i++;
    }

    fs.writeFileSync('./distances.json', JSON.stringify(res, null, 2));
}

calc()

