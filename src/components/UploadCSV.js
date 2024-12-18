import React, { useState } from "react";
import Papa from "papaparse";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust this path if needed

const UploadCSV = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setError("");
  };

  const handleFileSubmit = () => {
    if (csvFile) {
      Papa.parse(csvFile, {
        header: true, // Ensures the first row is treated as headers
        skipEmptyLines: true, // Ignores empty rows
        complete: async (result) => {
          const parsedData = result.data; // Array of objects representing rows

          try {
            const employmentCollection = collection(db, "employmentData");

            // Iterate over rows and validate data
            await Promise.all(
              parsedData.map(async (row, index) => {
                // Validate required fields
                const isValidRow =
                  row.Geolocation &&
                  row["Major Occupation"] &&
                  row.Period &&
                  row.Sex &&
                  row["Employed Persons by Major Occupation"];

                if (!isValidRow) {
                  console.warn(`Skipping invalid row ${index + 1}:`, row); // Corrected line
                  return; // Skip invalid rows
                }

                // Add data to Firebase
                await addDoc(employmentCollection, {
                  geolocation: row.Geolocation.trim(),
                  majorOccupation: row["Major Occupation"].trim(),
                  period: row.Period.trim(),
                  sex: row.Sex.trim(),
                  employmentPersons: parseInt(row["Employed Persons by Major Occupation"], 10),
                });
              })
            );

            alert("CSV data uploaded successfully.");
          } catch (error) {
            console.error("Error uploading data: ", error);
            setError("Error uploading CSV data. Please check the console for details.");
          }
        },
        error: (err) => {
          console.error("Error parsing CSV file:", err);
          setError("Error parsing CSV file: " + err.message);
        },
      });
    } else {
      setError("Please upload a CSV file.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upload Employment Data CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleFileSubmit}
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Upload CSV
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default UploadCSV;
