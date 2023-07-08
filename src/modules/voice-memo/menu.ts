import { Menu } from "@grammyjs/menu";
import { BotContext } from "../types";
import { MenuIds } from "../../constants";

const helpText = `🎙 *VoiceMemo Help*

I can create a short summary from a voice message.

Simply send me a voice message or forward a voice message from a private chat or group.`;

export const voiceMemoMenu = new Menu<BotContext>(MenuIds.VOICE_MEMO_MAIN)
  .text("Help", (ctx) => {
    ctx.editMessageText(helpText, {parse_mode: 'Markdown', disable_web_page_preview: true}).catch((ex) => {
      console.log('### ex', ex);
    })
  })
  .row()
  .back("⬅️ Back");
