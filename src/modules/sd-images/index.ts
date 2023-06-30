import { SDNodeApi } from "./sd-node-api";
import config from "../../config";
import { InlineKeyboard, InputFile } from "grammy";
import { OnMessageContext } from "../types";
import { sleep, uuidv4 } from "./utils";

enum SupportedCommands {
    IMAGE = 'image',
    IMAGES = 'images',
}

enum SESSION_STEP {
    IMAGE_SELECT = 'IMAGE_SELECT',
    IMAGE_GENERATED = 'IMAGE_GENERATED',
}

interface ISession {
    id: string;
    author: string;
    step: SESSION_STEP;
    prompt: string;
    all_seeds: string[];
}

export class SDImagesBot {
    sdNodeApi: SDNodeApi;

    private queue: string[] = [];
    private sessions: ISession[] = [];

    callbackQuerys: string[] = [];

    constructor() {
        this.sdNodeApi = new SDNodeApi({ apiUrl: config.stableDiffusionHost });
    }

    public isSupportedEvent(ctx: OnMessageContext): boolean {
        const hasCommand = ctx.hasCommand(Object.values(SupportedCommands));

        const hasCallbackQuery = ctx.hasCallbackQuery(this.callbackQuerys);

        return hasCallbackQuery || hasCommand;
    }

    public async onEvent(ctx: OnMessageContext) {
        if (!this.isSupportedEvent(ctx)) {
            console.log(`### unsupported command ${ctx.message.text}`);
            return false;
        }

        if (ctx.hasCommand(SupportedCommands.IMAGE)) {
            this.onImageCmd(ctx);
            return;
        }

        if (ctx.hasCommand(SupportedCommands.IMAGES)) {
            this.onImagesCmd(ctx);
            return;
        }

        if (ctx.hasCallbackQuery(this.callbackQuerys)) {
            this.onImgSelected(ctx);
            return;
        }

        console.log(`### unsupported command`);
        ctx.reply('### unsupported command');
    }

    onImageCmd = async (ctx: OnMessageContext) => {
        const uuid = uuidv4()

        try {
            const prompt: any = ctx.match;

            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!prompt) {
                ctx.reply(`${author} please add prompt to your message`);
                return;
            }

            this.queue.push(uuid);

            let idx = this.queue.findIndex(v => v === uuid);

            // waiting queue
            while (idx !== 0) {
                ctx.reply(`${author} you are the ${idx + 1}/${this.queue.length}. Please wait about ${idx * 3} sec`);

                await sleep(3000 * this.queue.findIndex(v => v === uuid));

                idx = this.queue.findIndex(v => v === uuid);
            }

            ctx.reply(`${author} starting to generate your image`);

            const imageBuffer = await this.sdNodeApi.generateImage(prompt);

            ctx.replyWithPhoto(new InputFile(imageBuffer));
        } catch (e: any) {
            console.log(e);
            ctx.reply(`Error: something went wrong...`);
        }

        this.queue = this.queue.filter(v => v !== uuid);
    }

    onImagesCmd = async (ctx: OnMessageContext) => {
        const uuid = uuidv4();

        try {
            const prompt: any = ctx.match;

            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!prompt) {
                ctx.reply(`${author} please add prompt to your message`);
                return;
            }

            this.queue.push(uuid);

            let idx = this.queue.findIndex(v => v === uuid);

            // waiting queue
            while (idx !== 0) {
                ctx.reply(`${author} you are the ${idx + 1}/${this.queue.length}. Please wait about ${idx * 3} sec`);

                await sleep(3000 * this.queue.findIndex(v => v === uuid));

                idx = this.queue.findIndex(v => v === uuid);
            }

            ctx.reply(`${author} starting to generate your images`);

            const res = await this.sdNodeApi.generateImagesPreviews(prompt);

            // res.images.map(img => new InputFile(Buffer.from(img, 'base64')));

            const newSession: ISession = {
                id: uuidv4(),
                author,
                prompt: String(prompt),
                step: SESSION_STEP.IMAGE_SELECT,
                all_seeds: JSON.parse(res.info).all_seeds
            }

            this.sessions.push(newSession);

            ctx.replyWithMediaGroup(
                res.images.map((img, idx) => ({
                    type: "photo",
                    media: new InputFile(Buffer.from(img, 'base64')),
                    caption: String(idx + 1),
                }))
            )

            ctx.reply("Please choose 1 of 4 images for next high quality generation", {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard()
                    .text("1", `${newSession.id}_1`)
                    .text("2", `${newSession.id}_2`)
                    .text("3", `${newSession.id}_3`)
                    .text("4", `${newSession.id}_4`)
                    .row()
            });

            [1, 2, 3, 4].forEach(
                key => this.callbackQuerys.push(`${newSession.id}_${key}`)
            );
        } catch (e: any) {
            console.log(e);
            ctx.reply(`Error: something went wrong...`);
        }

        this.queue = this.queue.filter(v => v !== uuid);
    }

    async onImgSelected(ctx: OnMessageContext): Promise<any> {
        try {
            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!ctx.callbackQuery?.data) {
                console.log('wrong callbackQuery')
                return;
            }

            const [sessionId, imageNumber] = ctx.callbackQuery.data.split('_');

            if (!sessionId || !imageNumber) {
                return;
            }

            const session = this.sessions.find(s => s.id === sessionId);

            if (!session || session.author !== author) {
                return;
            }

            ctx.reply(`${author} starting to generate your image ${imageNumber} in high quality`);

            const imageBuffer = await this.sdNodeApi.generateImageFull(session.prompt, +session.all_seeds[+imageNumber - 1]);

            ctx.replyWithPhoto(new InputFile(imageBuffer));
        } catch (e: any) {
            console.log(e);
            ctx.reply(`Error: something went wrong...`);
        }
    }
}
