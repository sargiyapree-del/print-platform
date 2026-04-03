"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [orders, setOrders] = useState([]);

  const pricePerCopy = 5;
  const totalPrice = copies * pricePerCopy;

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/orders/${user.id}`);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.log("FETCH ORDERS ERROR:", err);
    }
  };

  // ✅ Protect route
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
    } else {
      fetchOrders();
    }
  }, []);

  // ✅ Upload Function
  const handleUpload = async () => {
    if (!file) {
      alert("Select file first ❌");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Upload failed ❌");
        return;
      }

      setUploadedFile(data.file);
      alert("File uploaded successfully ✅");

    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      alert("Something went wrong ❌");
    }
  };

  // ✅ Order Function
  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!uploadedFile) {
      alert("Upload file first ❌");
      return;
    }

    if (!user) {
      alert("User not logged in ❌");
      return;
    }

    const payload = {
      fileName: uploadedFile?.originalname,
      copies: Number(copies),
      totalPrice: Number(totalPrice),
      user_id: Number(user.id)
    };

    console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://localhost:5000/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Order failed ❌");
        return;
      }

      alert("Order placed successfully ✅");
      fetchOrders();

    } catch (err) {
      console.log("ORDER ERROR:", err);
      alert("Something went wrong ❌");
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="p-6">

      {/* Navbar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Upload Section */}
      <div className="mt-4">
        <p className="font-semibold">Select File:</p>

        <input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
            }
          }}
          className="border p-2 mt-2"
        />

        {file && (
          <p className="mt-2 text-green-600">
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={handleUpload}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload File
        </button>
      </div>

      {/* Uploaded File */}
      {uploadedFile && (
        <div className="mt-3">
          <p>Uploaded: {uploadedFile.originalname}</p>
        </div>
      )}

      {/* Copies */}
      <input
        type="number"
        min="1"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
        className="mt-4 border p-2"
      />

      {/* Price */}
      <p className="mt-2">Total Price: ₹{totalPrice}</p>

      {/* Order Button */}
      <button
        onClick={handleOrder}
        className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
      >
        Place Order
      </button>

      {/* Orders */}
      <h2 className="mt-6 font-bold text-lg">My Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-2 text-gray-500">No orders yet</p>
      ) : (
       orders.map((order) => (
  <div key={`${order.id}-${order.created_at}`} className="border p-2 mt-2 rounded">
            <p><strong>{order.file_name}</strong></p>
            <p>Copies: {order.copies}</p>
            <p>Price: ₹{order.total_price}</p>
            <p>Status: {order.status}</p>
          </div>
        ))
      )}

    </div>
  );
}