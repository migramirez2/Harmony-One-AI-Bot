import { pino } from "pino";
import { bot } from "../../../bot";
import { ChatCompletion, ChatConversation } from "../../types";
import {
  improvePrompt,
  postGenerateImg,
  alterGeneratedImg,
  chatCompilation,
} from "../api/openAi";

interface ImageGenPayload {
  chatId: number;
  prompt: string;
  numImages?: number;
  imgSize?: string;
  filePath?: string;
  model?: string;
}

interface ChatGptPayload {
  conversation?: ChatConversation[];
  model: string;
}

const logger = pino({
  name: "openAI-controller",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export const imgGen = async (data: ImageGenPayload) => {
  const { chatId, prompt, numImages, imgSize } = data;
  try {
    bot.api.sendMessage(chatId, "generating the output...");
    const imgs = await postGenerateImg(prompt, numImages, imgSize);
    imgs.map((img: any) => {
      bot.api.sendPhoto(chatId, img.url);
    });
    return true;
  } catch (e) {
    logger.error("/gen Error", e);
    bot.api.sendMessage(
      chatId,
      "There was an error while generating the image"
    );
    return false;
  }
};

export const imgGenEnhanced = async (data: ImageGenPayload) => {
  const { chatId, prompt, numImages, imgSize, model } = data;
  try {
    const upgratedPrompt = await improvePrompt(prompt,model!);
    if (upgratedPrompt) {
      bot.api.sendMessage(
        chatId,
        `The following description was added to your prompt: ${upgratedPrompt}`
      );
    }
    bot.api.sendMessage(chatId, "generating the output...");
    const imgs = await postGenerateImg(
      upgratedPrompt || prompt,
      numImages,
      imgSize
    );
    imgs.map((img: any) => {
      bot.api.sendPhoto(chatId, img.url);
    });
    return true;
  } catch (e) {
    bot.api.sendMessage(
      chatId,
      `There was an error while generating the image: ${e}`
    );
    return false;
  }
};

export const alterImg = async (data: ImageGenPayload) => {
  const { chatId, prompt, numImages, imgSize, filePath } = data;
  try {
    const imgs = await alterGeneratedImg(
      chatId,
      prompt!,
      filePath!,
      numImages!,
      imgSize!
    );
    imgs!.map((img: any) => {
      bot.api.sendPhoto(chatId, img.url);
    });
  } catch (e) {
    logger.error("/genEn Error", e);
    bot.api.sendMessage(
      chatId,
      "There was an error while generating the image"
    );
    return false;
  }
};

export const promptGen = async (data: ChatGptPayload): Promise<ChatCompletion> => {
  const { conversation, model } = data;
  try {
    const resp = await chatCompilation(conversation!, model, false);
    return resp
  } catch (e) {
    logger.error("/genEn Error", e);
    throw "There was an error while generating the image"
  }
};
