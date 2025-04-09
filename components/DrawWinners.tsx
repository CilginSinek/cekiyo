import User from "@/types/User";

interface DrawWinnersProps {
  winners: User[];
}

export default function DrawWinners(props: DrawWinnersProps) {
  return (
    <div className="flex flex-col gap-4 bg-gray-900 p-4 rounded-lg shadow-md overflow-y-auto h-70">
      {props.winners.map((user, index) => (
        <div key={index}>
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg mb-2 shadow-md hover:bg-gray-700 transition duration-200 ease-in-out cursor-pointer group border border-gray-700">
            <div className="flex items-center">
              <img
                src={user.image}
                alt={user.nick}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="text-lg font-semibold truncate max-w-[150px] cursor-pointer">
                {user.nick}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
