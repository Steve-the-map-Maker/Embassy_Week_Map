console.log("coming from map.js file!!!!");

fetch("output.geojson")
  .then((response) => response.json())
  .then((json) => {
    var geojson = json; // Store the GeoJSON data in a variable
    initializeMap(geojson, initializeFilter);
  });

function initializeMap(geojson, filterCallback) {
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

  const scale = new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: "imperial", // change to 'metric' for metric units
  });
  map.addControl(scale);

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
  const clickPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    offset: [0, -15],
  });

  //////////////////////////////////////////////////////////////////////////////

  map.on("click", "park-volcanoes", function (e) {
    var embassyName = e.features[0].properties.COUNTRY;
    var embassyLocation = e.features[0].geometry.coordinates;
    var embassyValue = e.features[0].properties.E_WEEK;
    var webURL = e.features[0].properties.WEBURL;
    var address = e.features[0].properties.ADDRESS;
    var phone = e.features[0].properties.TELEPHONE;

    var popupContent =
      '<div class="map-popup">' +
      "<h4>" +
      embassyName +
      "</h4>" +
      '<p><strong>Web:</strong> <a href="' +
      webURL +
      '">' +
      webURL +
      "</a></p>" +
      "<p><strong>Address:</strong> " +
      address +
      "</p>" +
      "<p><strong>Phone:</strong> " +
      phone +
      "</p>" +
      "<p><strong>Embassy Week 2023?:</strong> " +
      embassyValue +
      "</p>" +
      "</div>";

    // Update the content and location of the clickPopup
    clickPopup.setLngLat(embassyLocation).setHTML(popupContent).addTo(map);

    // Add CSS styles to the popup
    clickPopup._container.classList.add("custom-popup");
  });
  // Create a popup for hover effect
  const hoverPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // Create a div element to hold the content of the hoverPopup
  const hoverPopupContent = document.createElement("div");
  hoverPopupContent.classList.add("hover-popup-content");

  // Show the name of the point when the mouse hovers over it
  map.on("mousemove", "park-volcanoes", function (e) {
    // Change the cursor style as a UI indicator
    map.getCanvas().style.cursor = "pointer";

    // Get the name of the point
    const embassyName = e.features[0].properties.COUNTRY;
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Set the content and location of the hoverPopup
    hoverPopupContent.innerHTML = "<strong>" + embassyName + "</strong>";
    hoverPopup
      .setLngLat(coordinates)
      .setDOMContent(hoverPopupContent)
      .addTo(map);
  });

  // Hide the hoverPopup when the mouse leaves the point
  map.on("mouseleave", "park-volcanoes", function () {
    map.getCanvas().style.cursor = "";
    hoverPopup.remove();
  });

  // Modify the showUserLocation function
  function showUserLocation() {
    // Check if the browser supports Geolocation API
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      return;
    }

    // Success callback function for getCurrentPosition
    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Create a marker for the user's current location
      const userLocationMarker = new maplibregl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map);

      // Center the map on the user's current location
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14,
      });
    }

    // Error callback function for getCurrentPosition
    function error() {
      console.log("Unable to retrieve your location");
    }

    // Get the user's current position
    navigator.geolocation.getCurrentPosition(success, error);

    populateEmbassyList(map, geojson);
  }

  // Add a click event listener to the button
  document
    .getElementById("user-location-button")
    .addEventListener("click", showUserLocation);

  function searchEmbassy(map, searchTerm) {
    // Find the first feature with a matching country name
    const matchingFeature = geojson.features.find(
      (feature) =>
        feature.properties.COUNTRY.toLowerCase() === searchTerm.toLowerCase()
    );

    if (matchingFeature) {
      // Get the coordinates of the matching feature
      const coordinates = matchingFeature.geometry.coordinates;

      // Fly to the matching feature
      map.flyTo({
        center: coordinates,
        zoom: 19,
      });

      // Open the popup after flying to the location
      const embassyName = matchingFeature.properties.COUNTRY;
      const webURL = matchingFeature.properties.WEBURL;
      const address = matchingFeature.properties.ADDRESS;
      const phone = matchingFeature.properties.TELEPHONE;
      const embassyValue = matchingFeature.properties.E_WEEK;

      const popupContent =
        '<div class="map-popup">' +
        "<h4>" +
        embassyName +
        "</h4>" +
        '<p><strong>Web:</strong> <a href="' +
        webURL +
        '">' +
        webURL +
        "</a></p>" +
        "<p><strong>Address:</strong> " +
        address +
        "</p>" +
        "<p><strong>Phone:</strong> " +
        phone +
        "</p>" +
        "<p><strong>Embassy Week 2023?:</strong> " +
        embassyValue +
        "</p>" +
        "</div>";

      // Update the content and location of the clickPopup
      clickPopup.setLngLat(coordinates).setHTML(popupContent).addTo(map);

      // Add CSS styles to the popup
      clickPopup._container.classList.add("custom-popup");
    } else {
      console.log("No matching embassy found.");
    }
  }

  // Add an event listener for the search button
  document.getElementById("search-button").addEventListener("click", () => {
    const searchTerm = document.getElementById("search-input").value;
    searchEmbassy(map, searchTerm);
  });

  // Add an event listener for the 'Enter' key on the search input
  document
    .getElementById("search-input")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const searchTerm = document.getElementById("search-input").value;
        searchEmbassy(map, searchTerm);
      }
    });

  filterCallback(map);
}
