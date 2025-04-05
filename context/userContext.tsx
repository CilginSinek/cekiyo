"use client";

import { createContext, useContext, useState } from "react";
import User from "@/types/User";

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    topluyoId: "7",
    nick: "buneakpelus",
    image: "https://cdn.topluyo.com/logo/674be83b153d6.gif",
    groupNick: "ef48b6c2a2678b8e",
    groupName: "banlıyorum herkesi",
    isOwnerMode: true,
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);