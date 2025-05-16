"use server";

import User from "@/types/User";
import { createHash, createDecipheriv } from "crypto";

/**
 * AES-256-CBC ile şifrelenmiş base64 veriyi çözer,
 * MD5 tabanlı 4 baytlık checksum kontrolü yapar.
 *
 * @param {string} encryptedData - Base64 ile kodlanmış şifreli veri.
 * @param {string} password      - Şifre çözme anahtarı.
 * @returns {string} Çözülen mesaj; checksum tutmuyorsa boş string.
 */
function decrypt(encryptedData: string, password: string): string {
  const method = "aes-256-cbc";

  // 1) SHA-256 ile 32 baytlık anahtar türet
  const key = createHash("sha256")
    .update(password, "utf8")
    .digest()
    .slice(0, 32);

  // 2) 16 baytlık sıfır IV
  const iv = Buffer.alloc(16, 0);

  // 3) Base64 → Buffer, AES-256-CBC ile çöz
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  const decipher = createDecipheriv(method, key, iv);
  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  // 4) İlk 4 bayt checksum, kalan mesaj
  const checksum = decryptedBuffer.slice(0, 4);
  const message = decryptedBuffer.slice(4);

  // 5) Mesajın MD5’inden ilk 4 baytı al, karşılaştır
  const md5sum = createHash("md5").update(message).digest().slice(0, 4);

  if (checksum.equals(md5sum)) {
    return message.toString("utf8");
  } else {
    return "";
  }
}

/**
 * Kullanıcı verisini çözmek için server-side action.
 *
 * @param {string} encryptedData - Şifrelenmiş kullanıcı verisi.
 * @param {string} password - Şifre çözme anahtarı.
 * @returns {User | null} Çözülen kullanıcı verisi veya null.
 */
export async function decryptUserData(encryptedData: string) {
  try {
    const password = process.env.APP_SECRET_KEY || "";
    const decryptedData = decrypt(encryptedData, password);

    if (!decryptedData) {
      console.error("Checksum validation failed or decryption error.");
      return null;
    }

    const user = JSON.parse(decryptedData);
    if (!user || typeof user !== "object") {
      console.error("Invalid user data format:", decryptedData);
      return null;
    }

    const modifedUser = {
      topluyoId: user.user_id,
      nick: user.user_nick,
      image: user.user_image,
      isOwnerMode: user.power,
      groupNick: user.group_nick,
      groupName: user.group_name,
    };

    return modifedUser as User;
  } catch (error) {
    console.error("Error decrypting user data:", error);
    return null;
  }
}
