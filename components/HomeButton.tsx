"use client"
import { useRouter } from "next/navigation";

export default function HomeButton() {
    const router = useRouter();
    return (<button onClick={()=>{
        router.push("/cekiyo");
    }}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
    >
        Ana Sayfa
    </button>);
}