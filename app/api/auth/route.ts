import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serialize } from "cookie";
import User from "@/types/User";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";

/**
 * PHP'den çevrilen decrypt fonksiyonu
 * AES-256-CBC ile şifrelenmiş veriyi çözer
 *
 * @param {string} encryptedData Base64 ile kodlanmış şifreli veri
 * @param {string} password Şifre anahtarı
 * @returns {string} Çözülen mesaj veya hata durumunda boş string
 */
function decrypt(encryptedData: string, password: string) {
  try {
    const method = "aes-256-cbc";

    // SHA-256 hash ve ilk 32 byte'ını alma (PHP'deki substr(hash('sha256', $password, true), 0, 32);)
    const key = crypto
      .createHash("sha256")
      .update(password)
      .digest()
      .slice(0, 32);

    // PHP'deki gibi sıfırlardan oluşan IV oluşturma
    const iv = Buffer.alloc(16, 0);

    // Base64 decode ve şifre çözme
    const encryptedBuffer = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv(method, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    // İlk 4 karakter checksum, geri kalanı mesaj
    const checksum = decrypted.slice(0, 4).toString();
    const message = decrypted.slice(4);

    // Mesajın MD5 hashinin ilk 4 karakterini al (PHP'deki substr(md5($message),0,4)
    const md5Hash = crypto.createHash("md5").update(message).digest("hex");
    const md5First4Chars = md5Hash.substring(0, 4);

    // Checksum ile karşılaştır
    if (md5First4Chars === checksum) {
      return message.toString("utf8");
    } else {
      return "";
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Decryption error:", error.message);
    } else {
      console.error("Decryption error:", error);
    }
    return "";
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Origin", "https://topluyo.com");
  headers.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  return new NextResponse(null, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Origin", "https://topluyo.com");
  headers.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("[Auth problem]", { status: 400, headers });
  }

  if (!body[">auth"]) {
    return new NextResponse("[Auth problem]", { status: 400, headers });
  }
  const API_KEY = process.env.TP_API_KEY;
  if (!API_KEY) {
    return new NextResponse("[Auth problem]", { status: 500, headers });
  }
  const authCode = body[">auth"];
  const plain = decrypt(authCode, API_KEY);
  if (!plain) {
    return new NextResponse("[Auth problem]", { status: 401, headers });
  }

  let payload;
  try {
    payload = JSON.parse(plain);
  } catch {
    return new NextResponse("[Auth problem]", { status: 400, headers });
  }

  // Let the caller decide where to go next
  const redirectUrl = getRedirectUrl(payload);

  const modifedUser = {
    topluyoId: payload.user_id,
    nick: payload.user_nick,
    image: payload.user_image,
    isOwnerMode: payload.power,
    groupNick: payload.group_nick,
    groupName: payload.group_name,
  } as User;
  const token = jsonwebtoken.sign(
    modifedUser,
    process.env.JWT_SECRET! as string,
    {
      expiresIn: "1d",
    }
  );

  // Set cookie for 1 day
  const cookieStr = serialize("cekiyo-cookie", token, {
    maxAge: 60 * 60 * 24 * 1,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  headers.set("Set-Cookie", cookieStr);

  // If they requested a plain redirect response
  if (body.redirect === "1") {
    return NextResponse.json({ redirect: redirectUrl }, { status: 200, headers });
  }

  // Otherwise do a server-side redirect
  headers.set("Location", redirectUrl);
  return new NextResponse(null, { status: 302, headers });
}

// Example redirect logic; tailor to your app
function getRedirectUrl(userPayload: { next: any }) {
  // e.g. return `/dashboard?user=${userPayload.id}`;
  return userPayload.next || "/";
}
