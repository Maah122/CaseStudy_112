
import React, { useState } from "react";
import AddEmploymentData from "./components/AddEmploymentData";
import EmploymentDataList from "./components/EmploymentDataList";
import DengueVisualization from "./components/EmploymentVisualization";
import UploadCSV from "./components/UploadCSV";
import MapData from "./components/MapData";

function App() {
  const [view, setView] = useState("overview");

  const handleViewChange = (newView) => {
    console.log("Changing view to:", newView);
    setView(newView);
  };

  const renderContent = () => {
    switch (view) {
      case "overview":
        return (
          <div className="flex space-x-8" style={{justifyContent: 'center'}}>
        
            <div className="w-2/3">
              <EmploymentDataList />
            </div>
          </div>
        );
      case "visualization":
        return <DengueVisualization />;
      case "upload":
        return <UploadCSV />;
      case "mapdata":
        return <MapData />;
      default:
        return <EmploymentDataList />;

    }
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mindanao Employment Data APP</h1>
        <div className="space-x-4">
          <button
            onClick={() => handleViewChange("overview")}
            className={`p-2 rounded ${view === "overview" ? "bg-blue-700" : "bg-blue-500"}`}
          >
            Overview
          </button>
          <button
            onClick={() => handleViewChange("upload")}
            className={`p-2 rounded ${view === "upload" ? "bg-green-700" : "bg-green-500"}`}
          >
            Upload CSV
          </button>
          <button
            onClick={() => handleViewChange("visualization")}
            className={`p-2 rounded ${view === "visualization" ? "bg-purple-700" : "bg-purple-500"}`}
          >
            Visualization
          </button>

          <button
            onClick={() => handleViewChange("mapdata")}
            className={`p-2 rounded ${view === "upload" ? "bg-green-700" : "bg-green-500"}`}
          >
            Geolocation
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-content flex-1 p-4">
        {/* Render Content Based on View State */}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;