import { Menu } from "@grammyjs/menu";
import { imageGenMainMenu } from "./modules/image-gen/pages/main";
import { BotContext } from "./modules/types";

export const mainMenu = new Menu<BotContext>("main-menu") //<MyContext>
  .text("One Wallet", (ctx) => ctx.reply("Menu to be define"))
  .row()
  .text("Voice Memo", (ctx) => ctx.reply("Menu to be define"))
  .row()
  .text("QR Generation", (ctx) => ctx.reply("Menu to be define"))
  .row()
  .submenu("Image Generation AI", "image-gen-main")

mainMenu.register(imageGenMainMenu);
