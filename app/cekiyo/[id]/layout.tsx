"use server";
import React from "react";
import Draw from "@/types/Draw";
import User from "@/types/User";
import Page from "./page";
import prisma from "@/utils/prisma";
import DrawNotFound from "@/components/DrawNotFound";

export default async function RootLayout({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const myparams = await params;

  const user: User = {
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banlıyorum herkesi",
    isOwnerMode: true,
  };

  const rawData = await prisma.draw.findUnique({
    where: { id: parseInt(myparams.id) }
  })
  if(!rawData) {
    return <DrawNotFound/>;
  }

  const myDraw = rawData as Draw;

  return (
    <Page draw={myDraw} />
  );
}