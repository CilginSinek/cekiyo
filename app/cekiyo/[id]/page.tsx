"use client";
import Draw from "@/types/Draw";
import { useEffect, useState } from "react";

interface Props {
  draw: Draw;
}

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