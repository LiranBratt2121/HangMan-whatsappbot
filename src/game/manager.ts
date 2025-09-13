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

/**
 * Only can be used by the bot owner to clean up the chat.
 * Deletes all messages sent by the bot in the last 100 messages.
 */
export async function handleChatTemination(message: Message) {
    await message.reply("מנתק את הבוט... 👋");
    const chat = await message.getChat();

    console.log("Terminating bot and cleaning up bot messages...");
    const messages = await chat.fetchMessages({ limit: 100 });
    console.log("Fetched messages:", messages.length);

    for (const msg of messages) {
        if (msg.fromMe) {
            try {
                console.log("Deleting bot msg:", msg.id._serialized, "|", msg.body);
                await msg.delete(true);
            } catch (error) {
                console.error("❌ Failed to delete:", msg.id._serialized, error);
            }
        } else {
            console.log("Skipping non-bot msg:", msg.id._serialized);
        }
    }
}

