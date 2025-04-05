import { decoderToken } from "@/utils/handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import User from "@/types/User";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("cekiyo-cookie")?.value;

  if (!cookie) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const decoded = decoderToken(cookie);
  if (!decoded) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json(); // Parse the request body

    // Validate the required fields
    const { drawName, drawDescription, drawPrize, drawDate, closeTime } = body;

    if (
      typeof drawName !== "string" ||
      typeof drawDescription !== "string" ||
      typeof drawPrize !== "string" ||
      isNaN(Date.parse(drawDate)) || // Check if drawDate is a valid date
      (closeTime && isNaN(Date.parse(closeTime))) // Optional closeTime validation
    ) {
      return new NextResponse("Invalid body structure", { status: 400 });
    }

    // Create a new Draw object
    const newDraw = {
      drawName,
      drawDescription,
      drawPrize,
      drawDate: new Date(drawDate),
      closeTime: closeTime ? new Date(closeTime) : undefined,
      drawStatus: "open",
      drawUsers: [],
      drawWinners: [],
      drawOwner: decoded,
    };

    const createdNewDraw = await prisma.draw.create({
      data: newDraw,
    });

    return NextResponse.json({
      status: "success",
      message: "Draw created successfully",
      draw: createdNewDraw,
    });
  } catch (error) {
    console.error("Error parsing or validating body:", error);
    return new NextResponse("Invalid request body", { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!req.body) {
    return new NextResponse("Invalid request body", { status: 400 });
  }
  const cookieStore = await cookies();
  const cookie = cookieStore.get("cekiyo-cookie")?.value;

  if (!cookie) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const decoded = decoderToken(cookie);
  if (!decoded) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const body = await req.json();

    // Validate the required fields
    const { drawId } = body;
    if (typeof drawId !== "string") {
      return new NextResponse("Invalid body structure", { status: 400 });
    }

    // Convert drawId to a number
    const drawIdNumber = parseInt(drawId, 10);

    // Check if the conversion was successful
    if (isNaN(drawIdNumber)) {
      return new NextResponse("Invalid drawId", { status: 400 });
    }

    // Find the draw by ID
    const draw = await prisma.draw.findUnique({
      where: { id: drawIdNumber },
    });

    if (!draw) {
      return new NextResponse("Draw not found", { status: 404 });
    }

    if (draw.closeTime && draw.closeTime < new Date()) {
      return new NextResponse("Draw is closed", { status: 400 });
    }

    const newDraw = draw.drawUsers as User[];

    if (Array.isArray(draw.drawUsers) && draw.drawUsers.includes(decoded)) {
      await prisma.draw.update({
        where: { id: drawIdNumber },
        data: {
          drawUsers: {
            set: newDraw.filter((user) => user.topluyoId !== decoded.topluyoId),
          },
        },
      });
    } else if (Array.isArray(draw.drawUsers)) {
      await prisma.draw.update({
        where: { id: drawIdNumber },
        data: {
          drawUsers: {
            set: [...draw.drawUsers, decoded],
          },
        },
      });
    }
    return NextResponse.json({
      status: "success",
      message: "Draw updated successfully",
      draw: draw,
    });
  } catch (error) {
    console.error("Error parsing or validating body:", error);
    return new NextResponse("Invalid request body", { status: 400 });
  }
}
