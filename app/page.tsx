"use client";
import Link from "next/link";

export default function Home() {

  // addEventListener("message",(e)=>{
  //   if(e.origin === "https://topluyo.com"){
  //     document.cookie = `cekiyo-cookie=${e.data.token}; path=/; secure; samesite=strict`;
  //   }
  // })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Çekiyo</h1>
      <Link href="/cekiyo">
      <p className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300">
        Giris Yap
      </p>
      </Link>
    </div>
  );
}
