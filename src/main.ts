import { Client } from "whatsapp-web.js";
import { handleGuessCommand, handleStartCommand, handleStopCommand, handleSurrenderCommand } from "./game/manager.js";
import qrcode from "qrcode-terminal";
import { guideText } from "./game/textUtils.js";

const client = new Client({});

client.once('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("message_create", async message => {
    if (!message.body.startsWith("!")) {
        return;
    }

    const [trigger, ...args] = message.body.split(" ");

    switch (trigger.toLowerCase()) {
        case "!play":
            {
                if (args.length < 1) {
                    message.reply("נא לספק קטגוריה.");
                    return;
                }

                const subject = args[0];       // first arg = category
                const maxAttemptsArg = parseInt(args[1]); // second arg = max attempts
                const maxAttempts = !isNaN(maxAttemptsArg) ? maxAttemptsArg : 10;
                await handleStartCommand(message, subject, maxAttempts);
            }
            break;
        case "!guess":
            handleGuessCommand(message, args[0]);
            break;
        case "!surrender": 
            handleSurrenderCommand(message);
            break;
        case "!stop":
            handleStopCommand(message);
            break;
        case "!guide":
        case "!help":
            message.reply(guideText);
            break;
        default:
            message.reply("פקודה לא מוכרת. נסה !play, !guess, !stop, !surrender, !guide או !help.");
    }
});

client.initialize();