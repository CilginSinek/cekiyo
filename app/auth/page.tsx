"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [pageError, setPageError] = useState<string|null>(null);

  const handleFetch = async (userToken: string) => {
    const res = await fetch("/api/setCookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userToken }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data);

    } else {
      setPageError(data.message);
      console.error("Error setting cookie:", data.message);
    }
  };

  useEffect(() => {
    if (!window) return;
    const handleMessage = async (event: MessageEvent) => {
      console.log(event.data, event.origin);
      if (event.origin !== "https://topluyo.com") return;
      try {
        const data = JSON.parse(event.data);
        if (data[">login"]) {
          handleFetch(data[">login"]).then(() => {
            event.source?.postMessage(JSON.stringify({ action: "<redirect", redirect: "/cekiyo" }));
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    const isInFrame = window.self === window.top;

    if (!isInFrame) {
      window.parent.postMessage(
        JSON.stringify({
          action: "<auth",
          url: "https://cekiyo.vercel.app/?%3Estart=%3Estart",
        }),
        "https://topluyo.com"
      );
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (user != null) {
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

  if(pageError) {
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
        {pageError}
      </div>
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
