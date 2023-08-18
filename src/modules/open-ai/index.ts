import config from "../../config";
import { getCommandNamePrompt } from "../1country/utils";
import { BotPayments } from "../payment";
import { OnMessageContext, OnCallBackQueryData } from "../types";
import {
  getChatModel,
  getDalleModel,
  getDalleModelPrice,
} from "./api/openAi";
import { alterImg, imgGen, imgGenEnhanced, promptGen } from "./controller";
import { Logger, pino } from "pino";
import { appText } from "./utils/text";
import { chatService } from "../../database/services";

export const SupportedCommands = {
  // chat: {
  //   name: "chat",
  //   groupParams: ">0",
  //   privateParams: ">0",
  // },
  ask: {
    name: "ask",
    groupParams: ">0",
    privateParams: ">0",
  },
  gpt4: {
    name: "gpt4",
    groupParams: ">0",
    privateParams: ">0",
  },
  gpt: {
    name: "gpt",
    groupParams: ">0",
    privateParams: ">0",
  },
  last: {
    name: "last",
    groupParams: "=0",
    privateParams: "=0",
  },
  dalle: {
    name: "dalle",
    groupParams: ">1",
    privateParams: ">1",
  },
  genImgEn: {
    name: "genImgEn",
    groupParams: ">1",
    privateParams: ">1",
  },
  end: {
    name: "end",
    groupParams: "=0",
    privateParams: "=0",
  },
};

// const payments = new BotPayments();
export class OpenAIBot {
  private logger: Logger;
  private payments: BotPayments;

  constructor(payments: BotPayments) {
    this.logger = pino({
      name: "OpenAIBot",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });
    this.payments = payments;
    if (!config.openAi.imageGen.isEnabled) {
      this.logger.warn("DALL·E 2 Image Bot is disabled in config");
    }
  }

  public isSupportedEvent(
    ctx: OnMessageContext | OnCallBackQueryData
  ): boolean {
    const hasCommand = ctx.hasCommand(
      Object.values(SupportedCommands).map((command) => command.name)
    );
    const hasRepply = this.isSupportedImageReply(ctx);
    const hasGroupPrefix = this.hasPrefix(ctx.message?.text || "");
    if (hasGroupPrefix) {
      return true;
    }
    return hasCommand || hasRepply;
  }

  public isValidCommand(ctx: OnMessageContext | OnCallBackQueryData): boolean {
    const { commandName, prompt } = getCommandNamePrompt(
      ctx,
      SupportedCommands
    );
    const promptNumber = prompt === "" ? 0 : prompt.split(" ").length;
    if (this.isSupportedImageReply(ctx)) {
      return true;
    }
    if (!commandName) {
      const hasGroupPrefix = this.hasPrefix(ctx.message?.text || "");
      if (hasGroupPrefix && promptNumber >= 1) {
        return true;
      }
      return false;
    }
    const command = Object.values(SupportedCommands).filter((c) =>
      commandName.includes(c.name)
    )[0];
    const comparisonOperator =
      ctx.chat?.type === "private"
        ? command.privateParams[0]
        : command.groupParams[0];
    const comparisonValue = parseInt(
      ctx.chat?.type === "private"
        ? command.privateParams.slice(1)
        : command.groupParams.slice(1)
    );
    switch (comparisonOperator) {
      case ">":
        if (promptNumber >= comparisonValue) {
          return true;
        }
        break;
      case "=":
        if (promptNumber === comparisonValue) {
          return true;
        }
        break;
      default:
        break;
    }
    return false;
  }

  private hasPrefix(prompt: string): boolean {
    const prefixList = config.openAi.chatGpt.chatPrefix;
    for (let i = 0; i < prefixList.length; i++) {
      if (prompt.startsWith(prefixList[i])) {
        return true;
      }
    }
    return false;
  }

  public getEstimatedPrice(ctx: any) {
    const priceAdjustment = config.openAi.chatGpt.priceAdjustment;
    const prompts = ctx.match;
    if (this.isSupportedImageReply(ctx)) {
      const imageNumber = ctx.message?.caption || ctx.message?.text;
      const imageSize = ctx.session.openAi.imageGen.imgSize;
      const model = getDalleModel(imageSize);
      const price = getDalleModelPrice(model, true, imageNumber); //cents
      return price * priceAdjustment;
    }
    if (!prompts) {
      return 0;
    }
    // if (
    //   ctx.chat.type !== "private" &&
    //   ctx.session.openAi.chatGpt.chatConversation.length > 0
    // ) {
    //   return 0;
    // }
    if (ctx.hasCommand(SupportedCommands.dalle.name)) {
      const imageNumber = ctx.session.openAi.imageGen.numImages;
      const imageSize = ctx.session.openAi.imageGen.imgSize;
      const model = getDalleModel(imageSize);
      const price = getDalleModelPrice(model, true, imageNumber); //cents
      return price * priceAdjustment;
    }
    if (ctx.hasCommand(SupportedCommands.genImgEn.name)) {
      const imageNumber = ctx.session.openAi.imageGen.numImages;
      const imageSize = ctx.session.openAi.imageGen.imgSize;
      const chatModelName = ctx.session.openAi.chatGpt.model;
      const chatModel = getChatModel(chatModelName);
      const model = getDalleModel(imageSize);
      const price = getDalleModelPrice(
        model,
        true,
        imageNumber,
        true,
        chatModel
      ); //cents
      return price * priceAdjustment;
    }
    // if (ctx.hasCommand(SupportedCommands.ask.name)) {
    //   const baseTokens = getTokenNumber(prompts as string);
    //   const modelName = ctx.session.openAi.chatGpt.model;
    //   const model = getChatModel(modelName);
    //   const price = getChatModelPrice(model, true, baseTokens, 100); //cents
    //   return price
    // }
    return 0;
  }

  isSupportedImageReply(ctx: OnMessageContext | OnCallBackQueryData) {
    const photo = ctx.message?.photo || ctx.message?.reply_to_message?.photo;
    if (photo && ctx.session.openAi.imageGen.isEnabled) {
      const prompt = ctx.message?.caption || ctx.message?.text;
      if (prompt && !isNaN(+prompt)) {
        return true;
      }
    }
    return false;
  }

  public async onEvent(ctx: OnMessageContext | OnCallBackQueryData) {
    if (!this.isSupportedEvent(ctx)) {
      this.logger.warn(`### unsupported command ${ctx.message?.text}`);
      return false;
    }

    // if (ctx.hasCommand(SupportedCommands.chat.name)) {
    //   await this.onChat(ctx);
    //   return;
    // }

    if (ctx.hasCommand(SupportedCommands.ask.name)) {
      await this.onChat(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.gpt4.name)) {
      await this.onChat(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.gpt.name)) {
      await this.onChat(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.dalle.name)) {
      this.onGenImgCmd(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.genImgEn.name)) {
      this.onGenImgEnCmd(ctx);
      return;
    }

    if (this.isSupportedImageReply(ctx)) {
      this.onAlterImage(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.end.name)) {
      this.onEnd(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.last.name)) {
      this.onLast(ctx);
      return;
    }

    if (this.hasPrefix(ctx.message?.text || "")) {
      this.onChat(ctx);
      return;
    }

    this.logger.warn(`### unsupported command`);
    ctx.reply("### unsupported command");
  }

  onGenImgCmd = async (ctx: OnMessageContext | OnCallBackQueryData) => {
    if (ctx.session.openAi.imageGen.isEnabled) {
      const prompt = ctx.match;
      if (!prompt) {
        ctx.reply("Error: Missing prompt");
        return;
      }
      const payload = {
        chatId: ctx.chat?.id!,
        prompt: ctx.match as string,
        numImages: await ctx.session.openAi.imageGen.numImages, // lazy load
        imgSize: await ctx.session.openAi.imageGen.imgSize, // lazy load
      };
      await imgGen(payload);
    } else {
      ctx.reply("Bot disabled");
    }
  };

  onGenImgEnCmd = async (ctx: OnMessageContext | OnCallBackQueryData) => {
    if (ctx.session.openAi.imageGen.isEnabled) {
      const prompt = ctx.match;
      if (!prompt) {
        ctx.reply("Error: Missing prompt");
        return;
      }
      const payload = {
        chatId: ctx.chat?.id!,
        prompt: ctx.match as string,
        numImages: await ctx.session.openAi.imageGen.numImages,
        imgSize: await ctx.session.openAi.imageGen.imgSize,
      };
      ctx.reply("generating improved prompt...");
      await imgGenEnhanced(payload);
    } else {
      ctx.reply("Bot disabled");
    }
  };

  onAlterImage = async (ctx: OnMessageContext | OnCallBackQueryData) => {
    try {
      if (ctx.session.openAi.imageGen.isEnabled) {
        const photo =
          ctx.message?.photo || ctx.message?.reply_to_message?.photo;
        const prompt = ctx.message?.caption || ctx.message?.text;
        const file_id = photo?.pop()?.file_id; // with pop() get full image quality
        const file = await ctx.api.getFile(file_id!);
        const filePath = `${config.openAi.imageGen.telegramFileUrl}${config.telegramBotAuthToken}/${file.file_path}`;
        const payload = {
          chatId: ctx.chat?.id!,
          prompt: prompt as string,
          numImages: await ctx.session.openAi.imageGen.numImages,
          imgSize: await ctx.session.openAi.imageGen.imgSize,
          filePath: filePath,
        };
        await alterImg(payload);
      }
    } catch (e: any) {
      this.logger.error(e);
      ctx.reply("An error occurred while generating the AI edit");
    }
  };

  async onChat(ctx: OnMessageContext | OnCallBackQueryData) {
    try {
      const { prompt } = getCommandNamePrompt(ctx, SupportedCommands);
      const { chatConversation, model } = ctx.session.openAi.chatGpt;
      const accountId = this.payments.getAccountId(ctx as OnMessageContext);
      const account = await this.payments.getUserAccount(accountId);
      const addressBalance = await this.payments.getUserBalance(accountId);
      const creditsBalance = await chatService.getBalance(accountId);
      const balance = addressBalance.plus(creditsBalance);
      const balanceOne = (await this.payments.toONE(balance, false)).toFixed(2);
      if (
        +balanceOne > +config.openAi.chatGpt.minimumBalance ||
        (await this.payments.isUserInWhitelist(ctx.from.id, ctx.from.username))
      ) {
        if (prompt === "") {
          const msg =
            chatConversation.length > 0
              ? `${appText.gptLast}\n_${
                  chatConversation[chatConversation.length - 1].content
                }_`
              : appText.introText;
          await ctx.reply(msg, { parse_mode: "Markdown" });
          return;
        }

        chatConversation.push({
          role: "user",
          content: `${this.hasPrefix(prompt) ? prompt.slice(1) : prompt}.`,
        });

        const payload = {
          conversation: chatConversation!,
          model: model || config.openAi.chatGpt.model,
          ctx,
        };

        const price = await promptGen(payload);
        if (!(await this.payments.pay(ctx as OnMessageContext, price))) {
          const balanceMessage = appText.notEnoughBalance
            .replaceAll("$CREDITS", balanceOne)
            .replaceAll("$WALLET_ADDRESS", account?.address || "");
          await ctx.reply(balanceMessage, { parse_mode: "Markdown" });
        }
        ctx.chatAction = null;
      } else {
        const balanceMessage = appText.notEnoughBalance
          .replaceAll("$CREDITS", balanceOne)
          .replaceAll("$WALLET_ADDRESS", account?.address || "");
        await ctx.reply(balanceMessage, { parse_mode: "Markdown" });
      }
    } catch (error: any) {
      ctx.chatAction = null;
      this.logger.error(error.toString());
      await ctx.reply("Error handling your request");
    }
  }

  async onLast(ctx: OnMessageContext | OnCallBackQueryData) {
    if (ctx.session.openAi.chatGpt.chatConversation.length > 0) {
      const chat = ctx.session.openAi.chatGpt.chatConversation;
      ctx.reply(`${appText.gptLast}\n_${chat[chat.length - 1].content}_`, {
        parse_mode: "Markdown",
      });
    } else {
      ctx.reply(`To start a conversation please write */ask*`, {
        parse_mode: "Markdown",
      });
    }
  }

  async onEnd(ctx: OnMessageContext | OnCallBackQueryData) {
    ctx.session.openAi.chatGpt.chatConversation = [];
    const usage = ctx.session.openAi.chatGpt.usage;
    const totalPrice = ctx.session.openAi.chatGpt.price;
    const onePrice = this.payments
      .getPriceInONE(totalPrice)
      .dividedBy(10 ** 18)
      .toFixed(2);
    ctx.reply(
      `${appText.gptChatEnd} \n\n*${onePrice} ONE* Spent (${usage} tokens)`,
      {
        parse_mode: "Markdown",
      }
    );
    ctx.session.openAi.chatGpt.usage = 0;
    ctx.session.openAi.chatGpt.price = 0;
  }
}
