"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Çekiyo</h1> 
        <Link
          href={"/auth"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition duration-300 text-center sm:px-6 sm:py-3 sm:text-lg"
        >
          Giriş Yap
        </Link>
    </div>
  );
}
