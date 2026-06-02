"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {

  const router = useRouter();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  // ======================
  // FETCH ORDERS
  // ======================

  const fetchOrders = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      const res = await fetch(
        "http://localhost:5000/admin/orders"
      );

      const data = await res.json();

      // FILTER USER

      const userOrders = data.filter(
        (order) =>
          String(order.user_id) === String(user.id)
      );

      setOrders(userOrders);

      setLoading(false);

    } catch (err) {

      console.log(err);
      setLoading(false);

    }

  };

  useEffect(() => {

    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
      return;
    }

    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);

    return () => clearInterval(interval);

  }, []);

  // ======================
  // GROUP ORDERS
  // ======================

  const groupedOrders = orders.reduce((acc, order) => {

    const groupId = order.order_group_id || "NO_GROUP";

    if (!acc[groupId]) acc[groupId] = [];

    acc[groupId].push(order);

    return acc;

  }, {});

  // ======================
  // TOTAL SPENT
  // ======================

  const totalSpent = orders.reduce(
    (sum, item) => sum + item.total_price,
    0
  );

  // ======================
  // LOGOUT
  // ======================

  const handleLogout = () => {

    localStorage.removeItem("user");

    router.push("/login");

  };

  // ======================
  // UI
  // ======================

  return (

    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* HEADER */}

      <div className="bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">

          <h1 className="text-3xl font-bold text-blue-600">
            My Orders
          </h1>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* MAIN */}

      <div className="max-w-6xl mx-auto p-6">

        {/* SUMMARY */}

        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-2xl font-bold">
              {Object.keys(groupedOrders).length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{totalSpent}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">
              {
                orders.filter(o => o.status !== "completed").length
              }
            </p>
          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <p className="text-center text-gray-500">
            Loading...
          </p>

        ) : Object.keys(groupedOrders).length === 0 ? (

          <div className="bg-white p-10 rounded-xl shadow text-center">

            <p className="text-5xl mb-3">📄</p>

            <p className="text-xl font-semibold">
              No Orders Yet
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {Object.entries(groupedOrders).map(([groupId, group]) => {

              const total = group.reduce(
                (sum, item) => sum + item.total_price,
                0
              );

              const status = group[0].status;

              const pickup = group[0].pickup_time;

              return (

                <div
                  key={groupId}
                  className="bg-white rounded-xl shadow p-5"
                >

                  {/* HEADER */}

                  <div className="flex justify-between items-center mb-3">

                    <h2 className="text-lg font-semibold text-blue-600">
                      {groupId}
                    </h2>

                    <span
                      className={`px-3 py-1 text-xs rounded-full

                      ${status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {status}
                    </span>

                  </div>

                  {/* FILES */}

                  <div className="divide-y">

                    {group.map(item => (

                      <div key={item.id} className="py-2">

                        <p className="font-medium">
                          {item.file_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Copies: {item.copies} • Pages: {item.page_count}
                        </p>

                        <p className="text-green-600 font-semibold">
                          ₹{item.total_price}
                        </p>

                      </div>

                    ))}

                  </div>

                  {/* FOOTER */}

                  <div className="mt-4 flex justify-between items-center">

                    <div className="text-sm text-gray-500">
                      {pickup
                        ? new Date(pickup).toLocaleString()
                        : "No pickup time"}
                    </div>

                    <div className="text-lg font-bold text-green-700">
                      ₹{total}
                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </div>
  );
}