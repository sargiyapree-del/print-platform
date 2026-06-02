"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-red-500">
          Printify
        </h1>

        <div className="space-x-4">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-700 font-medium"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Signup
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-24 px-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Print Documents Easily 📄
        </h1>

        <p className="mt-4 text-gray-600 max-w-md">
          Upload your files, choose copies, and pick them up at your nearest shop.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg text-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}