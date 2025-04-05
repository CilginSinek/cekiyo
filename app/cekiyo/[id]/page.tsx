"use client";
import Draw from "@/types/Draw";
import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import DrawUserList from "@/components/DrawUserList";
import DrawWinners from "@/components/DrawWinners";

interface Props {
  draw: Draw;
}

export default function Page({ draw }: Props) {
  const [stateDraw, setStateDraw] = useState<Draw | null>(draw ? draw : null);
  const { user } = useUser();

  useEffect(() => {
    if (draw) {
      setStateDraw(draw);
    }
  }, []);

  if (!stateDraw) {
    return <div>Loading...</div>;
  }

  console.log(stateDraw);

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
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition duration-300">
            {stateDraw.drawUsers.some((id) => id.nick == user?.nick)
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
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-gray-800 text-white p-4 rounded-lg shadow-md">
            <DrawUserList />
          </div>
          {(user?.nick == stateDraw.drawOwner.nick ||
            stateDraw.drawStatus == "finished") && (
            <div className="flex-1 bg-gray-800 text-white p-4 rounded-lg shadow-md">
              {user?.nick == stateDraw.drawOwner.nick && (
                <button
                  disabled={stateDraw.drawStatus == "finished"}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800 transition duration-300 disabled:opacity-50"
                >
                  Çek
                </button>
              )}

              {stateDraw.drawStatus == "finished" && (
                <div className="mt-4">
                  <p className="text-lg font-semibold">Kazananlar:</p>
                  <DrawWinners winners={stateDraw.drawWinners} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
