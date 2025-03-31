import jwt from "jsonwebtoken";
import User from "@/types/User";

export const decoderToken = (token: string):User|null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const myUser: User = {
      topluyoId: decoded.topluyoId,
      nick: decoded.nick,
      image: decoded.image,
      isOwnerMode: decoded.isOwnerMode,
      groupName: decoded.groupName,
      groupNick: decoded.groupNick,
    }
    return myUser;
  } catch (error) {
    return null;
  }
}
