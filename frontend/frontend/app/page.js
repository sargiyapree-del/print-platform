"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Print Service</h1>

      <button
        onClick={() => router.push("/login")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login
      </button>

      <button
        onClick={() => router.push("/signup")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Signup
      </button>
    </div>
  );
}