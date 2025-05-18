import { NextApiRequest, NextApiResponse } from "next";
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

export async function OPTIONS(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://topluyo.com");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.status(200).end();
  return;
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://topluyo.com");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method !== "POST" || !req.body[">auth"]) {
    return res.status(400).send("[Auth problem]");
  }
  const API_KEY = process.env.TP_API_KEY;
  if (!API_KEY) {
    return res.status(500).send("[Auth problem]");
  }
  const authCode = req.body[">auth"];
  const plain = await decrypt(authCode, API_KEY);
  if (!plain) {
    return res.status(401).send("[Auth problem]");
  }

  let payload;
  try {
    payload = JSON.parse(plain);
  } catch {
    return res.status(400).send("[Auth problem]");
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

  res.setHeader("Set-Cookie", cookieStr);

  // If they requested a plain redirect response
  if (req.body.redirect === "1") {
    return res.status(200).json({ redirect: redirectUrl });
  }

  // Otherwise do a server-side redirect
  res.writeHead(302, { Location: redirectUrl });
  res.end();
}

// Example redirect logic; tailor to your app
function getRedirectUrl(userPayload: { next: any }) {
  // e.g. return `/dashboard?user=${userPayload.id}`;
  return userPayload.next || "/";
}
