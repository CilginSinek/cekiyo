// app/auth/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = JSON.parse(e.data);
        if (data[">auth"]) {
          // formData ile POST et
          fetch("/api/auth", {
            method: "POST",
            body: new URLSearchParams({
              ">auth": data[">auth"],
              redirect: "1",
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              // Üst pencereye redirect URL’i yolla
              if (window.top) {
                window.top.postMessage(
                  JSON.stringify({
                    action: "<redirect",
                    redirect: json.redirect,
                  }),
                  "*"
                );
              }
            });
        }
      } catch {}
    }
    window.addEventListener("message", onMessage);
    // Başlatma isteğini frame dışında gönder
    if (window.top === window) {
      window.location.href = `https://topluyo.com/!auth/${process.env.NEXT_PUBLIC_APP_ID}`;
    } else {
      if (window.top) {
        window.top.postMessage(
          JSON.stringify({ action: "<auth", url: window.location.href }),
          "*"
        );
      }
    }
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

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
