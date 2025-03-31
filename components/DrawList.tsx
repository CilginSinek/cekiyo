"use client";
import Draw from "@/types/Draw";
import { Dispatch, JSX, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import DrawListElement from "./DrawListElement";
import User from "@/types/User";

interface DrawListProps {
  name: string;
  drawList: Draw[];
  user: User;
  setDrawList?: Dispatch<SetStateAction<Draw[]>>;
}

export default function DrawList(props: DrawListProps): JSX.Element {
  const router = useRouter();

  const handleDetail = (id: number) => {
    router.push(`/cekiyo/${id}`);
  };

  const handleSetDraw = (draw_id: number, user: User) => {
    fetch(`${window.location.origin}/api/DrawRegs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ draw_id, userNick: user.nick }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to register draw");
        }
        return response.json();
      })
      .then((data) => {
        const newDraw = props.drawList.find((draw) => draw.id == draw_id);
        if (newDraw) {
          if (newDraw.drawUsers.some((myuser) => myuser.nick == user.nick)) {
            newDraw.drawUsers = newDraw.drawUsers.filter(
              (myuser) => myuser.nick != user.nick
            );
          } else {
            newDraw.drawUsers.push(user);
          }
          if (props.setDrawList) {
            const newDraws = props.drawList.filter(
              (draw) => draw.id != draw_id
            );
            const updatedDraws = [...newDraws, newDraw];
            updatedDraws.sort(
              (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
            );
            props.setDrawList(updatedDraws);
          }
        }
      })
      .catch((error) => {
        console.error("Error registering draw:", error);
      });
  };
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{props.name}</h1>
      <ul className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {props.drawList.slice(0, 4).map((draw) => (
          <DrawListElement
            key={draw.id}
            draw={draw}
            handleDetail={handleDetail}
            handleSetDraw={handleSetDraw}
            user={props.user}
          />
        ))}
      </ul>
    </div>
  );
}
