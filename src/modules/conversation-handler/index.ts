import config from "../../config";
import {
  OnMessageContext,
  OnCallBackQueryData,
  BotContext,
  BotConversation,
} from "../types";

import {
  getChatModel,
  getChatModelPrice,
  getTokenNumber,
} from "../open-ai/api/openAi";

import { Logger, pino } from "pino";
import { Bot } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { conversationGpt } from "./conversationGpt";
import { conversationDomainName } from "./conversationCountry";
import { promptGen } from "../open-ai/controller";

enum SupportedCommands {
  CHAT = "chat",
  RENT = "rent",
}

export class ConversationHandler {
  private logger: Logger;
  private bot: Bot<BotContext>;

  constructor(bot: Bot<BotContext>) {
    this.logger = pino({
      name: "conversation-handler",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });
    this.bot = bot;
    this.bot.use(conversations());
    this.bot.use(createConversation(this.botConversation));
  }

  private async botConversation(
    conversation: BotConversation,
    ctx: BotContext
  ) {
    if (ctx.hasCommand("chat")) {
      await conversationGpt(conversation, ctx);
    } else if (ctx.hasCommand("rent")) {
      await conversationDomainName(conversation, ctx);
    }
  }

  public isSupportedEvent(
    ctx: OnMessageContext | OnCallBackQueryData
  ): boolean {
    const hasCommand = ctx.hasCommand(Object.values(SupportedCommands));
    if (
      hasCommand &&
      !ctx.match &&
      ctx.session.openAi.chatGpt.chatConversation.length === 0
    ) {
      ctx.reply("Error: Missing prompt");
      return false;
    }
    return hasCommand;
  }

  public getEstimatedPrice(ctx: any) {
    const prompts = ctx.match;
    if (!prompts) {
      return 0;
    }
    if (ctx.hasCommand("chat")) {
      const baseTokens = getTokenNumber(prompts as string);
      const modelName = ctx.session.openAi.chatGpt.model;
      const model = getChatModel(modelName);
      const price = getChatModelPrice(model, true, baseTokens); //cents
      return ctx.chat.type !== "private" ? price * 2 : price;
    }
    return 0;
  }

  public async onEvent(ctx: OnMessageContext | OnCallBackQueryData) {
    if (!this.isSupportedEvent(ctx)) {
      this.logger.warn(`### unsupported command ${ctx.message?.text}`);
      return false;
    }

    if (ctx.hasCommand(SupportedCommands.CHAT)) {
      await this.onChat(ctx);
      return;
    }

    if (ctx.hasCommand(SupportedCommands.RENT)) {
      await ctx.conversation.enter("botConversation");
      return;
    }

    this.logger.warn(`### unsupported command`);
    ctx.reply("### unsupported command");
  }

  async onChat(ctx: OnMessageContext | OnCallBackQueryData) {
    const prompt = ctx.match;
    if (!prompt) {
      ctx.reply("Error: Missing prompt");
      return;
    }
    if (ctx.session.openAi.chatGpt.isEnabled) {
      if (ctx.chat?.type !== "private") {
        const msgId = (
          await ctx.reply(
            `Generating response using model ${ctx.session.openAi.chatGpt.model}...`
          )
        ).message_id;
        const payload = {
          conversation: [{ role: "user", content: prompt as string }],
          model: ctx.session.openAi.chatGpt.model,
        };
        const response = await promptGen(payload);
        ctx.api.editMessageText(ctx.chat?.id!, msgId, response.completion);
      } else {
        await ctx.conversation.enter("botConversation");
      }
    } else {
      ctx.reply("Bot disabled");
    }
  }
}
