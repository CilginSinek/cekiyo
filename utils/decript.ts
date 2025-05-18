// "use server";

// import User from "@/types/User";

// /**
//  * Kullanıcı verisini çözmek için server-side action.
//  *
//  * @param {string} encryptedData - Şifrelenmiş kullanıcı verisi.
//  * @param {string} password - Şifre çözme anahtarı.
//  * @returns {User | null} Çözülen kullanıcı verisi veya null.
//  */
// export async function decryptUserData(encryptedData: string, API_KEY: string | undefined) {
//   try {
//     const password = process.env.TP_API_KEY || "";
//     const decryptedData = decrypt(encryptedData, password);

//     if (!decryptedData) {
//       console.error("Checksum validation failed or decryption error.");
//       return null;
//     }

//     const user = JSON.parse(decryptedData);
//     if (!user || typeof user !== "object") {
//       console.error("Invalid user data format:", decryptedData);
//       return null;
//     }

//     const modifedUser = {
//       topluyoId: user.user_id,
//       nick: user.user_nick,
//       image: user.user_image,
//       isOwnerMode: user.power,
//       groupNick: user.group_nick,
//       groupName: user.group_name,
//     };

//     return modifedUser as User;
//   } catch (error) {
//     console.error("Error decrypting user data:", error);
//     return null;
//   }
// }
