"use client";
import React, { useEffect, useState } from "react";
import Draw from "@/types/Draw";
import DrawList from "@/components/DrawList";
import HomeButton from "@/components/HomeButton";
import { useUser } from "@/context/userContext";
import { useDraws } from "@/context/drawContext";

interface allDraws {
  oldDraws: Draw[];
  activeDraws: Draw[];
}

export default function CekiyoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useUser();
  const { drawsObj, setDrawsObj } = useDraws();
  const [allDraws, setAllDraws] = useState<allDraws>({
    activeDraws: [],
    oldDraws: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSetDraws = (newDraws: Draw[], name: string)=>{
    if(name == "Aktif Çekilişler"){
      setDrawsObj({...allDraws, activeDraws: newDraws});
    }else{
      setDrawsObj({...allDraws, oldDraws: newDraws});
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${window.location.origin}/api/regsDraw`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to fetch draws");
        }
      })
      .then((data) => {
        setDrawsObj(data.draws);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (drawsObj) {
      setAllDraws(drawsObj);
    }
  }, [drawsObj]);

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-full md:w-100 bg-white dark:bg-gray-800 shadow-md space-y-6">
        <HomeButton />
        <DrawList
          name="Aktif Çekilişler"
          drawList={allDraws.activeDraws}
          handleSetDrawObj={handleSetDraws}
          user={user}
        />
        <DrawList
          name="Kapanmış Çekilişler"
          drawList={allDraws.oldDraws}
          handleSetDrawObj={handleSetDraws}
          user={user}
        />
      </aside>
      <section className="flex-1 bg-gray-50 dark:bg-gray-700">
        {children}
      </section>
    </div>
  );
}
