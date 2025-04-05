"use server";
import React from "react";
import prisma from "@/utils/prisma";
import Draw from "@/types/Draw";
import DrawList from "@/components/DrawList";
import User from "@/types/User";
import { cookies } from "next/headers";
import { decoderToken } from "@/utils/handler";
import HomeButton from "@/components/HomeButton";

export default async function CekiyoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const getActiveDraws = async (): Promise<Draw[]> => {
    try {
      const activeDraws = await prisma.draw.findMany({
        where: {
          drawStatus: "open",
          drawDate: {
            gte: new Date(),
          },
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
  const cookieStore = await cookies();
  const token = cookieStore.get("cekiyo-cookie")?.value || null;
  const myuser: User = decoderToken(token as string) as User;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-full md:w-100 bg-white dark:bg-gray-800 shadow-md p-4 space-y-6">
        <HomeButton />
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
      <section className="flex-1 bg-gray-50 dark:bg-gray-700">
        {children}
      </section>
    </div>
  );
}
