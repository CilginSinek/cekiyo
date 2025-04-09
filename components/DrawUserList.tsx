import User from "@/types/User";
import { RefObject, useEffect, useRef, useState } from "react";

interface DrawUserListProps {
  users: User[];
  winners: User[];
}

function cleanList(itemRefs: RefObject<(HTMLDivElement | null)[]>) {
  itemRefs.current.forEach((item) => {
    if (item) item.classList.remove("bg-yellow-500", "bg-green-500");
    if (item) item.classList.add("bg-gray-800");
  });
}

export default function DrawUserList({ users, winners }: DrawUserListProps) {
  const [copyUsers, setCopyUsers] = useState<User[]>(users);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (winners.length === 0 || copyUsers.length === 0) return;

    let currentWinnerIndex = 0;

    const runAnimatedScroll = async () => {
      while (currentWinnerIndex < winners.length) {
        const winner = winners[currentWinnerIndex];
        const indexInList = copyUsers.findIndex((u) => u.nick === winner.nick);

        if (indexInList === -1) {
          currentWinnerIndex++;
          continue;
        }

        const newTarget = indexInList;
        let currentIndex = 0;

        let speed = 100;
        const maxSpeed = 300;
        const speedIncrement = 5;

        const animate = () => {
          // Tüm itemlerin arkaplanını sıfırla
          cleanList(itemRefs);

          // Scroll pozisyonu
          const currentItem = itemRefs.current[currentIndex - 1];
          if (currentItem && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: currentItem.offsetTop - scrollContainerRef.current.offsetTop,
              behavior: "auto",
            });
          }

          // Şu anki itemi sarı yap
          if (itemRefs.current[currentIndex]) {
            itemRefs.current[currentIndex]!.classList.remove("bg-gray-800");
            itemRefs.current[currentIndex]!.classList.add("bg-gray-700");
          }

          // Animasyon bittiğinde
          if (currentIndex === newTarget) {
            if (itemRefs.current[currentIndex]) {
              itemRefs.current[currentIndex]!.classList.remove("bg-gray-700");
              itemRefs.current[currentIndex]!.classList.add("bg-green-500");
            }

            setTimeout(() => {
              console.log(`Kazanan: ${winner.nick}`);
              if (currentWinnerIndex < winners.length - 1) {
                setCopyUsers((prev) => {
                  const newList = [...prev];
                  newList.splice(indexInList, 1);
                  return newList;
                });
              }

              setTimeout(() => {
                currentWinnerIndex++;
                runAnimatedScroll();
              }, 1000);
            }, 1000);

            return;
          }

          currentIndex++;

          if (currentIndex > newTarget / 2) {
            speed += speedIncrement;
            speed = Math.min(speed, maxSpeed);
          }

          setTimeout(animate, speed);
        };

        animate();
        break;
      }
    };

    runAnimatedScroll();
  }, [winners]);

  return (
    <div
      id="draw-user-whaller"
      className="flex flex-col gap-4 bg-gray-900 p-4 rounded-lg shadow-md overflow-y-auto h-104 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
      ref={scrollContainerRef}
    >
      {copyUsers.map((user, index) => (
        <div key={index}>
          <div
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg mb-2 shadow-md hover:bg-gray-700 transition duration-200 ease-in-out cursor-pointer group border border-gray-700"
          >
            <div className="flex items-center">
              <img
                src={user.image}
                alt={user.nick}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="text-lg font-semibold truncate max-w-[150px] cursor-pointer" >{user.nick}</span>
              {/*TODO add href for user */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
