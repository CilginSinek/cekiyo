// app/auth/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

export default function AuthPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!window) return;
    const isInFrame = window.self === window.top;
    if (!isInFrame) {
      window.top?.postMessage({ action: "<auth" }, "*");
    }
  });

  useEffect(() => {
    if (user) {
      router.push("/cekiyo");
    }
  }, [user]);

  // Check if the current window is not inside an iframe
  if (typeof window !== "undefined" && window.self === window.top) {
    return (
      <iframe
        src={"https://topluyo.com/!auth/" + process.env.NEXT_PUBLIC_APP_ID}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          border: "none",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: "5vmin",
        opacity: 0.7,
        fontFamily: "system-ui",
      }}
    >
      Yönlendiriliyor…
    </div>
  );
}
