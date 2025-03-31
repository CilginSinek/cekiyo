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
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);