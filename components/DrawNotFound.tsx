"use client";
import { useRouter } from "next/navigation";
import { JSX } from "react";

const DrawNotFound = (): JSX.Element => {
  const router = useRouter();
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-900 text-white"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Çekiliş Bulunamadı</h1>
        <p className="text-lg mb-6">
          Aradığınız çekiliş mevcut değil ya da silinmiş olabilir.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Geri Dön
        </button>
      </div>
    </div>
  );
};

export default DrawNotFound;
