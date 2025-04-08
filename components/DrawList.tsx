"use client";
import Draw from "@/types/Draw";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DrawListElement from "./DrawListElement";
import User from "@/types/User";

interface DrawListProps {
  name: string;
  drawList: Draw[];
  user: User;
  handleSetDrawObj: (draws: Draw[], name:string) => void;
}

export default function DrawList(props: DrawListProps): JSX.Element {
  const router = useRouter();
  const [stateDrawList, setStateDrawList] = useState<Draw[]>(props.drawList);

  useEffect(() => {
    setStateDrawList(props.drawList);
  }, [props.drawList]);

  const handleDetail = (id: number) => {
    router.push(`/cekiyo/${id}`);
  };

  const handleSetDraw = (draw_id: number, user: User) => {
    fetch(`${window.location.origin}/api/regsDraw`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ draw_id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to register draw");
        }
        return response.json();
      })
      .then((data) => {
        const updatedDrawList = stateDrawList.map((draw) => {
          if (draw.id == draw_id) {
            return data.draw as Draw;
          }
          return draw;
        });
        props.handleSetDrawObj(updatedDrawList, props.name);
      })
      .catch((error) => {
        console.error("Error registering draw:", error);
      });
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg mb-0">
      <h1 className="text-2xl font-bold mb-4">{props.name}</h1>
      <ul className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {stateDrawList.map((draw, id) => (
          <DrawListElement
            key={id}
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
