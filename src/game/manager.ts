import { Message } from "whatsapp-web.js";
import HangManGame from "./hangman.js";

class HangManManager {
    private static games: Map<string, HangManGame> = new Map();

    public static getGame(chatId: string): HangManGame {
        if (!this.games.has(chatId)) {
            this.games.set(chatId, new HangManGame());
        }
        return this.games.get(chatId)!;
    }

    public static stopGame(chatId: string) {
        this.games.delete(chatId);
    }
}

const getChatId = async (message: Message) => (await message.getChat()).id.server;

export async function handleStartCommand(message: Message, subject: string, maxAttempts: number = 10) {
    const chatId = await getChatId(message);
    const game = HangManManager.getGame(chatId);
    await game.startNewGame(message, subject, maxAttempts);
}

export async function handleStopCommand(message: Message) {
    const chatId = await getChatId(message);
    HangManManager.stopGame(chatId);
    message.reply("המשחק הופסק בהצלחה.");
}

export async function handleGuessCommand(message: Message, letter: string) {
    const chatId = await getChatId(message);
    const game = HangManManager.getGame(chatId);
    game.guessLetter(message, letter);
}

export async function handleSurrenderCommand(message: Message) {
    const chatId = await getChatId(message);
    const game = HangManManager.getGame(chatId);
    game.surrender(message);
    HangManManager.stopGame(chatId);
}

