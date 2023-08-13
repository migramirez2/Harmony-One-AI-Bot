export enum MenuIds {
  MAIN_MENU = "main-menu",
  IMAGE_MENU = 'image-menu-main',
  QR_BOT_MAIN = "qrbot-menu-main",
  QR_BOT_CHANGE_OPTIONS = "qrbot-menu-change-options",
  QR_BOT_CHANGE_MARGIN = "qrbot-menu-change-margin",
  VOICE_MEMO_MAIN = "voice-memo-menu-main",
  SD_IMAGES_MAIN = "sd-images-menu-main",
  ONE_COUNTRY_MAIN = "one-country-main",
  IMAGE_GEN_MAIN = "image-gen-main",
  IMAGE_GEN_OPTIONS = "image-default-options",
  IMAGE_GEN_NUMBER = "image-gen-number",
  IMAGE_GEN_SIZE = "image-gen-size",
  WALLET_MAIN = "wallet-main",
  CHAT_GPT_MAIN = "chat-gpt-main",
  CHAT_GPT_MODEL = "chat-gpt-model",
}

export const menuText = {
  mainMenu: {
    backButton: '⬅️ Back',
    menuName: `
    *Main Menu*
  
🌟 Welcome to the Harmony One Bot! 🤖
  
💲 Send money to your /balance to start! 🚀
    `,
  },
  imageMenu: {
    menuName: '👨‍🎨 Image Generation',
    backButton: '⬅️ Back',
    helpText: `👨‍🎨 *Image Generation*

    1. /image <PROMPT> - Generate a stunning image 

    *Example:* \`/image Lake Como Italy, sailboats, sunset, 8k\`
    
    2. /images <PROMPT> - Generate stunning images

    *Example:* \`/images A futuristic cityscape with towering skyscrapers, flying vehicles, and a diverse population of humans and robots, painted in a concept art style inspired by Syd Mead, with a focus on detail and realism.\`
    
    `,
  
  }
}

export const commandHelpText = `
more - See this menu
/start - Get started with core uses
/help - Access all features

/ask What was the greatest invention in the 1960's?
/image a futuristic cityscape with towering skyscrapers, flying vehicles, 8k, photorealistic
Send a voice message (.m4a) to me for a transcript and summary.
/qr WEBSITE Dramatic bonfire on a remote beach, captured at the magic hour with flames dancing against the twilight sky; using a shallow depth of field

/balance - Check balance
/connect - Use walletconnect to pair external wallet
/send ADDRESS AMOUNT - Send funds from walletconnect
  

`




// /help - this help message
// /wallet - 🏦 Wallet 
// /chat - 🖋️ ChatGPT 4 
// /images - 🎨 Image Generation 
// /qr - 📷 QR Generation 
// /register - 🌐 1.country 

// *EVENTS*
// The bot will produce a summary audio transcript when uploading a voice message.