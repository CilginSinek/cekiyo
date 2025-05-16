// app/api/auth/crypto.js
import crypto from 'crypto';

export function decryptTPAuth(encryptedData: string, apiKey: string) {
  // PHP’deki hash ve IV üretimine karşılık:
  const key = crypto.createHash('sha256').update(apiKey).digest().slice(0, 32);
  const iv = Buffer.alloc(16, 0); // 16 byte sıfır

  // Base64 çöz, AES-256-CBC’i uygula
  const encryptedBuffer = Buffer.from(encryptedData, 'base64');
  let decrypted;
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
  } catch (e) {
    return null;
  }

  // PHP’deki checksum kontrolüne karşılık:
  const checksum = decrypted.slice(0, 4).toString('binary');
  const message = decrypted.slice(4).toString('utf8');
  const md5 = crypto.createHash('md5').update(message).digest('hex').slice(0, 4);

  if (md5 === checksum) {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  }
  return null;
}
