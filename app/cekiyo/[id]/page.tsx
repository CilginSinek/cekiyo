"use server";
import React from "react";
import Draw from "@/types/Draw";
import prisma from "@/utils/prisma";
import DrawNotFound from "@/components/DrawNotFound";
import ClientPage from "./ClientPage";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = (await params).id;
  const drawId = parseInt(id, 10);

  if (isNaN(drawId)) {
    return <DrawNotFound />;
  }

  const rawData = await prisma.draw.findUnique({
    where: { id: drawId },
  });

  if (!rawData) {
    return <DrawNotFound />;
  }

  const draw = rawData as Draw;
  return <ClientPage draw={draw} />
}
