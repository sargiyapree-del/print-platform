"use client";


import { useEffect, useState } from "react";


export default function Admin() {

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ======================
  // FETCH ORDERS
  // ======================

  const fetchOrders = async () => {
    const res = await fetch("http://localhost:5000/admin/orders");           
    const data = await res.json();
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // ======================
  // UPDATE STATUS
  // ======================

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/admin/order/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  // ======================
  // GROUP ORDERS
  // ======================

  const groupedOrders = orders.reduce((acc, order) => {
    const pendingCount = orders.filter(
  (order) => order.status === "pending"
).length;

const printingCount = orders.filter(
  (order) => order.status === "printing"
).length;

const completedCount = orders.filter(
  (order) => order.status === "completed"
).length;

const totalRevenue = orders
  .filter(
    (order) => order.status === "completed"
  )
  .reduce(
    (sum, order) =>
      sum + Number(order.price || 0),
    0
  );
    
    const groupId = order.order_group_id || "NO_GROUP";

    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(order);

    return acc;
  }, {});

  // ======================
  // SORT QUEUE
  // ======================

  const statusPriority = {
    pending: 1,
    printing: 2,
    completed: 3,
  };

 const sortedGroups = Object.entries(groupedOrders)

  .filter(([groupId]) =>
    groupId
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )

  .sort(
    (a, b) =>
      statusPriority[a[1][0].status] -
      statusPriority[b[1][0].status]
  );

  // ======================
  // FIND CURRENT PRINTING
  // ======================

  const currentlyPrinting = sortedGroups.find(
    ([_, group]) => group[0].status === "printing"
  );

  // ======================
  // UI
  // ======================

  return (

    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* HEADER */}

      <div className="bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">

          <div>

            <h1 className="text-3xl font-bold text-red-500">
              Admin Panel
            </h1>

            <p className="text-gray-500 text-sm">
              Print Queue Management
            </p>

          </div>

          <div className="bg-red-500 text-white px-5 py-3 rounded-xl">

            <p className="text-xs">Total Orders</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

  
</div>

            <p className="text-xl font-bold text-center">
              {sortedGroups.length}
            </p>

          </div>

        </div>

      </div>

     {/* MAIN */}

<div className="max-w-6xl mx-auto p-6">

  <input
    type="text"
    placeholder="🔍 Search Order ID"
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    className="w-full border border-gray-300 p-3 rounded-xl bg-white mb-6"
  />

  <div className="space-y-6">

        {sortedGroups.map(([groupId, group]) => {

          const totalPrice = group.reduce(
            (sum, item) => sum + item.total_price,
            0
          );

          const status = group[0].status;
          const pickup = group[0].pickup_time;

          return (

            <div
              key={groupId}
              className={`rounded-xl shadow-md border p-6

              ${
                status === "printing"
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white"
              }`}
            >

              {/* HEADER */}

              <div className="flex justify-between items-center mb-2">

              <div className="flex items-center gap-3">

  <h2 className="text-lg font-semibold text-blue-600">
    {groupId}
  </h2>

  <button
    onClick={() => {
      navigator.clipboard.writeText(groupId);
      alert("Copied ✅");
    }}
    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg"
  >
    📋 Copy
  </button>

</div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium

                  ${
                    status === "completed"
                      ? "bg-green-100 text-green-700"
                      : status === "printing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {status}
                </span>

              </div>

              {/* PRINTING LABEL */}

              {status === "printing" && (
                <p className="text-xs text-blue-600 font-semibold mb-2">
                  Currently Printing 🖨️
                </p>
              )}

              {/* FILES */}

              <div className="divide-y">

                {group.map((item) => (

                  <div key={item.id} className="py-3">

                    <p className="font-medium text-gray-800">
                      {item.file_name}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Copies: {item.copies} • Pages: {item.page_count}
                    </p>

                    <p className="text-green-600 font-semibold mt-1">
                      ₹{item.total_price}
                    </p>

                    {/* VIEW PRINT */}

                    {item.file_url ? (

                      <a
                        href={`http://localhost:5000/${item.file_url}`}
                        target="_blank"
                        className="text-blue-600 text-sm underline mt-1 inline-block"
                      >
                        View / Print
                      </a>

                    ) : (

                      <p className="text-red-400 text-sm">
                        File not available
                      </p>

                    )}

                  </div>

                ))}

              </div>

              {/* FOOTER */}

              <div className="mt-5 flex justify-between items-center">

                <div>

                  <p className="text-sm text-gray-500">
                    Pickup
                  </p>

                  <p className="text-sm font-medium">
                    {pickup
                      ? new Date(pickup).toLocaleString()
                      : "Not Set"}
                  </p>

                </div>

                <p className="text-lg font-bold text-green-700">
                  ₹{totalPrice}
                </p>

              </div>

              {/* ACTION BUTTONS */}

              <div className="mt-5 flex gap-3">

                {status === "pending" && (

                  <button
                    disabled={currentlyPrinting}
                    onClick={() =>
                      group.forEach(item =>
                        updateStatus(item.id, "printing")
                      )
                    }
                    className={`flex-1 py-2 rounded-lg font-semibold text-white

                    ${
                      currentlyPrinting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {currentlyPrinting
                      ? "Another Order Printing"
                      : "Start Printing"}
                  </button>

                )}

                {status === "printing" && (

                  <button
                    onClick={() =>
                      group.forEach(item =>
                        updateStatus(item.id, "completed")
                      )
                    }
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
                  >
                    Mark Completed
                  </button>

                )}

              </div>

            </div>

          );

        })}

         </div>

    </div>

  </div>

  );
}