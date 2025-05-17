// app/auth/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

export default function AuthPage() {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<{ data: any; origin: string }[]>([]);

  useEffect(() => {
    if (!window) return;
    const handleMessage = (event: MessageEvent) => {
      console.log(event.data);
      setMessages((prev) => [
        ...prev,
        { data: event.data, origin: event.origin },
      ]);
    };

    const isInFrame = window.self === window.top;

    if (!isInFrame) {
      window.top?.postMessage(JSON.stringify({ action: "<auth" }), "topluyo.com");
    }
    
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

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
      <div style={{ fontSize: "2vmin", marginTop: 16, opacity: 1 }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>origin:</b> {msg.origin}
            <br />
            <b>data:</b> {JSON.stringify(msg.data)}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
