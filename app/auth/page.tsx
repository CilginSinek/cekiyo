"use client";
import { useEffect } from "react";

export default function AuthPage() {
  useEffect(() => {
    if (!window) return;
    // Notify parent we’re ready to receive
    if (window.top) {
      window.top.postMessage(
        JSON.stringify({ action: "<auth", url: location.href }),
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
          credentials: "include",
          body: JSON.stringify({ ">auth": token, redirect: "1" }),
        })
          .then((r) => r.json())
          .then(({ redirect }) => {
            if (window.top) {
              window.top.postMessage(
                JSON.stringify({ action: "<redirect", redirect }),
                "*"
              );
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
