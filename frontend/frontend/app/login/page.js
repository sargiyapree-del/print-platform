"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  if (!email || !password) {
    alert("All fields required ❌");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed ❌");
      return;
    }

    // ✅ Save user
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful ✅");

    // ✅ Redirect to dashboard
    router.push("/dashboard");

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    alert("Something went wrong ❌");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Login to continue
        </p>

        {/* Inputs */}
        <div className="mt-6 space-y-4">
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
          onClick={handleLogin}
          className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
        >
          Login
        </button>

        {/* Redirect */}
        <p className="text-center text-gray-500 mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-red-500 cursor-pointer font-medium"
          >
            Signup
          </span>
        </p>

      </div>
    </div>
  );
}