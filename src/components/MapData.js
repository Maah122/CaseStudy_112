import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path as needed
import philippineData from "./ph.json"; // GeoJSON data for the Philippines
import "leaflet/dist/leaflet.css";
import "./MapData.css";

const MapData = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    // Function to normalize strings for comparison
    const normalizeString = (str) => str.toUpperCase().trim();

    // Fetch and process data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data from Firestore
                const employmentCollection = collection(db, "employmentData");
                const employmentSnapshot = await getDocs(employmentCollection);
                const employmentData = employmentSnapshot.docs.map((doc) => ({
                    region: normalizeString(doc.data().geolocation || ""),
                    employmentPersons: Number(doc.data().employmentPersons || 0),
                }));

                // Aggregate employment persons by region
                const aggregatedData = employmentData.reduce(
                    (acc, { region, employmentPersons }) => {
                        acc[region] = (acc[region] || 0) + employmentPersons;
                        return acc;
                    },
                    {}
                );

                // Update GeoJSON with aggregated employment data
                const updatedGeoJson = {
                    ...philippineData,
                    features: philippineData.features.map((feature) => {
                        const regionName = normalizeString(feature.properties.name);
                        const employmentPersons = aggregatedData[regionName] || 0;
                        return {
                            ...feature,
                            properties: {
                                ...feature.properties,
                                employmentPersons, // Add employmentPersons to GeoJSON properties
                            },
                        };
                    }),
                };

                setGeoJsonData(updatedGeoJson);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // Function to determine color based on employmentPersons
    const getColor = (employmentPersons) => {
        return employmentPersons > 1000000 ? "#800026" :
               employmentPersons > 750000 ? "#BD0026" :
               employmentPersons > 500000 ? "#E31A1C" :
               employmentPersons > 250000 ? "#FF4D1A" :
               employmentPersons > 100000 ? "#FF6F3C" :
               employmentPersons > 50000  ? "#FF924A" :
               employmentPersons > 25000  ? "#FFB566" :
               employmentPersons > 10000  ? "#FFDA80" :
               employmentPersons > 5000   ? "#FFF200" :
                                            "#FFE500";
    };

    // Style function for GeoJSON features
    const styleFeature = (feature) => {
        const employmentPersons = feature.properties.employmentPersons || 0;
        return {
            fillColor: getColor(employmentPersons),
            weight: 1,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
        };
    };

    // Tooltip binding for each region
    const onEachFeature = (feature, layer) => {
        const employmentPersons = feature.properties.employmentPersons || 0;
        layer.bindTooltip(
            `<strong>${feature.properties.name}</strong><br>Employment Persons: ${employmentPersons.toLocaleString()}`, // Correct use of backticks
            { direction: "top", className: "custom-tooltip", permanent: false }
        );
    };

    return (
        <div className="map-container">
            <h1>Philippines Employment Data Choropleth Map</h1>
            <MapContainer
                center={[12.8797, 121.7740]} // Coordinates for the Philippines
                zoom={6} // Initial zoom level
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                />
                {geoJsonData && (
                    <GeoJSON
                        data={geoJsonData} // Pass updated GeoJSON data
                        style={styleFeature} // Style regions based on employmentPersons
                        onEachFeature={onEachFeature} // Add tooltips
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapData;
