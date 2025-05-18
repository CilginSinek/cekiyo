import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import User from "@/types/User";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";

/**
 * Decrypt function (PHP uyumlu)
 */
function decrypt(encryptedData: string, password: string) {
  try {
    const method = "aes-256-cbc";
    const key = crypto.createHash("sha256").update(password).digest().slice(0, 32);
    const iv = Buffer.alloc(16, 0);
    const encryptedBuffer = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(method, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    const checksum = decrypted.slice(0, 4).toString();
    const message = decrypted.slice(4);
    const md5Hash = crypto.createHash("md5").update(message).digest("hex");
    if (md5Hash.substring(0, 4) === checksum) {
      return message.toString("utf8");
    } else {
      return "";
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "https://topluyo.com",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    },
  });
}

export async function GET(req: NextRequest) {
  const origin = "https://topluyo.com";
  const token = req.nextUrl.searchParams.get("token");
  
  if (!token) {
    return new Response("[Auth problem]", {
      status: 400,
      headers: corsHeaders(origin),
    });
  }
  
  const API_KEY = process.env.TP_API_KEY;
  if (!API_KEY) {
    return new Response("[Auth problem]", {
      status: 500,
      headers: corsHeaders(origin),
    });
  }

  const plain = decrypt(token, API_KEY);
  if (!plain) {
    return new Response("[Auth problem]", {
      status: 401,
      headers: corsHeaders(origin),
    });
  }

  let payload;
  try {
    payload = JSON.parse(plain);
  } catch {
    return new Response("[Auth problem]", {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  const modifedUser: User = {
    topluyoId: payload.user_id,
    nick: payload.user_nick,
    image: payload.user_image,
    isOwnerMode: payload.power,
    groupNick: payload.group_nick,
    groupName: payload.group_name,
  };

  const jwtToken = jsonwebtoken.sign(modifedUser, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const redirectUrl = getRedirectUrl(payload);
  
  // Return HTML with script to set cookies and localStorage
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Setting Authentication...</title>
    </head>
    <body>
      <script>
        // Set cookies using JavaScript - without domain restriction for better debugging
        document.cookie = "cekiyo-cookie=${jwtToken}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure;";
        document.cookie = "cekiyo-client-token=${jwtToken}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure;";
        document.cookie = "cekiyo-debug-timestamp=${Date.now()}; Max-Age=${60 * 60 * 24}; Path=/;";
        
        // Store in localStorage
        try {
          localStorage.setItem("cekiyo-auth-token", "${jwtToken}");
          localStorage.setItem("cekiyo-debug", "Token set at ${Date.now()}");
          console.log("Token stored in localStorage:", localStorage.getItem("cekiyo-auth-token"));
        } catch(e) {
          console.error("LocalStorage error:", e);
        }
        
        // Send response back to parent with user information
        window.parent.postMessage(JSON.stringify({
          action: "<auth-response",
          redirect: "${redirectUrl}",
          token: "${jwtToken}",
          userInfo: ${JSON.stringify(modifedUser)},
          success: true
        }), "*");
      </script>
    </body>
    </html>
  `;
  
  return new Response(htmlResponse, { 
    status: 200, 
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "text/html"
    }
  });
}

export async function POST(req: NextRequest) {
  const origin = "https://topluyo.com"; // 🔒 iframe içine gelen domain

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "[Auth problem]" }, {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  if (!body[">auth"]) {
    return NextResponse.json({ error: "[Auth problem]" }, {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  const API_KEY = process.env.TP_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: "[Auth problem]" }, {
      status: 500,
      headers: corsHeaders(origin),
    });
  }

  const plain = decrypt(body[">auth"], API_KEY);
  if (!plain) {
    return NextResponse.json({ error: "[Auth problem]" }, {
      status: 401,
      headers: corsHeaders(origin),
    });
  }

  let payload;
  try {
    payload = JSON.parse(plain);
  } catch {
    return NextResponse.json({ error: "[Auth problem]" }, {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  const modifedUser: User = {
    topluyoId: payload.user_id,
    nick: payload.user_nick,
    image: payload.user_image,
    isOwnerMode: payload.power,
    groupNick: payload.group_nick,
    groupName: payload.group_name,
  };

  const token = jsonwebtoken.sign(modifedUser, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const redirectUrl = getRedirectUrl(payload);
  
  // Create two cookie strings - one HTTP only and one client-readable
  const httpOnlyCookie = `cekiyo-cookie=${token}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure; HttpOnly`;
  const clientCookie = `cekiyo-client-token=${token}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure`;
  
  // Create response headers including CORS headers
  const headers = new Headers();
  headers.append('Set-Cookie', httpOnlyCookie);
  headers.append('Set-Cookie', clientCookie);
  
  // Add all CORS headers
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  if (body.redirect === "1") {
    // For API responses, include token in the response body and as script to set cookies
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Setting Authentication...</title>
      </head>
      <body>
        <script>
          // Set cookies using JavaScript
          document.cookie = "cekiyo-cookie=${token}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure; HttpOnly";
          document.cookie = "cekiyo-client-token=${token}; Max-Age=${60 * 60 * 24}; Path=/; SameSite=None; Secure";
          
          // Store in localStorage
          try {
            localStorage.setItem("cekiyo-auth-token", "${token}");
            localStorage.setItem("cekiyo-debug", "Token set at ${Date.now()}");
            console.log("Token stored in localStorage:", localStorage.getItem("cekiyo-auth-token"));
          } catch(e) {
            console.error("LocalStorage error:", e);
          }
          
          // Send response back
          window.parent.postMessage(JSON.stringify({
            action: "<auth-response",
            redirect: "${redirectUrl}",
            token: "${token}",
            success: true
          }), "*");
        </script>
      </body>
      </html>
    `;
    
    // Return HTML response with script that sets cookies
    return new Response(htmlResponse, { 
      status: 200, 
      headers: {
        ...corsHeaders(origin),
        "Content-Type": "text/html"
      }
    });
  } else {
    // For direct redirects
    headers.set('Location', redirectUrl);
    return new Response(null, { 
      status: 302, 
      headers 
    });
  }

}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Origin, X-Requested-With, Accept",
    "Access-Control-Allow-Origin": origin,
    "X-Frame-Options": "ALLOWALL",
    "Content-Security-Policy": "frame-ancestors *",
    "Content-Type": "application/json"
  };
}

function getRedirectUrl(userPayload: { next?: string }) {
  return userPayload.next || "https://cekiyo.vercel.app/cekiyo";
}
