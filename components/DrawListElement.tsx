import { JSX } from "react";
import Draw from "@/types/Draw";
import User from "@/types/User";

interface DrawListProps {
  draw: Draw;
  user: User;
  handleDetail: (id: string) => void;
  handleSetDraw: (draw_id: string, user: User) => void;
}

export default function DrawListElement({
  draw,
  user,
  handleDetail,
  handleSetDraw,
}: DrawListProps): JSX.Element {
  return (
    <li
      key={draw.id}
      className="relative flex items-start justify-between p-4 border rounded-lg shadow-md bg-white"
    >
      <div className="relative flex-1">
        <h4 className="absolute top-0 left-0 text-sm font-bold text-gray-700">
          {draw.drawOwner.groupNick}
        </h4>
        <div className="mt-6">
          <h5 className="text-lg font-semibold text-gray-800">
            {draw.drawOwner.nick}
          </h5>
          <p className="text-sm text-gray-600">{draw.drawPrize}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-end space-y-2">
        <small className="text-xs text-gray-500">
          {"katıldı: " + draw.drawUsers.length}
        </small>
        <small className="text-xs text-gray-500 mt-auto">
          {"Oluştu: " +
            new Date(draw.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </small>

        {draw.drawStatus !== "finished" ? (
          <>
            {draw.closeTime && (
              <>
                {draw.closeTime && new Date(draw.closeTime) > new Date() ? (
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm text-gray-600">
                      Kapanış:{" "}
                      {new Date(draw.closeTime).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => handleSetDraw(draw.id, user)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      {draw.drawUsers.find(
                        (userDraw) => userDraw.nick === user.nick
                      )
                        ? "Ayrıl"
                        : "Katıl"}
                    </button>
                    <button
                      onClick={() => handleDetail(draw.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Detay
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end space-y-2">
                    <span className="text-sm text-gray-600">
                      Kapandı:{" "}
                      {new Date(draw.closeTime).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                    <button
                      disabled
                      className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded cursor-not-allowed"
                    >
                      {draw.drawUsers.find(
                        (userDraw) => userDraw.nick === user.nick
                      )
                        ? "Ayrıl"
                        : "Katıl"}
                    </button>
                    <button
                      onClick={() => handleDetail(draw.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Detay
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-end space-y-2">
            <small className="text-sm text-gray-600">
              Bitti:{" "}
              {new Date(draw.updatedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </small>
            <button
              onClick={() => handleDetail(draw.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
            >
              Detay
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
