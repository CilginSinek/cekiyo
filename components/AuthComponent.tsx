"use client";
import { useEffect } from "react";
import { useUser } from "../context/userContext";
import { decryptUserData } from "@/utils/decript";
import { useRouter } from "next/navigation";

const AUTH_IFRAME_URL = `https://topluyo.com/!auth/${process.env.NEXT_PUBLIC_APP_ID}`;

export default function AuthPage() {
  const { setUser, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.action == "<auth") {
          decryptUserData(data.user).then((decryptedUser) => {
            if (decryptedUser) {
              setUser(decryptedUser);
              router.replace("/cekiyo");
            }
          });
        }
      } catch (error) {
        console.log("Error parsing message data:", error, event.data);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      window.parent.postMessage(JSON.stringify({ action: "<auth" }), "*");
    }
  }, [window]);

  useEffect(() => {
    if (user) {
      router.replace("/cekiyo");
    }
  }, [user]);

  // Eğer iframe içinde değilsek, kendi içimize iframe aç:
  const isInIframe =
    typeof window !== "undefined" && window.self !== window.top;
  if (!isInIframe) {
    return (
      <div style={{ width: "100%", height: "100vh", border: "none" }}>
        <iframe
          src={AUTH_IFRAME_URL}
          style={{ width: "100%", height: "100%" }}
          title="Auth"
        />
      </div>
    );
  }

  // İframe içindeyken, üstten gelecek user bilgisinin gelmesini bekle:
  return <p>Üst pencereden kullanıcı bilgisi bekleniyor…</p>;
}
