import React, { useEffect, useState } from "react";
import { Bar, Line, Scatter, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController,
  ArcElement,
} from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "chartjs-adapter-moment";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController,
  ArcElement
);

const EmploymentVisualization = () => {
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [genderPieChartData, setGenderPieChartData] = useState({ labels: [], datasets: [] });
  const [scatterPlotData, setScatterPlotData] = useState({ datasets: [] });
  const [personsOverTimeData, setPersonsOverTimeData] = useState({ labels: [], datasets: [] });
  const [activeChart, setActiveChart] = useState("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employmentCollection = collection(db, "employmentData");
        const employmentSnapshot = await getDocs(employmentCollection);
        const dataList = employmentSnapshot.docs.map((doc) => doc.data()) || [];

        if (dataList.length === 0) {
          console.warn("No data available.");
          return;
        }

        // Prepare data for Bar Chart (Employment Persons by Geolocation)
        const geolocations = [...new Set(dataList.map((data) => data.geolocation))];
        const employmentByGeolocation = geolocations.map((geolocation) => {
          return dataList
            .filter((data) => data.geolocation === geolocation)
            .reduce((total, data) => total + (data.employmentPersons || 0), 0);
        });

        setBarChartData({
          labels: geolocations,
          datasets: [
            {
              label: "Total Employment Persons by Geolocation",
              data: employmentByGeolocation,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 1,
            },
          ],
        });

        // Prepare data for Gender Pie Chart (Employment by Gender)
        const genders = ["Male", "Female"];
        const employmentByGender = genders.map((gender) => {
          return dataList
            .filter((data) => data.sex === gender)
            .reduce((total, data) => total + (data.employmentPersons || 0), 0);
        });

        setGenderPieChartData({
          labels: genders,
          datasets: [
            {
              label: "Employment Persons by Gender",
              data: employmentByGender,
              backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
              borderColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
              borderWidth: 1,
            },
          ],
        });

        // Prepare data for Line Chart (Employment Persons Over Time)
        const periods = [...new Set(dataList.map((data) => data.period))].sort();
        const employmentByPeriod = periods.map((period) => {
          return dataList
            .filter((data) => data.period === period)
            .reduce((total, data) => total + (data.employmentPersons || 0), 0);
        });

        setLineChartData({
          labels: periods,
          datasets: [
            {
              label: "Employment Persons Over Time",
              data: employmentByPeriod,
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        });

        // Prepare data for Scatter Plot (Employment Persons vs Major Occupation)
        const scatterData = dataList.map((data) => ({
          x: data.majorOccupation.length, // Use length as a proxy for occupation variety
          y: data.employmentPersons,
        }));

        setScatterPlotData({
          datasets: [
            {
              label: "Employment Persons vs Major Occupation",
              data: scatterData,
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 1,
              pointRadius: 5,
            },
          ],
        });

        // Prepare data for Line Chart (Employment Persons Over Time, by Geolocation)
        const personsByPeriod = periods.map((period) => {
          return dataList
            .filter((data) => data.period === period)
            .reduce((total, data) => total + (data.employmentPersons || 0), 0);
        });

        setPersonsOverTimeData({
          labels: periods,
          datasets: [
            {
              label: "Employment Persons by Period",
              data: personsByPeriod,
              fill: false,
              borderColor: "rgb(255, 99, 132)",
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Employment Data Visualization</h2>

      <div className="mb-4">
        <button
          onClick={() => setActiveChart("bar")}
          className={`py-2 px-4 mr-2 rounded ${activeChart === "bar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setActiveChart("genderPie")}
          className={`py-2 px-4 mr-2 rounded ${activeChart === "genderPie" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Gender Pie Chart
        </button>
        <button
          onClick={() => setActiveChart("line")}
          className={`py-2 px-4 mr-2 rounded ${activeChart === "line" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Line Chart
        </button>
        <button
          onClick={() => setActiveChart("scatter")}
          className={`py-2 px-4 mr-2 rounded ${activeChart === "scatter" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Scatter Plot
        </button>
        <button
          onClick={() => setActiveChart("personsOverTime")}
          className={`py-2 px-4 rounded ${activeChart === "personsOverTime" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Persons Over Time
        </button>
      </div>

      {activeChart === "bar" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Persons by Geolocation</h3>
          <div style={{ height: "500px", width: "500px" }}>
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {activeChart === "genderPie" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Persons by Gender</h3>
          <div style={{ height: "500px", width: "500px" }}>
            <Pie data={genderPieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {activeChart === "line" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Persons Over Time</h3>
          <div style={{ height: "500px", width: "500px" }}>
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {activeChart === "scatter" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Persons vs Major Occupation</h3>
          <div style={{ height: "500px", width: "500px" }}>
            <Scatter data={scatterPlotData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {activeChart === "personsOverTime" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Persons by Period</h3>
          <div style={{ height: "500px", width: "500px" }}>
            <Line data={personsOverTimeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentVisualization;