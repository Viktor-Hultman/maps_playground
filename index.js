//Token for accessing the api
mapboxgl.accessToken = 'pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmIxcnkxZm84MnVtcHNlZm5oMnJvIn0.YoorBwfMIiBKtJ7kNaXn3Q';

const instructions = document.getElementById('instructions');
const posbtn = document.getElementById('pos-button');
const searchbtn = document.getElementById('search-button');
const checkboxStart = document.getElementById('start')
const checkboxEnd = document.getElementById('end')

posbtn.addEventListener("click", function () {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
        enableHighAccuracy: true
    });
})

//If the user allow the program to use their location, the start location will be set to their current location
function successLocation(position) {
    startCoords = [position.coords.longitude, position.coords.latitude]
    checkboxStart.checked = true
    console.log(startCoords)
}

function errorLocation() {
    return
}

//Function for calculating the center point of start and end coords
function centerMap(startLong, startLat, endLong, endLat) {
    let long = (startLong + endLong) / 2;
    let lat = (startLat + endLat) / 2;
    centerOfTrip = [long, lat]
}

//Function for calculating amount of zoom on the map depending on the trip duration
function calcMapZoom(dist) {
    if (dist < 5) {
        mapZoom = 12
    } else if (dist < 10) {
        mapZoom = 11
    } else if (dist < 15) {
        mapZoom = 10
    } else if (dist < 30) {
        mapZoom = 9
    } else if (dist < 50) {
        mapZoom = 8.7
    } else if (dist < 60) {
        mapZoom = 8.5
    }else if (dist < 70) {
        mapZoom = 8.2
    } else if (dist < 90) {
        mapZoom = 8
    } else if (dist < 150) {
        mapZoom = 7
    } else {
        mapZoom = 6
    }
    console.log(tripDistance)
    console.log(mapZoom)
}
//These will be the coordinates used for the trip start and end destination
let startCoords = []
let endCoords = []
let centerOfTrip = []
let tripDuration
let tripDistance
let mapZoom = 12

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


//This async function is for getting the route for the trip and then find the distance
async function getTrip(end) {
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );
    const json = await query.json();
    const data = json.routes[0];

    // tripDuration = Math.round(data.duration / 60)
    tripDistance = Number((data.distance / 1000).toFixed(1))

    calcMapZoom(tripDistance)

}

async function getRoute(end) {
    //Using a fetch-request for the directions for the start and end coordinates 
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
    );

    const json = await query.json();
    const data = json.routes[0];
    //The 2 consts below are used for being able to "draw" the route on the map
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

    //Setting the duration and distanse of the trip to global variables
    tripDuration = Math.round(data.duration / 60)
    tripDistance = Number((data.distance / 1000).toFixed(1))

    //Adding the trip duration to the instructions div
    instructions.innerHTML = `<p><strong>Trip duration: ${Math.round(
        tripDuration
    )} min </strong></p>`;
}

//Code that runs when the map "loads in"
map.on('load', () => {
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
        checkboxStart.checked = true
    });

    //The searchfield result for the ending position
    geocoder2.on('result', ({ result }) => {
        endCoords = result.center
        console.log(result.center);
        checkboxEnd.checked = true
        getTrip(endCoords);
    });




});

//Large eventlistener that setup an "update" for the map with the route directions
searchbtn.addEventListener("click", function () {
    //The code only runs if the fields have been filled
    if (checkboxStart.checked && checkboxEnd.checked) {


        centerMap(startCoords[0], startCoords[1], endCoords[0], endCoords[1])

        //Animation of the map to center it in the middle of the trip
        map.flyTo({
            center: centerOfTrip,
            zoom: mapZoom,
            bearing: 0
        })

        //Setup for the "start point"
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

        //Setup for the "end point"
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
    }

});

