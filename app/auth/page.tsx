"use client";
import { useEffect } from "react";

export default function AuthPage() {
  useEffect(() => {
    if (!window) return;
    // Notify parent we’re ready to receive
    if (window.top) {
      window.top.postMessage(
        JSON.stringify({ action: "<auth", url: "https://cekiyo.vercel.app/?%3Estart=%3Estart" }),
        "*"
      );
    }

    // If not in an iframe, go straight to the provider
    if (window.top === window) {
      window.location.href =
        "https://topluyo.com/!auth/" + process.env.NEXT_PUBLIC_APP_ID;
    }

    const handler = (event: MessageEvent) => {
      if (!event.origin.endsWith("topluyo.com")) return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data[">auth"] || data[">login"]) {
        const token = data[">auth"] || data[">login"];
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookie handling
          body: JSON.stringify({ ">auth": token, redirect: "1" }),
        })
          .then((r) => r.json())
          .then((response) => {
            const { redirect, token } = response;
            
            // Check if cookies were set by looking at document.cookie
            console.log("Cookie status:", document.cookie ? "Cookie exists" : "No cookies");
            
            // If we received a token in the response, store it in localStorage as fallback
            if (token) {
              console.log("Received token from API, storing in localStorage");
              localStorage.setItem("cekiyo-auth-token", token);
            }
            
            if (window.top) {
              window.top.postMessage(
                JSON.stringify({ action: "<redirect", redirect, hasToken: !!token }),
                "*"
              );
            } else {
              // If not in iframe, redirect directly
              window.location.href = redirect;
            }
          })
          .catch((error) => {
            console.error("Authentication error:", error);
            // Try to redirect to home page if authentication fails
            if (window.top === window) {
              window.location.href = "/";
            }
          });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        fontFamily: "system-ui",
        fontSize: "5vmin",
        opacity: 0.7,
      }}
    >
      Yönlendiriliyor…
    </div>
  );
}
