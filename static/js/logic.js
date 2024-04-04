//  Get geoJSON Data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Sets colors for circles and legend.
const colorScale = {
    depthScale: [10, 30, 50, 70, 90, 10000],
    color: ["#F0FFF0", "#CCFFCC", "#99FF99", "#66FF66", "#33FF33","#00FF00"]
};

// Gets earthquake data
d3.json(url).then( earthquakes => {  
    CreateFeatures(earthquakes, colorScale);
});


// Create Features for Map
function CreateFeatures(earthquakes, colorScale) {

    var earthquakeMarkers = earthquakes.features.map(feature => {
        return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            radius: feature.properties.mag * 5,
            fillColor: markerColor(feature.geometry.coordinates[2], colorScale),
            color: "#000",
            weight: 0.5,
            opacity: .5,
            fillOpacity: .5
        }).bindPopup(`<div class="popupCard"> 
        <h2>${feature.properties.place}</h2>
        <p class="popupDate">${Date(feature.properties.time)}</p>
        <hr />
            <ul>                        
                <li><b>Magnitude:</b> ${feature.properties.mag}</li>
                <li><b>Depth:</b>  ${feature.geometry.coordinates[2]} km</li>
                <li><b>Longitude:</b>  ${feature.geometry.coordinates[0]}&deg</li>
                <li><b>Latitude:</b>  ${feature.geometry.coordinates[1]}&deg</li>                
            </ul>
        <p><center><a href = ${feature.properties.url} target= _blank>More Information</a></center></p>
        </div>`
                    );
    });

    var earthquakesLayer = L.layerGroup(earthquakeMarkers);

    createMap(earthquakesLayer, colorScale);
};


//  Sets circle colors
function markerColor(depth, colorScale) {
    for (let i = 0; i < colorScale.depthScale.length; i++) {
        
        if (depth < colorScale.depthScale[i]) {
            return colorScale.color[i];
            break;
        };
    };
};


//  Create Map Layers
function createMap(earthquakes, colorScale) {
    let standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
    
    let satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
        });

    let baseMaps = {Street: standard, Satellite:  satellite, Topographic:  topo, };    
    let overlayMaps = {Earthquakes: earthquakes, };

    let myMap = L.map(map, {
        center: [37.8283, -98.5795],
        zoom: 4.5,
        layers: [standard, earthquakes] 
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
        }).addTo(myMap);



    // Create legend 
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h3>Depth (km)</h3>";
        div.innerHTML += "<ul>";

        for (let i = 0; i < colorScale.depthScale.length; i++) { 
            if (i == 0) { 
                    div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>< ${colorScale.depthScale[i]} </li>`}
                else if (i == colorScale.depthScale.length-1) {
                    div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>${colorScale.depthScale[i-1]} +</li>`}
                else {div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>${colorScale.depthScale[i-1]} - ${colorScale.depthScale[i]}</li>`}

       };
       div.innerHTML += "</ul>";

           return div;
   };

   legend.addTo(myMap);
};




   





