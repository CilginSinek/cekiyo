"use client";
import Draw from "@/types/Draw";
import { useEffect, useState } from "react";
import { metadata } from "./metadata";

interface Props {
  draw: Draw;
}
export const dynamicMetadata = metadata;

export default function Page({ draw }: Props) {
  const [stateDraw, setStateDraw] = useState<Draw | null>(draw ? draw : null);

  useEffect(() => {
    if (draw) {
      setStateDraw(draw);
    }
  }, []);

  if (!stateDraw) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{stateDraw.drawName}</h1>
      <p>{stateDraw.drawDescription}</p>
    </div>
  );
}