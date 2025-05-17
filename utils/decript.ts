"use server";

import User from "@/types/User";
import crypto from "crypto";

/**
 * PHP'den çevrilen decrypt fonksiyonu
 * AES-256-CBC ile şifrelenmiş veriyi çözer
 * 
 * @param {string} encryptedData Base64 ile kodlanmış şifreli veri
 * @param {string} password Şifre anahtarı
 * @returns {string} Çözülen mesaj veya hata durumunda boş string
 */
function decrypt(encryptedData:string, password:string) {
  try {
    const method = 'aes-256-cbc';
    
    // SHA-256 hash ve ilk 32 byte'ını alma (PHP'deki substr(hash('sha256', $password, true), 0, 32);)
    const key = crypto.createHash('sha256').update(password).digest().slice(0, 32);
    
    // PHP'deki gibi sıfırlardan oluşan IV oluşturma
    const iv = Buffer.alloc(16, 0);
    
    // Base64 decode ve şifre çözme
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(method, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    
    // İlk 4 karakter checksum, geri kalanı mesaj
    const checksum = decrypted.slice(0, 4).toString();
    const message = decrypted.slice(4);
    
    // Mesajın MD5 hashinin ilk 4 karakterini al (PHP'deki substr(md5($message),0,4)
    const md5Hash = crypto.createHash('md5').update(message).digest('hex');
    const md5First4Chars = md5Hash.substring(0, 4);
    
    // Checksum ile karşılaştır
    if (md5First4Chars === checksum) {
      return message.toString('utf8');
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

/**
 * Kullanıcı verisini çözmek için server-side action.
 *
 * @param {string} encryptedData - Şifrelenmiş kullanıcı verisi.
 * @param {string} password - Şifre çözme anahtarı.
 * @returns {User | null} Çözülen kullanıcı verisi veya null.
 */
export async function decryptUserData(encryptedData: string) {
  try {
    const password = process.env.TP_API_KEY || "";
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
