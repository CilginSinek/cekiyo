import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Import jwtVerify from jose

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET); // Use TextEncoder for the secret

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/cekiyo")) {
    const cookie = req.cookies.get("cekiyo-cookie");

    if (!cookie) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to login if cookie is missing
    }

    try {
      // Decode and verify the JWT using jose
      const { payload } = await jwtVerify(cookie.value, JWT_SECRET);

      // Validate the decoded object against the User type
      if (
        typeof payload.topluyoId === "string" &&
        typeof payload.nick === "string" &&
        typeof payload.image === "string" &&
        typeof payload.isOwnerMode === "boolean" &&
        typeof payload.groupNick === "string" &&
        typeof payload.groupName === "string"
      ) {
        // Allow the request to proceed
        return NextResponse.next();
      } else {
        throw new Error("Invalid User structure");
      }
    } catch (error) {
      console.error("Invalid JWT or User structure:", error);
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to login on error
    }
  }

  return NextResponse.next(); // Allow other routes to proceed
}
