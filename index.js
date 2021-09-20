let mymap = L.map('mapid').setView([51.505, -0.09], 13);

let pin1 = L.marker();
let pin2 = L.marker();

// var marker = L.marker([51.5, -0.09]).addTo(mymap);

// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

let firstMarker = L.marker();

var popup = L.popup();



function onMapClick(e) {
    if(pin1._latlng == undefined){
        pin1 
        .setLatLng(e.latlng)
        .addTo(mymap)
        .bindPopup("<b>From:</b><br>" + e.latlng.toString())
        .openPopup();
    } else {
        pin2
        .setLatLng(e.latlng)
        .addTo(mymap)
        .bindPopup("<b>To:</b><br>" + e.latlng.toString())
        .openPopup(); 
    }
        

}

mymap.on('click', onMapClick);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoidmlrdG9yaHVsdG1hbiIsImEiOiJja3RzZmRscnYwcHdhMm9xZXk2c2JvOWxzIn0.sqReeYPmh7Bws47tZ9YNXA'
}).addTo(mymap);
