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
    // For API responses, include token in the body too
    return new Response(JSON.stringify({ 
      redirect: redirectUrl, 
      token: token,  // Include token in response body
      success: true
    }), { 
      status: 200, 
      headers 
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
