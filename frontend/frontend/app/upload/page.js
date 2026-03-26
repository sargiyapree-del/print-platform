"use client";
import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [copies, setCopies] = useState(1);

  const handleUpload = () => {
    console.log("Selected File:", file?.name);
    console.log("Copies:", copies);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Document</h1>

      <input
        type="file"
        className="mb-4"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="mb-2">
        <label>Copies:</label>
        <input
          type="number"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          className="ml-2 border p-1 w-20"
        />
      </div>

      <button
        onClick={handleUpload}
        className="bg-green-500 text-white px-4 py-2 mt-3 rounded"
      >
        Upload & Order
      </button>
    </div>
  );
}