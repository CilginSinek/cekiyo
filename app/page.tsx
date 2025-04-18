"use client";
import { useUser } from "@/context/userContext";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { user, setUser } = useUser();

  const cookieSetter = () => {
    fetch(`${window.location.origin}/api/setCookie`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            setUser(data.data);
          });
        } else {
          console.log("Error setting cookie");
        }
      })
      .catch((err) => {
        console.log("Error setting cookie", err);
      });
  };

  useEffect(() => {
    if(window){
      window.addEventListener("message", (e) => {
        if (e.origin == "https://topluyo.com") {
          cookieSetter();
        }
      });
    }
    if (!user) {
      cookieSetter();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Çekiyo</h1>
      <Link href="/cekiyo">
      <p className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition duration-300 text-center sm:px-6 sm:py-3 sm:text-lg">
        Giriş Yap
      </p>
      </Link>
    </div>
  );
}
