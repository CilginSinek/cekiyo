import { JSX } from "react";
import Draw from "@/types/Draw";
import User from "@/types/User";

interface DrawListProps {
  draw: Draw;
  user: User;
  handleDetail: (id: number) => void;
  handleSetDraw: (draw_id: number, user: User) => void;
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
      className="relative flex flex-row md:flex-row items-start justify-between p-4 md:p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800"
    >
      <div className="relative flex-1 gap-4 md:gap-6 flex flex-col items-start justify-start padding-4 md:padding-6">
        <h4
          className="absolute -top-3 -left-3 text-sm font-bold text-gray-700 dark:text-gray-300 truncate"
          title={draw.drawOwner.groupName}
        >
          {draw.drawOwner.groupName}
        </h4>
        <h4
          className="absolute top-2 -left-3 text-sm font-bold text-gray-700 dark:text-gray-300 truncate"
          title={draw.drawOwner.nick}
        >
          {draw.drawOwner.nick}
        </h4>
        <div className="mt-12 flex flex-col items-start justify-start space-y-2">
          <h5 className="text-l font-semibold text-gray-800 dark:text-gray-100">
            {draw.drawName}
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
            Ödül:{draw.drawPrize}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-end space-y-2 mt-4 mb-4 w-full md:w-auto text-right padding-4 md:padding-6">
        <small className="absolute top-1 right-5 text-xs text-gray-500 dark:text-gray-400">
          {"katıldı: " + draw.drawUsers.length}
        </small>
        <small className="absolute bottom-0 right-5 text-xs text-gray-500 dark:text-gray-400">
          {"Oluştu: " +
            new Date(draw.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </small>

        <div className="flex flex-col items-end space-y-2">
          <small className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(draw.updatedAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </small>
          {draw.drawStatus !== "finished" && (
            <button
              onClick={() => handleSetDraw(draw.id, user)}
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
              {draw.drawUsers.find((userDraw) => userDraw.nick === user.nick)
                ? "Ayrıl"
                : "Katıl"}
            </button>
          )}
          <button
            onClick={() => handleDetail(draw.id)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 cursor-pointer"
          >
            Detay
          </button>
        </div>
      </div>
    </li>
  );
}
