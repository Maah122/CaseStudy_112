
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EmploymentData = () => {
  const [employmentData, setEmploymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    geolocation: "",
    majorOccupation: "",
    period: "",
    sex: "",
    employmentPersons: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeolocation, setSelectedGeolocation] = useState("");
  const [sortBy, setSortBy] = useState("geolocation"); // Sorting criteria
  const [sortOrder, setSortOrder] = useState("asc"); // Sorting order

  useEffect(() => {
    const fetchData = async () => {
      const employmentCollection = collection(db, "employmentData");
      const employmentSnapshot = await getDocs(employmentCollection);
      const dataList = employmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched Employment Data:", dataList); // Debug log
      setEmploymentData(dataList);
      setFilteredData(dataList); // Initialize filteredData with fetched data
    };

    fetchData();
  }, []);

  useEffect(() => {
    let updatedData = employmentData;

    // Search functionality
    if (searchTerm) {
      updatedData = updatedData.filter(data =>
        data.geolocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by geolocation
    if (selectedGeolocation) {
      updatedData = updatedData.filter(data =>
        data.geolocation.toLowerCase() === selectedGeolocation.toLowerCase()
      );
    }

    // Sort data
    updatedData = updatedData.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(updatedData);
  }, [searchTerm, selectedGeolocation, employmentData, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    const employmentDocRef = doc(db, "employmentData", id);
    try {
      await deleteDoc(employmentDocRef);
      setEmploymentData(employmentData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      geolocation: data.geolocation,
      majorOccupation: data.majorOccupation,
      period: data.period,
      sex: data.sex,
      employmentPersons: data.employmentPersons,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const employmentDocRef = doc(db, "employmentData", editingId);
    try {
      await updateDoc(employmentDocRef, {
        geolocation: editForm.geolocation,
        majorOccupation: editForm.majorOccupation,
        period: editForm.period,
        sex: editForm.sex,
        employmentPersons: Number(editForm.employmentPersons),
      });
      setEmploymentData(employmentData.map((data) =>
        data.id === editingId ? { id: editingId, ...editForm } : data
      ));
      setEditingId(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Get sorted geolocations
  const sortedGeolocations = [...new Set(employmentData.map(data => data.geolocation))].sort();

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Employment Data List</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Geolocation"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={selectedGeolocation}
          onChange={(e) => setSelectedGeolocation(e.target.value)}
          className="ml-2 p-2 border border-gray-300 rounded"
        >
          <option value="">Select Geolocation</option>
          {sortedGeolocations.map(geolocation => (
            <option key={geolocation} value={geolocation}>{geolocation}</option>
          ))}
        </select>
      </div>

      {editingId ? (
        <form onSubmit={handleUpdate} className="mb-4">
          <input
            type="text"
            placeholder="Geolocation"
            value={editForm.geolocation}
            onChange={(e) => setEditForm({ ...editForm, geolocation: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Major Occupation"
            value={editForm.majorOccupation}
            onChange={(e) => setEditForm({ ...editForm, majorOccupation: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Period"
            value={editForm.period}
            onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Sex"
            value={editForm.sex}
            onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Employment Persons"
            value={editForm.employmentPersons}
            onChange={(e) => setEditForm({ ...editForm, employmentPersons: e.target.value })}
            required
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Data</button>
          <button onClick={() => setEditingId(null)} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
        </form>
      ) : (
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("geolocation")} className="flex items-center">
                    Geolocation
                    {sortBy === "geolocation" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("majorOccupation")} className="flex items-center">
                    Major Occupation
                    {sortBy === "majorOccupation" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("period")} className="flex items-center">
                    Period
                    {sortBy === "period" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("sex")} className="flex items-center">
                    Sex
                    {sortBy === "sex" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">
                  <button onClick={() => handleSort("employmentPersons")} className="flex items-center">
                    Employment Persons
                    {sortBy === "employmentPersons" && (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                </th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data) => (
                <tr key={data.id}>
                  <td className="p-2 border-b">{data.geolocation}</td>
                  <td className="p-2 border-b">{data.majorOccupation}</td>
                  <td className="p-2 border-b">{data.period}</td>
                  <td className="p-2 border-b">{data.sex}</td>
                  <td className="p-2 border-b">{data.employmentPersons}</td>
                  <td className="p-2 border-b">
                    <button
                      onClick={() => handleEdit(data)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmploymentData;