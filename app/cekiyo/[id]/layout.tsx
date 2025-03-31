"use server";

import React from "react";
import Draw from "@/types/Draw";
import User from "@/types/User";
import Page from "./page";

export default async function RootLayout({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const id = await Promise.resolve(params); 

  const user: User = {
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banlıyorum herkesi",
    isOwnerMode: true,
  };

  const draw: Draw = {
    id: parseInt(id.id, 10),
    drawName: `Çekiliş ${id.id}`,
    drawStatus: "open",
    drawUsers: [],
    drawWinners: [],
    drawDescription: "Bu bir çekiliş açıklamasıdır.",
    drawOwner: user,
    createdAt: new Date(),
    updatedAt: new Date(),
    drawDate: new Date(),
    closeTime: new Date(),
    drawPrize: "Ödül",
  };
  return (
    <Page draw={draw} />
  );
}