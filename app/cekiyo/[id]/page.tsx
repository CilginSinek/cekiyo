"use client";
import { useParams } from "next/navigation";
import Draw from "@/types/Draw";
import User from "@/types/User";

export default function Page() {
  const { id } = useParams();

  const user: User = {
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banl\u0131yorum herkesi",
    isOwnerMode: true,
  };
  // Örnek veri
  const draw: Draw = {
    id: id as string,
    drawName: `Çekiliş ${id}`,
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
    <div>
      <h1>{draw.drawName}</h1>
      <p>{draw.drawDescription}</p>
    </div>
  );
}