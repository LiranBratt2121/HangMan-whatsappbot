
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

async function getRandomHebrewWord(subject: string) {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
    });

    const model = 'gemini-2.5-flash-lite';

    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `תן מילה אקראית אחת בעברית בנושא ${subject}. החזר רק את המילה, בלי הסברים נוספים.`,
                },
            ],
        },
    ];

    const response = await ai.models.generateContent({
        model,
        contents,
    });

    if (!response.text) {
        return "Error: No response from AI";
    }

    return response.text?.trim();
}

export default getRandomHebrewWord;