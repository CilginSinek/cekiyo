import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/types/User";

type ResponseData = {
  message: string;
};

export default async function myHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (!req.cookies.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET!);
    const myUser = decoded as User;
    return myUser;
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}
