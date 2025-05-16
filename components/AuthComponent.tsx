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
    // Mesajları dinle:
    const handleMessage = async (event: MessageEvent) => {
      // Güvenlik için origin kontrolü yapın:
      if (event.origin !== new URL(AUTH_IFRAME_URL).origin) return;
      let data;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error("Invalid JSON data:", error);
          return;
        }
      }
      if (!data || typeof data !== "object") {
        console.error("Invalid data format:", data);
        return;
      }
      if (data[">auth"]) {
        const user = await decryptUserData(data[">auth"]);
        if (!user) {
          console.error("Invalid user data:", data[">auth"]);
          return;
        }
        setUser(user);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      // Iframe içindeysek, parent'a auth isteği at
      window.parent.postMessage({ type: "<auth" }, "*");
    }
  }, []);

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
