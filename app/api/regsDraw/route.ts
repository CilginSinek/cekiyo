import { decoderToken } from "@/utils/handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/utils/prisma";
import User from "@/types/User";
import Draw from "@/types/Draw";

// Create a new draw
// POST /api/regsDraw
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

// Register or unregister a user for a draw
// PUT /api/regsDraw
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
    const { draw_id } = body;
    console.log(body);
    if (typeof draw_id !== "number") {
      console.log("burda");
      return new NextResponse("Invalid body structure", { status: 400 });
    }

    // Find the draw by ID
    const draw = await prisma.draw.findUnique({
      where: { id: draw_id },
    });

    if (!draw) {
      return new NextResponse("Draw not found", { status: 404 });
    }

    if (draw.closeTime) {
      if (draw.closeTime < new Date())
        return new NextResponse("Draw is closed", { status: 400 });
    }

    let newDraw = draw.drawUsers as User[];
    if (newDraw.some((user) => user.nick == decoded.nick)) {
      newDraw = newDraw.filter((user) => user.nick !== decoded.nick);
    } else {
      newDraw.push(decoded);
    }
    await prisma.draw.update({
      where: { id: draw_id },
      data: {
        drawUsers: newDraw,
      },
    });
    return NextResponse.json({
      status: "success",
      message: "Draw updated successfully",
      draw: { ...draw, drawUsers: newDraw },
    });
  } catch (error) {
    console.error("Error parsing or validating body:", error);
    return new NextResponse("Invalid request body", { status: 400 });
  }
}

// Get all draws
// GET /api/regsDraw
export async function GET(req: NextRequest) {
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
    const getActiveDraws = async (): Promise<Draw[]> => {
      try {
        const activeDraws = await prisma.draw.findMany({
          where: {
            drawStatus: "open",
            drawDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        });
        const newDraws = activeDraws as Draw[];
        return newDraws;
      } catch (e) {
        console.error(e);
        return [] as Draw[];
      }
    };

    const getOldDraws = async (): Promise<Draw[]> => {
      try {
        const draws = await prisma.draw.findMany({
          where: {
            OR: [
              {
                NOT: {
                  drawStatus: "open",
                },
              },
              {
                drawStatus: "open",
                drawDate: {
                  lt: new Date(),
                },
              },
            ],
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

        const newDraws = draws as Draw[];
        return newDraws;
      } catch (e) {
        console.error(e);
        return [] as Draw[];
      }
    };

    const activeDraws = await getActiveDraws();
    const oldDraws = await getOldDraws();
    const draws = {
      activeDraws,
      oldDraws,
    };

    return NextResponse.json({
      status: "success",
      message: "Draws fetched successfully",
      draws,
    });
  } catch (error) {
    console.error("Error fetching draws:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
