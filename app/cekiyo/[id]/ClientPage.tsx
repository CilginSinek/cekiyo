"use client";
import Draw from "@/types/Draw";
import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import DrawUserList from "@/components/DrawUserList";
import DrawWinners from "@/components/DrawWinners";
import { useDraws } from "@/context/drawContext";

interface Props {
  draw: Draw;
}

export default function Page({ draw }: Props) {
  const [stateDraw, setStateDraw] = useState<Draw | null>(draw || null);
  const [winnerLength, setWinnerLength] = useState<number>(
    draw.drawWinners.length || 1
  );
  const { user } = useUser();
  const {setOldDrawinObj} = useDraws();

  useEffect(() => {
    if (draw) {
      setStateDraw(draw);
    }
  }, [draw]);
  if (!stateDraw) {
    return <div>Loading...</div>;
  }

  const handlestartDraw = () => {
    if(draw.drawDate < new Date()) {
      fetch(`${window.location.origin}/api/setDraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          draw_id: stateDraw.id,
          count: 1,
        }),
      }).then((response)=>{
        if(!response.ok) {
          throw new Error("Failed to start draw");
        }
        return response.json();
      }).then((data)=>{
        const updatedDraw = data.draw as Draw;
        setStateDraw(updatedDraw);
        setWinnerLength(updatedDraw.drawWinners.length);
        setOldDrawinObj(updatedDraw);
      })
    }

  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Left Section */}
      <div className="flex-1 bg-gray-800 text-white p-4 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold mb-4">{stateDraw.drawName}</h3>
        <div className="mb-4">
          <h5 className="text-lg font-semibold">
            {stateDraw.drawOwner.groupName}
          </h5>
          <h5 className="text-sm text-gray-400">{stateDraw.drawOwner.nick}</h5>
          <h5 className="text-lg font-semibold mt-2">
            Ödül:{stateDraw.drawPrize}
          </h5>
          <h5 className="text-sm text-gray-400">
            {stateDraw.closeTime && new Date(stateDraw.closeTime) > new Date()
              ? `Kaydın Kapanış Tarihi: ${new Date(
                  stateDraw.closeTime
                ).toLocaleString()}`
              : `Çekiliş Tarihi: ${new Date(
                  stateDraw.drawDate
                ).toLocaleString()}`}
          </h5>
        </div>
        <div className="flex justify-end mb-4">
          <button
            // onClick={() => handleSetDraw(draw.id, user)}
            className={`px-4 py-2 text-sm font-medium rounded w-full md:w-auto ${
              new Date(draw.drawDate) < new Date() ||
              (draw.closeTime && new Date(draw.closeTime) < new Date())
                ? "text-gray-400 bg-gray-200 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                : "text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
            }`}
            disabled={
              new Date(draw.drawDate) < new Date() ||
              (draw.closeTime && new Date(draw.closeTime) < new Date())
            }
          >
            {draw.drawUsers.find(
              (userDraw) => userDraw.nick === (user ? user.nick : 0)
            )
              ? "Ayrıl"
              : "Katıl"}
          </button>
        </div>
        <div className="relative mt-6">
          <textarea
            value={stateDraw.drawDescription}
            readOnly
            className="w-full h-40 p-2 bg-gray-700 text-white rounded resize-none overflow-y-auto"
          />
          <small className="absolute left-0 -top-5 text-gray-400">
            {stateDraw.closeTime &&
              new Date(stateDraw.closeTime) < new Date() && (
                <span>
                  En son değişiklik:{" "}
                  {new Date(stateDraw.closeTime).toLocaleString()}
                </span>
              )}
          </small>
          <small className="absolute right-0 -bottom-4 text-gray-400">
            {stateDraw.createdAt && (
              <span>
                Oluşturma Tarihi:{" "}
                {new Date(stateDraw.createdAt).toLocaleString()}
              </span>
            )}
          </small>
        </div>
      </div>

      {/* Right Section */}
      {stateDraw.drawUsers.length > 0 && (
        <div className="flex-1 flex flex-col lg:flex-row gap-2">
          <div className="flex-1 bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <DrawUserList
              users={stateDraw.drawUsers}
              winners={stateDraw.drawWinners}
            />
          </div>
          {(user?.nick == stateDraw.drawOwner.nick ||
            stateDraw.drawStatus == "finished") && (
            <div className="flex-1 bg-gray-800 text-white p-4 rounded-lg shadow-md">
              {user?.nick == stateDraw.drawOwner.nick && (
                <div className="flex flex-col gap-4">
                  <button
                  disabled={stateDraw.drawStatus == "finished"}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlestartDraw}
                  >
                  Çek
                  </button>
                  <div className="flex items-center gap-2">
                  <label
                    htmlFor="winnerLength"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Kazanan Sayısı:
                  </label>
                  <input
                    id="winnerLength"
                    type="number"
                    min={1}
                    max={stateDraw.drawUsers.length}
                    value={winnerLength}
                    onChange={(e) => setWinnerLength(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-gray-200 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  />
                  </div>
                </div>
              )}
              {stateDraw.drawStatus == "finished" && (                <div className="mt-4">
                  <p className="text-lg font-semibold">Kazananlar:</p>
                  <DrawWinners winners={stateDraw.drawWinners} />
                </div>)

              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}
