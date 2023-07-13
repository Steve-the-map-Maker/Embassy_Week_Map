console.log("coming from filter.js file");

let map;

function initializeFilter(mapInstance) {
  map = mapInstance;

  const filterButton = document.getElementById("filter-button");
  if (filterButton) {
    filterButton.addEventListener("click", toggleFilter);
  }
}

let isEmbassyWeekFilterActive = false;

function toggleFilter() {
  if (isEmbassyWeekFilterActive) {
    map.setFilter("park-volcanoes", ["==", ["get", "E_WEEK"], true]);
  } else {
    map.setFilter("park-volcanoes", ["==", "$type", "Point"]);
  }
  // Update the filter state
  isEmbassyWeekFilterActive = !isEmbassyWeekFilterActive;
}
