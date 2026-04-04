"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // 🔥 Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/orders");
      const data = await res.json();
      console.log("ALL ORDERS:", data); // ✅ debug
      setOrders(data || []);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 Update status
  const updateStatus = async (id, status) => {
    if (!id) {
      alert("Order ID missing ❌");
      return;
    }

    console.log("UPDATING ID:", id); // ✅ debug

    try {
      const res = await fetch(`http://localhost:5000/admin/order/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      console.log("UPDATE RESPONSE:", data);

      fetchOrders();
    } catch (err) {
      console.log("UPDATE ERROR:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {orders.length === 0 ? (
        <p className="mt-4 text-gray-500">No orders found</p>
      ) : (
        orders.map((order) => {
          console.log("ORDER:", order); // ✅ DEBUG HERE

          return (
            <div
              key={`${order.id}-${order.created_at}`}
              className="border p-3 mt-3 rounded"
            >
              <p><strong>{order.file_name}</strong></p>
              <p>Copies: {order.copies}</p>
              <p>Price: ₹{order.total_price}</p>
              <p>Status: {order.status}</p>

              <p>
                Pickup:{" "}
                {order.pickup_time
                  ? new Date(order.pickup_time).toLocaleString()
                  : "Not set"}
              </p>

              <button
                onClick={() => updateStatus(order.id, "completed")}
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
              >
                Mark Completed
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}