import { decoderToken } from "@/utils/handler";
import prisma from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

//* runs for answer of draws
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
    const body = await req.json();

    // Validate the required fields
    const { draw_id, count } = body;
    if (typeof draw_id !== "number" || typeof count !== "number" || count < 1) {
      return new NextResponse("Invalid body structure", { status: 400 });
    }
    // Check if the draw exists
    const draw = await prisma.draw.findUnique({
      where: {
        id: draw_id,
      },
    });
    if (!draw) {
      return new NextResponse("Draw not found", { status: 404 });
    }

    // Check if the draw is finished
    if (draw.drawStatus === "finished") {
      return new NextResponse("Draw is already finished", { status: 400 });
    }

    // start draw
    const drawUsers = draw.drawUsers;
    if (Array.isArray(drawUsers) && drawUsers.length === 0) {
      return new NextResponse("No users in the draw", { status: 400 });
    }
    if (Array.isArray(drawUsers) && drawUsers.length > count) {
      const winners = [];

      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * drawUsers.length);
        const winner = drawUsers[randomIndex];
        winners.push(winner);
        drawUsers.splice(randomIndex, 1);
      }

      const updatedDraw = await prisma.draw.update({
        where: {
          id: draw_id,
        },
        data: {
          drawWinners: winners,
          drawStatus: "finished",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        status: "success",
        winners: winners,
        draw: updatedDraw,
        message: "Draw updated successfully",
      });
    } else if (Array.isArray(drawUsers) && drawUsers.length === count) {
      const winners = drawUsers.sort(() => Math.random() - Math.random());

      const updatedDraw = await prisma.draw.update({
        where: {
          id: draw_id,
        },
        data: {
          drawWinners: winners,
          drawStatus: "finished",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        status: "success",
        winners: winners,
        draw: updatedDraw,
        message: "Draw updated successfully",
      });
    } else {
      return new NextResponse("Draw users are not enough", { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return new NextResponse("Invalid request body", { status: 400 });
  }
}
