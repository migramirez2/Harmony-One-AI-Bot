import { SDNodeApi } from "./sd-node-api";
import config from "../../config";
import { InlineKeyboard, InputFile } from "grammy";
import { OnMessageContext, OnCallBackQueryData } from "../types";
import { sleep, uuidv4 } from "./utils";
import { showcasePrompts } from './showcase';

enum SupportedCommands {
    IMAGE = 'image',
    IMAGES = 'images',
    // SHOWCASE = 'image_example',
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
    private showcaseCount = 0;

    constructor() {
        this.sdNodeApi = new SDNodeApi({ apiUrl: config.stableDiffusionHost });
    }

    public isSupportedEvent(ctx: OnMessageContext | OnCallBackQueryData): boolean {
        const hasCommand = ctx.hasCommand(Object.values(SupportedCommands));

        const hasCallbackQuery = this.isSupportedCallbackQuery(ctx);

        return hasCallbackQuery || hasCommand;
    }

    public getEstimatedPrice(ctx: any) {
        return 1.5;
    }

    public isSupportedCallbackQuery(ctx: OnMessageContext | OnCallBackQueryData): boolean {
        if (!ctx.callbackQuery?.data) {
            return false;
        }

        const [sessionId] = ctx.callbackQuery.data.split('_');

        return !!this.sessions.find(s => s.id === sessionId);
    }

    public async onEvent(ctx: OnMessageContext | OnCallBackQueryData) {
        if (!this.isSupportedEvent(ctx)) {
            console.log(`### unsupported command ${ctx.message?.text}`);
            throw new Error('Unsupported command')
        }

        if (ctx.hasCommand(SupportedCommands.IMAGE)) {
            this.onImageCmd(ctx);
            return;
        }

        if (ctx.hasCommand(SupportedCommands.IMAGES)) {
            this.onImagesCmd(ctx);
            return;
        }


        // if (ctx.hasCommand(SupportedCommands.SHOWCASE)) {
        //     this.onShowcaseCmd(ctx);
        //     return;
        // }

        if (this.isSupportedCallbackQuery(ctx)) {
            this.onImgSelected(ctx);
            return;
        }

        console.log(`### unsupported command`);
        ctx.reply('### unsupported command');
    }

    onImageCmd = async (ctx: OnMessageContext | OnCallBackQueryData) => {
        const uuid = uuidv4()

        try {
            const prompt: any = ctx.match;

            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!prompt) {
                ctx.reply(`${author} please add prompt to your message`);
                throw new Error('Wrong prompts');
                return;
            }

            this.queue.push(uuid);

            let idx = this.queue.findIndex(v => v === uuid);

            if(idx !== 0) {
                ctx.reply(`${author} you are the ${idx + 1}/${this.queue.length}. Please wait about ${idx * 30} sec`);
            }

            // waiting queue
            while (idx !== 0) {
                await sleep(3000 * this.queue.findIndex(v => v === uuid));

                idx = this.queue.findIndex(v => v === uuid);
            }

            ctx.reply(`${author} starting to generate your image`);

            const imageBuffer = await this.sdNodeApi.generateImage(prompt);

            await ctx.replyWithPhoto(new InputFile(imageBuffer));

            await ctx.reply(`/image ${prompt}`);
        } catch (e: any) {
            console.log(e);
            this.queue = this.queue.filter(v => v !== uuid);
            
            ctx.reply(`Error: something went wrong...`);
            
            throw new Error(e?.message);
        }

        this.queue = this.queue.filter(v => v !== uuid);
    }

    onImagesCmd = async (ctx: OnMessageContext | OnCallBackQueryData) => {
        const uuid = uuidv4();

        try {
            const prompt: any = ctx.match;

            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!prompt) {
                ctx.reply(`${author} please add prompt to your message`);

                throw new Error('Wrong prompts');
                return;
            }

            this.queue.push(uuid);

            let idx = this.queue.findIndex(v => v === uuid);

            if(idx !== 0) {
                ctx.reply(`${author} you are the ${idx + 1}/${this.queue.length}. Please wait about ${idx * 30} sec`);
            }

            // waiting queue
            while (idx !== 0) {
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
                all_seeds: res.all_seeds,
            }

            this.sessions.push(newSession);

            await ctx.replyWithMediaGroup(
                res.images.map((img, idx) => ({
                    type: "photo",
                    media: new InputFile(img),
                    caption: String(idx + 1),
                }))
            )

            await ctx.reply("Please choose 1 of 4 images for next high quality generation", {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard()
                    .text("1", `${newSession.id}_1`)
                    .text("2", `${newSession.id}_2`)
                    .text("3", `${newSession.id}_3`)
                    .text("4", `${newSession.id}_4`)
                    .row()
            });
        } catch (e: any) {
            console.log(e);
            this.queue = this.queue.filter(v => v !== uuid);

            ctx.reply(`Error: something went wrong...`);

            throw new Error(e?.message);
        }

        this.queue = this.queue.filter(v => v !== uuid);
    }

    async onImgSelected(ctx: OnMessageContext | OnCallBackQueryData): Promise<any> {
        try {
            const authorObj = await ctx.getAuthor();
            const author = `@${authorObj.user.username}`;

            if (!ctx.callbackQuery?.data) {
                console.log('wrong callbackQuery')
                throw new Error('Wrong callbackQuery');
                return;
            }

            const [sessionId, imageNumber] = ctx.callbackQuery.data.split('_');

            if (!sessionId || !imageNumber) {
                throw new Error('Wrong params');
                return;
            }

            const session = this.sessions.find(s => s.id === sessionId);

            if (!session || session.author !== author) {
                throw new Error('Wrong author');
                return;
            }

            ctx.reply(`${author} starting to generate your image ${imageNumber} in high quality`);

            const imageBuffer = await this.sdNodeApi.generateImageFull(session.prompt, +session.all_seeds[+imageNumber - 1]);

            await ctx.replyWithPhoto(new InputFile(imageBuffer));

            await ctx.reply(`/image ${session.prompt}`);
        } catch (e: any) {
            console.log(e);
            ctx.reply(`Error: something went wrong...`);

            throw new Error(e?.message);
        }
    }

    onShowcaseCmd = async (ctx: OnMessageContext | OnCallBackQueryData) => {
        const uuid = uuidv4()

        try {
            if(this.showcaseCount >= showcasePrompts.length) {
                this.showcaseCount = 0;
            }

            const prompt = showcasePrompts[this.showcaseCount++];

            const imageBuffer = await this.sdNodeApi.generateImage(prompt);

            await ctx.replyWithPhoto(new InputFile(imageBuffer));

            await ctx.reply(`/image ${prompt}`);
        } catch (e: any) {
            console.log(e);
            await ctx.reply(`Error: something went wrong...`);

            throw new Error(e?.message);
        }
    }
}


// ng_deepnegative_v1_75t, (badhandv4), (worst quality:2), (low quality:2), (normal quality:2), lowres, bad anatomy, bad hands, ((monochrome)), ((grayscale)) watermark, (moles:2)
