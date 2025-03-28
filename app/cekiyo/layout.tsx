"use server";
import React from "react";
import prisma from "@/utils/prisma";
import Draw from "@/types/Draw";
import Page from "./page"; // Page bileşenini içe aktar
import DrawList from "@/components/DrawList";
import User from "@/types/User";

export default async function CekiyoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const getActiveDraws = async (): Promise<Draw[]> => {
    try {
      const draws: Draw[] = await prisma.draw.findMany({
        where: {
          drawStatus: "open",
        },
      });

      return draws.map((draw: Draw) => ({
        ...draw,
        drawDate: new Date(draw.drawDate),
        createdAt: new Date(draw.createdAt),
        updatedAt: new Date(draw.updatedAt),
        closeTime: draw.closeTime ? new Date(draw.closeTime) : undefined,
      }));
    } catch (e) {
      console.error(e);
      return [] as Draw[];
    }
  };

  const getOldDraws = async (): Promise<Draw[]> => {
    try {
      const draws: Draw[] = await prisma.draw.findMany({
        where: {
          NOT: {
            drawStatus: "open",
          },
        },
      });

      return draws.map((draw: Draw) => ({
        ...draw,
        drawDate: new Date(draw.drawDate),
        createdAt: new Date(draw.createdAt),
        updatedAt: new Date(draw.updatedAt),
        closeTime: draw.closeTime ? new Date(draw.closeTime) : undefined,
      }));
    } catch (e) {
      console.error(e);
      return [] as Draw[];
    }
  };

  const activeDraws = await getActiveDraws();
  const oldDraws = await getOldDraws();
  const myuser: User = {
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banl\u0131yorum herkesi",
    isOwnerMode: true,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
    <aside className="w-1/4 bg-white shadow-md p-4">
      <DrawList
        name="Aktif Çekilişler"
        drawList={activeDraws}
        user={myuser}
      />
      <DrawList
        name="Kapanmış Çekilişler"
        drawList={oldDraws}
        user={myuser}
      />
    </aside>
    <section className="flex-1 p-6 bg-gray-50">
      {children}
    </section>
  </div>
  )
}
