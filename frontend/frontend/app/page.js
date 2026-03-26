import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Print Platform 🚀</h1>

      <Link href="/login" className="text-blue-500 underline">
        Go to Login
      </Link>

      <Link href="/upload" className="text-green-500 underline">
        Go to Upload
      </Link>

      <Link href="/signup" className="text-purple-500 underline">
        Go to Signup
      </Link>
    </div>
  );
}