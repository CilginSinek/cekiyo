import { cookies } from "next/headers";
import jsonwebtoken from "jsonwebtoken";
import { NextResponse } from "next/server";
import { decryptUserData } from "@/utils/decript";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.userToken) {
    return NextResponse.json({
      success: false,
      message: "User token not provided",
    });
  }

  // Decrypt the user token
  const decryptedData = await decryptUserData(body.userToken);
  if (!decryptedData) {
    return NextResponse.json({
      success: false,
      message: "Decryption failed",
    });
  }
  if (decryptedData.topluyoId == "-1") {
    return NextResponse.json({
      success: false,
      message: "User not found",
    });
  }

  const user = decryptedData;
  const token = jsonwebtoken.sign(user, process.env.JWT_SECRET! as string, {
    expiresIn: "1d",
  });
  // Set cookie in response
  const cookieStore = await cookies();
  cookieStore.set("cekiyo-cookie", token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
  });

  // Return response
  return NextResponse.json({
    success: true,
    message: "Cookie set successfully",
    data: user,
  });
}
