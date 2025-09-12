import { Message } from "whatsapp-web.js";
import getRandomHebrewWord from "../api/getWord.js";
import { hangmanStages } from "./textUtils.js";

export class HangManGame {
    public word: string;
    public guessedLetters: string[];
    public maxAttempts: number;
    public attemptsLeft: number;
    public gameOver: boolean;

    constructor() {
        this.word = "";
        this.guessedLetters = [];
        this.maxAttempts = 10;
        this.attemptsLeft = this.maxAttempts;
        this.gameOver = true;
    }

    public async startNewGame(message: Message, subject: string, maxAttempts: number = 10) {
        if (!this.gameOver) {
            message.reply(
                "המשחק הקודם לא הסתיים. השתמש !stop כדי לעצור אותו."
            );
            return;
        }

        this.word = await getRandomHebrewWord(subject);
        this.guessedLetters = [];
        this.maxAttempts = Math.min(maxAttempts, hangmanStages.length - 1);
        this.attemptsLeft = this.maxAttempts;
        this.gameOver = false;

        message.reply("משחק התחיל! הנה המילה:");
        message.reply(this.getMaskedWord());
        message.reply(hangmanStages[0]);
    }

    public surrender(message: Message) {
        if (this.gameOver) {
            message.reply("אין משחק פעיל כרגע. השתמש !play כדי להתחיל.");
            return;
        }
        this.gameOver = true;
        message.reply(`ויתרת 💥😞 המילה הנכונה הייתה: ${this.word}`);
    }

    public guessLetter(message: Message, letter: string) {
        if (this.gameOver) {
            message.reply("אין משחק פעיל כרגע. השתמש !play כדי להתחיל.");
            return;
        }

        letter = letter.trim();
        if (!letter.match(/^[א-ת]$/)) {
            message.reply("אנא הזן אות עברית חוקית אחת.");
            return;
        }

        if (this.guessedLetters.includes(letter)) {
            message.reply(`כבר ניחשת את האות "${letter}"`);
            return;
        }

        this.guessedLetters.push(letter);

        if (!this.word.includes(letter)) {
            this.attemptsLeft -= 1;
        }

        if (this.word.split("").every(l => this.guessedLetters.includes(l))) {
            this.gameOver = true;
            message.reply(`ניצחת! המילה היא: ${this.word}`);
            return;
        }

        if (this.attemptsLeft <= 0) {
            this.gameOver = true;
            message.reply(`הפסדת! המילה הייתה: ${this.word}`);
            return;
        }

        const stageIndex = this.maxAttempts - this.attemptsLeft;
        const hangmanDrawing = hangmanStages[Math.min(stageIndex, hangmanStages.length - 1)];

        message.reply(
            hangmanDrawing + "\n\n" +
            `ניחושים: ${this.guessedLetters.join(", ")}\n` +
            `מילה: ${this.getMaskedWord()}\n` +
            `ניסיונות שנותרו: ${this.attemptsLeft}`
        );
    }

    public getMaskedWord() {
        return this.word
            .split("")
            .map(l => (this.guessedLetters.includes(l) ? l : "_"))
            .join(" ");
    }
}

export default HangManGame;