"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("All fields are required ❌");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed ❌");
        return;
      }

      alert("Signup successful ✅");
      router.push("/login");

    } catch (err) {
      console.log("SIGNUP ERROR:", err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Create Account 🚀
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Signup to get started
        </p>

        {/* Inputs */}
        <div className="mt-6 space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
          />

        </div>

        {/* Button */}
        <button
          onClick={handleSignup}
          className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
        >
          Signup
        </button>

        {/* Redirect */}
        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-red-500 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}