import { cookies } from 'next/headers'
import jsonwebtoken from "jsonwebtoken";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    // Get User from token in body
  const user = {
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banl\u0131yorum herkesi",
    isOwnerMode: true,
  };
  const token = jsonwebtoken.sign(user, process.env.JWT_SECRET! as string, {
    expiresIn: "1d",
  });
  // Set cookie in response
  const cookieStore = await cookies();
  cookieStore.set("cekiyo-cookie", token)

  // Return response
  return NextResponse.json({
    success: true,
    message: "Cookie set successfully",
    data: user,
  });
}
