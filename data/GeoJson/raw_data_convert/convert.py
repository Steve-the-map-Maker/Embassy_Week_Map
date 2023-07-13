import csv
import json

# Define the input files
counties_file = "data\GeoJson\E_week.csv"
geojson_file = "data\GeoJson\Embassies.geojson"
output_file = "output.geojson"

# Load the county names from the CSV file
county_names = []
with open(counties_file, "r") as f:
    reader = csv.reader(f)
    for row in reader:
        county_names.append(row[0])

# Load the geo-json data
with open(geojson_file, "r") as f:
    data = json.load(f)

# Loop through each feature and update the "E_WEEK" property
for feature in data["features"]:
    if feature["properties"]["COUNTRY"] in county_names:
        feature["properties"]["E_WEEK"] = True
    else:
        feature["properties"]["E_WEEK"] = False

# Write the updated geo-json to a new file
with open(output_file, "w") as f:
    json.dump(data, f)
