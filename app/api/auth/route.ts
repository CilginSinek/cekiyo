import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { decrypt } from "../../../utils/decript";
import User from "@/types/User";
import jsonwebtoken from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" || !req.body[">auth"]) {
    return res.status(400).send("[Auth problem]");
  }
  const API_KEY = process.env.TP_API_KEY;
  if (!API_KEY) {
    return res.status(500).send("[Auth problem]");
  }
  const authCode = req.body[">auth"];
  const plain = decrypt(authCode, API_KEY);
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
    secure: process.env.NODE_ENV === "production",
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
