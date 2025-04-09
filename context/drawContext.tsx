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
  setOldDrawinObj: (draw: Draw) => void;
}>({
  drawsObj: null,
  setDrawsObj: () => {},
  setNewDrawinObj: () => {},
  setOldDrawinObj: () => {},
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

  const setOldDrawinObj = (draw: Draw) => {
    if (drawsObj) {
      const newOldDraws = drawsObj.oldDraws.map((d: Draw) => {
        if (d.id == draw.id) {
          return draw;
        }
        return d;
      });
      setDrawsObj({
        ...drawsObj,
        oldDraws: newOldDraws,
      });
    }
  };

  return (
    <DrawContext.Provider
      value={{ drawsObj, setDrawsObj, setNewDrawinObj, setOldDrawinObj }}
    >
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
