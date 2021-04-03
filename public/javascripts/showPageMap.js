
mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 9 // starting zoom
});

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 15})
    .setHTML(
        `<h3>${campground.title}</h3><p>${campground.description}</p>`
    )
)
.addTo(map);