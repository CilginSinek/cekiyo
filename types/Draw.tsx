import User from "./User";

type Draw = {
    id: number;
    drawName: string;
    drawUsers: User[];
    drawWinners: User[];
    drawOwner: User;
    drawStatus: "open" | "closed" | "finished";
    drawDate: Date;
    drawPrize: string;
    drawDescription: string;
    createdAt: Date;
    updatedAt: Date;
    closeTime?: Date;
}

export default Draw;