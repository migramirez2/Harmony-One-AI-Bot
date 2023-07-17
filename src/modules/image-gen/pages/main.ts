import { Menu } from "@grammyjs/menu";

import { appText } from "../utils/text";
import { BotContext } from "../../types";
import { MenuIds } from "../../../constants";

export const imageGenMainMenu = new Menu<BotContext>(MenuIds.IMAGE_GEN_MAIN) //<MyContext>
  .text("Help", (ctx) => {
    ctx
      .editMessageText(appText.welcomeText, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      })
      .catch((ex) => {
        console.log("### ex", ex);
      });
  })
  .row()
  .text(
    (ctx) =>
      `${
        ctx.session.imageGen.isEnabled ? "🔴 Disable bot" : "🟢 Enable bot"
      }`,
    (ctx) => {
      ctx.session.imageGen.isEnabled = !ctx.session.imageGen.isEnabled;
      ctx.menu.update();
    }
  )
  .row()
  .text("Change default values", (ctx) =>
    ctx
      .editMessageText(appText.welcomeText, {
        parse_mode: "HTML",
        reply_markup: imageDefaultOptions,
      })
      .catch((ex) => {
        console.log("### ex", ex);
      })
  )
  .row()
  .back("Back to the Main Menu");

const imageDefaultOptions = new Menu<BotContext>(MenuIds.IMAGE_GEN_OPTIONS)
  .submenu("Change the image number", MenuIds.IMAGE_GEN_NUMBER)
  .row()
  .submenu("Change the image size", MenuIds.IMAGE_GEN_SIZE)
  .row()
  .back("Back");

const imageGenNumberOptions = new Menu<BotContext>(MenuIds.IMAGE_GEN_NUMBER)
  .text("1", (ctx) => setImageNumber(1, ctx))
  .text("2", (ctx) => setImageNumber(2, ctx))
  .text("3", (ctx) => setImageNumber(3, ctx))
  .row()
  .text("4", (ctx) => setImageNumber(4, ctx))
  .text("5", (ctx) => setImageNumber(5, ctx))
  .text("6", (ctx) => setImageNumber(6, ctx))
  .row()
  .text("7", (ctx) => setImageNumber(7, ctx))
  .text("8", (ctx) => setImageNumber(8, ctx))
  .text("9", (ctx) => setImageNumber(9, ctx))
  .row()
  .back("Back");

const imageGenSizeOptions = new Menu<BotContext>(MenuIds.IMAGE_GEN_SIZE)
  .text("256x256", (ctx) => setImageSize("256x256", ctx))
  .text("512x512", (ctx) => setImageSize("512x512", ctx))
  .text("1024x1024", (ctx) => setImageSize("1024x1024", ctx))
  .row()
  .back("Back");

function setImageNumber(n: number, ctx: any) {
  ctx.session.imageGen.numImages = n;
  ctx.reply("Images generated per prompt updated");
  ctx.menu.back();
}

function setImageSize(s: string, ctx: any) {
  ctx.session.imageGen.imgSize = s;
  ctx.reply("Images size per prompt updated");
  ctx.menu.back();
}

imageGenMainMenu.register(imageDefaultOptions);
imageDefaultOptions.register(imageGenNumberOptions);
imageDefaultOptions.register(imageGenSizeOptions);
