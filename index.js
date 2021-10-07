mapboxgl.accessToken = 'pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmIxcnkxZm84MnVtcHNlZm5oMnJvIn0.YoorBwfMIiBKtJ7kNaXn3Q';

const instructions = document.getElementById('instructions');
const posbtn = document.getElementById('pos-button');
const searchbtn = document.getElementById('search-button');

posbtn.addEventListener("click", function () {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
        enableHighAccuracy: true
    });
})

function successLocation(position) {
    console.log(position);
    startCoords = [position.coords.longitude, position.coords.latitude]

}

function errorLocation() {
    startCoords = [18.060895062683944, 59.33081928392888]
}

let startCoords = []
//These will be the coordinates used for the destination
let endCoords = []


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [17.936536, 59.224263], // starting position
    zoom: 12
})

//Adds the navigation controlls to the map in the top right corner
const nav = new mapboxgl.NavigationControl();
map.addControl(nav);

let geocoder1 = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    placeholder: "Start position",
    flyTo: false,
    mapboxgl: mapboxgl
});

const geocoder2 = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: false,
    placeholder: "End position",
    flyTo: false,
    mapboxgl: mapboxgl
});


document.getElementById('geocoder1').appendChild(geocoder1.onAdd(map));
document.getElementById('geocoder2').appendChild(geocoder2.onAdd(map));


// const start = [-122.662323, 45.523751];

async function getRoute(end) {
    // make a directions request using driving profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
    //Adding the trip duration to the instructions div
    instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
        data.duration / 60
    )} min </strong></p>`;
}

map.on('load', () => {
    // make an initial directions request that
    // starts and ends at the same location
    // getRoute(start);
    map.addSource('single-point', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': []
        }
    });

    // Add starting point to the map
    map.addLayer({
        id: 'point',
        'source': 'single-point',
        type: 'circle',
        paint: {
            'circle-radius': 10,
            'circle-color': '#3887be'
        }
    });

    //The searchfield result for the starting position
    geocoder1.on('result', ({ result }) => {
        startCoords = result.center
        console.log(result.center);
    });

    //The searchfield result for the ending position
    geocoder2.on('result', ({ result }) => {
        endCoords = result.center
        console.log(result.center);
    });


    searchbtn.addEventListener("click", function () {
        const start = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: startCoords
                    }
                }
            ]
        };

        const end = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: endCoords
                    }
                }
            ]
        };

        if (map.getLayer('start')) {
            map.getSource('start').setData(start);
        } else {
            map.addLayer({
                id: 'start',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: startCoords
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': 'blue'
                }
            });
        }

        console.log(endCoords)
        if (map.getLayer('end')) {
            map.getSource('end').setData(end);
        } else {
            map.addLayer({
                id: 'end',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: endCoords
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#f30'
                }
            });
        }
        getRoute(endCoords);
        instructions.classList.remove("invisible");
    });

});
    //Syntax for searching places and getting their pos
    //https://api.mapbox.com/geocoding/v5/mapbox.places/Bergs%C3%A4ttrav%C3%A4gen12.json?worldview=cn&access_token=pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmIxcnkxZm84MnVtcHNlZm5oMnJvIn0.YoorBwfMIiBKtJ7kNaXn3Q


