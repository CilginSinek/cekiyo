import myHandler from "@/utils/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/types/User";
import Draw from "@/types/Draw";
import prisma from "@/utils/prisma";

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const myuser = await myHandler(req, res);
  if (req.method != "POST")
    return res.status(405).json({ message: "Method not allowed" });

  if (!myuser) return res.status(401).json({ message: "Unauthorized" });

  const drawId = req.body.drawId;

  if (!drawId) return res.status(400).json({ message: "Draw id is required" });

  const draw: Draw = await prisma.draw.findUnique({
    where: {
      id: drawId,
    },
  });

  if (!draw || typeof draw == "undefined")
    return res.status(404).json({ message: "Draw not found" });

  if (draw.drawUsers.find((user) => user.topluyoId == myuser.topluyoId)) {
    const newDrawUsers = (draw.drawUsers = draw.drawUsers.filter(
      (user) => user.topluyoId != myuser.topluyoId
    ));
    await prisma.draw
      .update({
        where: {
          id: drawId,
        },
        data: {
          drawUsers: newDrawUsers,
        },
      })
      .catch((e: string) => {
        return res
          .status(500)
          .json({ message: "Error adding user to draw \n" + e });
      });
    return res.status(200).json({ message: "User removed from draw" });
  } else {
    const newDrawUsers = [...draw.drawUsers, myuser];
    await prisma.draw
      .update({
        where: {
          id: drawId,
        },
        data: {
          drawUsers: newDrawUsers,
        },
      })
      .catch((e: string) => {
        return res
          .status(500)
          .json({ message: "Error adding user to draw \n" + e });
      });
    return res.status(200).json({ message: "User added to draw" });
  }
}
