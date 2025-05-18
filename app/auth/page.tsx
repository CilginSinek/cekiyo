"use client";
import { useEffect, useState } from "react";

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
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data[">auth"] || data[">login"]) {
        const token = data[">auth"] || data[">login"];
        
        // Create iframe to handle the auth response
        const authFrame = document.createElement('iframe');
        authFrame.style.display = 'none';
        authFrame.src = `/api/auth?token=${encodeURIComponent(token)}`;
        document.body.appendChild(authFrame);
        
        // Also send the traditional fetch request as fallback
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookie handling
          body: JSON.stringify({ ">auth": token, redirect: "1" }),
        })
          .catch((error) => {
            console.error("Authentication fetch error:", error);
          });
      }
      
      // Handle the auth-response message from our iframe
      if (data.action === "<auth-response") {
        const { redirect, token } = data;
        
        // Debug information
        console.log("Auth response received");
        console.log("Cookie status:", document.cookie ? "Cookie exists" : "No cookies");
        
        // Check localStorage
        try {
          console.log("LocalStorage debug:", localStorage.getItem("cekiyo-debug"));
          console.log("LocalStorage token exists:", !!localStorage.getItem("cekiyo-auth-token"));
        } catch (e) {
          console.error("LocalStorage check error:", e);
        }
        
        // Redirect as needed
        if (window.top && window.top !== window) {
          window.top.postMessage(
            JSON.stringify({ action: "<redirect", redirect, hasToken: !!token }),
            "*"
          );
        } else {
          // If not in iframe, redirect directly
          window.location.href = redirect || "/cekiyo";
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // State for storage test results
  const [storageTest, setStorageTest] = useState<string>("Not tested");
  const [cookieTest, setCookieTest] = useState<string>("Not tested");
  const [allCookies, setAllCookies] = useState<string>("");
  const [allStorage, setAllStorage] = useState<Record<string, string>>({});
  
  // Function to refresh storage values
  const refreshValues = () => {
    setAllCookies(document.cookie || "[Boş]");
    
    // Get all localStorage items
    const storage: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          storage[key] = localStorage.getItem(key) || "";
        }
      }
      setAllStorage(storage);
    } catch (e) {
      setAllStorage({ error: String(e) });
    }
  };
  
  // Call once on load
  useEffect(() => {
    refreshValues();
  }, []);
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        fontFamily: "system-ui",
        fontSize: "2vmin",
        opacity: 0.9,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "90vw",
        width: "600px",
        overflow: "auto",
        maxHeight: "80vh"
      }}
    >
      <h2>TopluYo Auth Debug Panel</h2>
      
      <div style={{ marginTop: "20px", fontSize: "14px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button 
            style={{ 
              padding: "8px 12px", 
              background: "#4a90e2", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
            onClick={() => {
              refreshValues();
            }}
          >
            Refresh Values
          </button>
          
          <button 
            style={{ 
              padding: "8px 12px", 
              background: "#e24a4a", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
            onClick={() => {
              try {
                localStorage.setItem("manual-test-key", "test-value-" + Date.now());
                setStorageTest("Success: " + localStorage.getItem("manual-test-key"));
                refreshValues();
              } catch (e) {
                setStorageTest("Error: " + String(e));
              }
            }}
          >
            Test localStorage
          </button>
          
          <button 
            style={{ 
              padding: "8px 12px", 
              background: "#4ae24a", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
            onClick={() => {
              try {
                const testValue = "test-value-" + Date.now();
                document.cookie = `manual-test-cookie=${testValue}; Path=/;`;
                setCookieTest("Cookie set attempt complete");
                refreshValues();
              } catch (e) {
                setCookieTest("Error: " + String(e));
              }
            }}
          >
            Test Cookie
          </button>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <strong>Test Results:</strong>
          <div>LocalStorage Test: {storageTest}</div>
          <div>Cookie Test: {cookieTest}</div>
        </div>
        
        <div><strong>Current Cookies:</strong></div>
        <div 
          style={{ 
            marginTop: "5px", 
            wordBreak: "break-all", 
            background: "#eee", 
            padding: "10px", 
            borderRadius: "4px", 
            fontSize: "12px",
            whiteSpace: "pre-wrap" 
          }}
        >
          {allCookies}
        </div>
        
        <div style={{ marginTop: "15px" }}><strong>Current LocalStorage:</strong></div>
        <div 
          style={{ 
            marginTop: "5px", 
            wordBreak: "break-all", 
            background: "#eee", 
            padding: "10px", 
            borderRadius: "4px", 
            fontSize: "12px",
            whiteSpace: "pre-wrap" 
          }}
        >
          {Object.entries(allStorage).map(([key, value]) => (
            <div key={key}>
              <strong>{key}</strong>: {String(value).length > 50 ? String(value).substring(0, 50) + "..." : value}
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: "15px", fontSize: "12px", opacity: 0.7 }}>
          Iframe origin: {typeof window !== "undefined" ? window.location.origin : ""}<br/>
          Parent origin: {typeof window !== "undefined" && window.parent !== window ? "In iframe" : "Not in iframe"}
        </div>
      </div>
    </div>
  );
}
