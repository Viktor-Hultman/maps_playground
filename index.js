mapboxgl.accessToken = 'pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmIxcnkxZm84MnVtcHNlZm5oMnJvIn0.YoorBwfMIiBKtJ7kNaXn3Q';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
});

function successLocation(position) {
    console.log(position);
    setupMap([position.coords.longitude, position.coords.latitude])
}

function errorLocation() {
    setupMap([18.060895062683944, 59.33081928392888])
}

function setupMap(center) {
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 15
    })

    //Adds the navigation controlls to the map in tje top right corner
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav);

    //Here is where the mapbox directions plugin is used to create the directions controlls
    var directions = new MapboxDirections({
        accessToken: 'pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmIxcnkxZm84MnVtcHNlZm5oMnJvIn0.YoorBwfMIiBKtJ7kNaXn3Q',
        unit: 'metric',
      });
      
      
    map.addControl(directions, 'top-left');

}

