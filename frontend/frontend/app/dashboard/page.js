"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const handlePayment = async () => {

  if (loading) return;

  setLoading(true);
    console.log("PAYMENT CLICKED");
  const user = JSON.parse(localStorage.getItem("user"));

 if (!fileDetails.length) {
  setLoading(false);
  return alert("No files selected ❌");
}

if (!pickupTime) {
  setLoading(false);
  return alert("Select pickup time ❌");
  
} 
const selectedTime = new Date(pickupTime);
const now = new Date();

const minimumTime = new Date(
  now.getTime() + 5 * 60 * 1000
);
console.log("Pickup Time:", pickupTime);
console.log("Selected Time:", selectedTime);
console.log("Current Time:", now);
console.log("Minimum Time:", minimumTime);
const selectedTimestamp = selectedTime.getTime();
const minimumTimestamp = minimumTime.getTime();

console.log("Selected TS:", selectedTimestamp);
console.log("Minimum TS:", minimumTimestamp);

if (selectedTimestamp < minimumTimestamp) {

  setLoading(false);

  return alert(
    "Please select a pickup time at least 5 minutes from now ❌"
  );
}
  try {

    // CREATE ORDER FROM BACKEND
    const res = await fetch("http://localhost:5000/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: totalOrderPrice
      })
    });

   const order = await res.json();
console.log("ORDER RESPONSE:", order);

   if (!window.Razorpay) {
  alert("Razorpay not loaded ❌");
  return;
}

console.log("ORDER:", order); // ✅ moved outside
const options = {
  key: "rzp_test_T4I8GqjjfTJ4ui",
  amount: order.amount,
  currency: "INR",
  order_id: order.id,

  name: "Printify",
  description: "Print Order Payment",

  handler: async function (response) {

  console.log(
  "FULL PAYMENT RESPONSE:",
  JSON.stringify(response, null, 2)
);

console.log(
  "PAYMENT ID:",
  response.razorpay_payment_id
);

console.log(
  "ORDER ID:",
  response.razorpay_order_id
);

console.log(
  "SIGNATURE:",
  response.razorpay_signature
);

  const verifyRes = await fetch("http://localhost:5000/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature
    })
  });

  const data = await verifyRes.json();

  console.log("VERIFY RESPONSE:", data);

  if (data.success) {
    console.log("CALLING HANDLE ORDER...");
    await handleOrder({
  payment_id: response.razorpay_payment_id,
  razorpay_order_id: response.razorpay_order_id
});
  } else {
    alert("Payment verification failed ❌");
  }

}, // ✅ COMMA HERE (after handler ends)
  modal: {
    ondismiss: function () {
      console.log("Payment popup closed ❌");
    }
  },

  prefill: {
    name: user?.name || "",
    email: user?.email || ""
  },

  theme: {
    color: "#6366f1"
  }
};
    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
  console.error(err);
  alert("Payment failed ❌");
} finally {
  setLoading(false);
}

};

  const router = useRouter();

  // ======================
  // STATES
  // ======================

  const [files, setFiles] =
    useState([]);
    const [loading, setLoading] = useState(false);

  const [pickupTime, setPickupTime] =
    useState("");
    const [analyzing, setAnalyzing] = useState(false);

  const [orders, setOrders] =
    useState([]);

  const [fileDetails, setFileDetails] =
    useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [user, setUser] = useState(null);
    

  // ======================
  // PROTECT ROUTE
  // ======================

  useEffect(() => {

    const user =
      localStorage.getItem("user");

    if (!user) {

      router.push("/login");

      return;
      setUser(JSON.parse(user));

    }

    // INITIAL FETCH

    fetchOrders();

    // AUTO REFRESH

    const interval =
      setInterval(() => {

        fetchOrders();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  // ======================
  // FETCH ORDERS
  // ======================

 const fetchOrders = async () => {

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    console.log("USER:", user);

    const res = await fetch(
      `http://localhost:5000/orders/${user.id}`
    );

    console.log("STATUS:", res.status);

    const text = await res.text();

    console.log("RESPONSE:", text);

    const data = JSON.parse(text);

    setOrders(Array.isArray(data) ? data : []);

  } catch (err) {

    console.error("FETCH ERROR:", err);

  }
};

  // ======================
  // CALCULATE PRICE
  // ======================

  const calculatePrice = async (selectedFiles = files) => {
setAnalyzing(true);
  if (selectedFiles.length === 0) {
    setAnalyzing(false);
    return alert("Select PDFs ❌");
  }
    

 const invalidFile = selectedFiles.find(
    file => file.type !== "application/pdf"
  );

  if (invalidFile) {
     setAnalyzing(false);
    return alert("Only PDF files allowed ❌");

  }

  try {

      const formData =
        new FormData();
       

      selectedFiles.forEach((file) => {
        formData.append(
          "files",
          file
        );

      });

      const res = await fetch(
        "http://localhost:5000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

     const data = await res.json();

console.log("STATUS:", res.status);
console.log("UPLOAD RESPONSE:", data);

if (!res.ok) {
  setAnalyzing(false);

  return alert(
    data.message ||
    data.error ||
    "Upload failed ❌"
  );
}

if (!data.files || data.files.length === 0) {

  setAnalyzing(false);

  return alert(
    "No files received from server ❌"
  );
}

const updatedFiles =
  data.files.map((file) => ({

    ...file,

    copies: 1,

    printType: "bw",

    price:
      file.pages * 1 * 1,

  }));
  setFileDetails(updatedFiles);

setAnalyzing(false); 
  

      // CLEAR INPUT

      document.querySelector(
        'input[type="file"]'
      ).value = "";

    }catch (err) {

  console.error(err);

  setAnalyzing(false);

  alert("File upload failed ❌");

}};

  // ======================
  // TOTAL BILL
  // ======================

  const totalOrderPrice =
    fileDetails.reduce(
      (sum, file) =>
        sum + file.price,
      0
    );

  // ======================
  // PLACE ORDER
  // ======================

  const handleOrder = async (paymentData) => {                    
    const orderGroupId =

  "ORD-" +

  Date.now();

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (files.length === 0) {

      return alert(
        "Please select PDFs ❌"
      );

    }

    if (!pickupTime) {

      return alert(
        "Please select pickup time ❌"
      );

    }
    const selectedTime = new Date(pickupTime);

const now = new Date();

if (selectedTime <= now) {

  return alert(
    "Pickup time must be in future ❌"
  );

}

    try {

      for (const fileData of fileDetails) {

        const formData =
          new FormData();

        const originalFile =
          files.find(
            (f) =>
              f.name ===
              fileData.file_name
          );

        formData.append(
          "file",
          originalFile
        );

        formData.append(
          "copies",
          fileData.copies
        );
        console.log(
  "SENDING PRINT TYPE:",
  fileData.printType
);
        formData.append(
  "print_type",
  fileData.printType
);

        formData.append(
          "pickup_time",
          pickupTime
        );

        formData.append(
          "user_id",
          user.id
        );

        formData.append(
  "order_group_id",
  orderGroupId
);
formData.append("payment_id", paymentData.payment_id);
formData.append("razorpay_order_id", paymentData.razorpay_order_id);

        await fetch(
          "http://localhost:5000/order",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      setSuccessMessage(
  `🎉 Order placed successfully!
Total Bill: ₹${totalOrderPrice}`
);
      fetchOrders();

      // RESET

      setFiles([]);

      setFileDetails([]);

      setPickupTime("");
      router.push("/orders");

      document.querySelector(
        'input[type="file"]'
      ).value = "";

    } catch (err) {

      console.log(err);

    }
  };

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

    <div className="min-h-screen bg-gray-200 text-black">

      {/* NAVBAR */}

      <div className="bg-white shadow-lg">

        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

          {/* LOGO */}

          <h1 className="text-4xl font-extrabold text-red-500">

            Printify

          </h1>

          {/* RIGHT BUTTONS */}

          <div className="flex gap-4">

            {/* MY ORDERS */}

            <button
              onClick={() =>
                router.push("/orders")
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
             My Orders ({orders.length})
            </button>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      {/* MAIN */}

      <div className="max-w-7xl mx-auto p-6">
        {/* HERO SECTION */}

<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-8 mb-8 shadow-xl">

  <h1 className="text-4xl font-bold">
    👋 Welcome {user?.name}
    
  </h1>

  <p className="mt-3 text-lg text-blue-100">
    Upload PDFs and get them printed without waiting in queues.
  </p>

</div>

{
  orders.some(
    order =>
      order.status === "ready"
  ) && (

    <div className="bg-purple-100 border border-purple-300 text-purple-800 p-4 rounded-2xl mb-6">

      🎉 One or more of your orders are ready for pickup.

    </div>

  )
}

<div className="grid md:grid-cols-3 gap-6 mb-8">

  <div className="bg-white p-6 rounded-2xl shadow-lg">

    <h3 className="text-gray-500">
      Total Orders
    </h3>

    <p className="text-4xl font-bold text-blue-600">
      {orders.length}
    </p>

  </div>

  <div className="bg-white p-6 rounded-2xl shadow-lg">

    <h3 className="text-gray-500">
      Active Orders
    </h3>

    <p className="text-4xl font-bold text-yellow-500">
      {
        orders.filter(
          order =>
            order.status !== "completed"
        ).length
      }
    </p>

  </div>

  <div className="bg-white p-6 rounded-2xl shadow-lg">

    <h3 className="text-gray-500">
      Total Spent
    </h3>

    <p className="text-4xl font-bold text-green-600">
      ₹{
        orders.reduce(
          (sum, order) =>
            sum + Number(order.total_price),
          0
        )
      }
    </p>

  </div>

</div>
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT PANEL */}

          <div className="bg-white rounded-2xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6">

              📄 Upload Documents

            </h2>

            {/* FILE INPUT */}

            <input
              type="file"
              multiple
              accept=".pdf"
              
              onChange={async (e) => {

  const newFiles = [

    ...files,

    ...Array.from(e.target.files),

  ];

  setFiles(newFiles);
  calculatePrice(newFiles);


}}
              className="w-full border border-gray-300 p-4 rounded-xl mb-4 bg-white text-black"
              />
           {files.length > 0 && (

  <div className="mt-4">

    <h3 className="font-semibold mb-2">
      Selected Files
    </h3>

    {files.map((file, index) => (

      <div
        key={index}
        className="border p-2 rounded mb-2 flex justify-between items-center"
      >

       <div>

  <div>
    📄 {file.name}
  </div>

  <div className="text-sm text-gray-500">
    {(file.size / 1024 / 1024).toFixed(2)} MB
  </div>

</div>

      <button
  onClick={() => {

    const updatedFiles =
      files.filter(
        (_, i) => i !== index
      );

    setFiles(
      updatedFiles
    );

    const removedFile =
      files[index];

    setFileDetails(
      fileDetails.filter(
        file =>
          file.file_name !==
          removedFile.name
      )
    );

  }}
  className="bg-red-500 text-white px-2 py-1 rounded"
>
  Remove
</button>

      </div>

    ))}

  </div>

)}


            {/* PICKUP */}

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4">

  <div className="flex items-center gap-2 mb-2">
    <span className="text-2xl">⏰</span>

    <h3 className="font-bold text-lg text-indigo-700">
      When do you want to collect your prints?
    </h3>
  </div>

  <p className="text-sm text-gray-600 mb-4">
    Select your preferred pickup date & time.
    Orders can be collected after a minimum of 5 minutes.
  </p>

  <input
    type="datetime-local"
    value={pickupTime}
    onChange={(e) => setPickupTime(e.target.value)}
    className="w-full border-2 border-indigo-200 rounded-xl p-4 text-lg focus:outline-none focus:border-indigo-500 bg-white"
  />

</div>

   
            {/* CALCULATE */}

          <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-4">

  <p className="text-green-700 font-medium">
    ✅ PDFs analyzed automatically
  </p>

</div>
<button
  onClick={() => {

  setFiles([]);

  setFileDetails([]);

  document.querySelector(
    'input[type="file"]'
  ).value = "";

}}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
>
  🗑️ Clear All Files
</button>

</div>

{analyzing && (

  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4">

    <p className="font-medium text-yellow-700">
      ⏳ Analyzing PDFs...
    </p>

  </div>
  

)}
{/* RIGHT PANEL */}

          {/* RIGHT PANEL */}
{successMessage && (

  <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl mb-4">

    <div className="font-bold text-lg">
      {successMessage}
    </div>

    <button
      onClick={() =>
        setSuccessMessage("")
      }
      className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      Continue
    </button>

  </div>

)}
          <div>

            <h2 className="text-3xl font-bold mb-6 text-black">

              🛒 Order Summary

            </h2>

            {fileDetails.length === 0 ? (

              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">

                <p className="text-6xl mb-4">
                  📄
                </p>

                <p className="text-xl font-semibold text-gray-700">

                  No PDFs Added

                </p>

                <p className="text-gray-500 mt-2">

                  Upload PDFs to continue

                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {fileDetails.map((file, index) => (

                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
                  >

                    {/* FILE NAME */}

                    <h3 className="font-bold text-xl text-black break-words">

                      {file.file_name}

                    </h3>

                    {/* PAGES */}

                    <p className="text-gray-600 mt-2">

                      {file.pages} Pages

                    </p>

                    {/* COPIES CONTROL */}

                    <div className="flex items-center gap-4 mt-5">

                      {/* MINUS */}

                      <button
                        onClick={() => {

                          const updated =
                            [...fileDetails];

                          if (
                            updated[index]
                              .copies > 1
                          ) {

                            updated[index]
                              .copies -= 1;

                           const rate =
                           updated[index].printType ===
                          "color"
                            ? 5
                            : 1;

updated[index].price =
  updated[index].pages *
  updated[index].copies *
  rate;
                            setFileDetails(
                              updated
                            );

                          }

                        }}
                        className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full text-xl font-bold"
                      >
                        -
                      </button>

                      {/* COPIES */}

                      <span className="text-xl font-bold">

                        {file.copies}

                      </span>

                      {/* PLUS */}

                      <button
                        onClick={() => {

                          const updated =
                            [...fileDetails];
                            updated[index].copies += 1;

                         const rate =
  updated[index].printType ===
  "color"
    ? 5
    : 1;

updated[index].price =
  updated[index].pages *
  updated[index].copies *
  rate;
                          setFileDetails(
                            updated
                          );

                        }}
                        className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full text-xl font-bold"
                      >
                        +
                      </button>

                    </div>
                    
<p className="mt-3 font-medium">
  Print Type
</p>

<select
  value={file.printType}
  onChange={(e) => {

    const updated = [...fileDetails];

    updated[index].printType =
      e.target.value;

    const rate =
      e.target.value === "color"
        ? 5
        : 1;

    updated[index].price =
      updated[index].pages *
      updated[index].copies *
      rate;

    setFileDetails(updated);

  }}
  className="mt-4 border p-2 rounded-lg w-full"
>
  <option value="bw">
    Black & White (₹1/page)
  </option>

  <option value="color">
    Color (₹5/page)
  </option>
</select>

                    {/* PRICE */}

                    <p className="text-3xl font-bold text-green-600 mt-5">

                      ₹{file.price}

                    </p>

                    {/* REMOVE */}

                    <button
                      onClick={() => {

  const updatedDetails =
    fileDetails.filter(
      (_, i) => i !== index
    );

  setFileDetails(
    updatedDetails
  );

  const updatedFiles =
    files.filter(
      (f) =>
        f.name !==
        file.file_name
    );

  setFiles(
    updatedFiles
  );

}}
                      className="mt-5 text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>

                  </div>

                ))}

                {/* TOTAL */}

                <div className="bg-green-100 p-6 rounded-2xl shadow">

                  <h2 className="text-2xl font-bold text-green-700">

                    Total Bill:
                    ₹{totalOrderPrice}

                  </h2>

                </div>

                {/* PLACE ORDER */}

                <button
  onClick={handlePayment}
  disabled={loading}
  className={`w-full py-4 rounded-xl font-bold text-white transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {loading
    ? "⏳ Processing Payment..."
    : `💳 Pay ₹${totalOrderPrice}`}
</button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}