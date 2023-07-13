console.log("coming from map.js file!!!!");

// Import necessary libraries for calculating distance
import { toRadians, haversineDistance } from "./distanceUtils.js";

fetch("output.geojson")
  .then((response) => response.json())
  .then((json) => {
    var geojson = json; // Store the GeoJSON data in a variable
    initializeMap(geojson, initializeFilter);
  });

function initializeMap(geojson) {
  const style = {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap Contributors",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm", // This must match the source key above
      },
    ],
  };

  // Initialise the map
  const map = new maplibregl.Map({
    container: "map",
    style: style,
    center: [-77.05244977933675, 38.902060328344106],
    zoom: 14,
  });

  map.on("load", function () {
    // Add a source for the GeoJSON data
    map.addSource("fromJson", {
      type: "geojson",
      data: geojson,
    });

    // Add a layer for the GeoJSON data
    map.addLayer({
      id: "park-volcanoes",
      type: "circle",
      source: "fromJson",
      paint: {
        "circle-radius": 5,
        "circle-color": "#00ff00",
        "circle-stroke-color": "#000000", // Add a black outline
        "circle-stroke-width": 1, // Set the width of the outline to 1 pixel
      },
      filter: ["==", "$type", "Point"],
    });
  });
  // Define the clickPopup variable
  const clickPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    offset: [0, -15],
  });

  // Create an array to store the clicked points
  const clickedPoints = [];
  let measureMode = false;

  // Update the click event listener inside the `initializeMap` function
  map.on("click", (e) => {
    if (!measureMode) return;
    // Add the clicked point to the array
    clickedPoints.push(e.lngLat);

    // If there are two points in the array, calculate the distance between them and display it in the popup
    if (clickedPoints.length === 2) {
      const point1 = clickedPoints[0];
      const point2 = clickedPoints[1];

      // Calculate the distance between the points using the Haversine formula
      const distance = haversineDistance(point1, point2);

      // Display the distance in the popup
      clickPopup
        .setLngLat(point2)
        .setHTML(`<p>Distance: ${distance.toFixed(2)} feet</p>`)
        .addTo(map);

      // Clear the array after displaying the distance
      clickedPoints.length = 0;
    }
  });
  // Add an event listener for the "Measure Distance" button
  document.getElementById("measure-button").addEventListener("click", () => {
    // Toggle the measure mode status
    measureMode = !measureMode;

    // Update the button text based on the measure mode status
    const buttonText = measureMode ? "Stop Measuring" : "Measure Distance";
    document.getElementById("measure-button").textContent = buttonText;

    // Clear the array and remove the line and popup from the map when measure mode is turned off
    if (!measureMode) {
      clickedPoints.length = 0;

      if (map.getLayer("measure-line")) {
        map
          .getSource("measure-line")
          .setData({ type: "FeatureCollection", features: [] });
      }

      if (clickPopup.isOpen()) {
        clickPopup.remove();
      }
    }
  });
}
