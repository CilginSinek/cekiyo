"use client";

import { createContext, useContext, useState } from "react";
import Draw from "@/types/Draw";

interface drawsObjType {
  activeDraws: Draw[];
  oldDraws: Draw[];
}

const DrawContext = createContext<{
  drawsObj: drawsObjType | null;
  setDrawsObj: (drawsObj: drawsObjType | null) => void;
  setNewDrawinObj: (draw: Draw) => void;
}>({
  drawsObj: null,
  setDrawsObj: () => {},
  setNewDrawinObj: () => {},
});

export const DrawProvider = ({ children }: { children: React.ReactNode }) => {
  const [drawsObj, setDrawsObj] = useState<drawsObjType | null>(null);

  const setNewDrawinObj = (draw: Draw) => {
    if (drawsObj) {
      setDrawsObj({
        ...drawsObj,
        activeDraws: [...drawsObj.activeDraws, draw],
      });
    }
  };

  return (
    <DrawContext.Provider value={{ drawsObj, setDrawsObj, setNewDrawinObj }}>
      {children}
    </DrawContext.Provider>
  );
};

export const useDraws = () => {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useDraws must be used within a DrawProvider");
  }
  return context;
};
