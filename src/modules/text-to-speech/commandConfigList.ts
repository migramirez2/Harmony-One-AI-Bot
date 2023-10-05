import type { TextToSpeechParams } from '../../google-cloud/gcTextToSpeechClient'

export interface CommandConfigItem {
  command: string
  gcParams: Omit<TextToSpeechParams, 'text'>
}

export const commandConfigList: CommandConfigItem[] = [
  // English
  {
    command: 'venm',
    gcParams: {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-I'
    }
  },
  {
    command: 'venf',
    gcParams: {
      languageCode: 'en-US',
      voiceName: 'en-US-Neural2-F'
    }
  },
  // Mandarin (Chinese)
  {
    command: 'vcnm',
    gcParams: {
      languageCode: 'cmn-CN',
      voiceName: 'cmn-CN-Wavenet-B'
    }
  },
  {
    command: 'vcnf',
    gcParams: {
      languageCode: 'cmn-CN',
      voiceName: 'cmn-CN-Wavenet-A'
    }
  },
  // Cantonese (Chinese)
  {
    command: 'vhkm',
    gcParams: {
      languageCode: 'yue-Hant-HK',
      voiceName: 'yue-HK-Standard-B'
    }
  },
  {
    command: 'vhkf',
    gcParams: {
      languageCode: 'en-US',
      voiceName: 'yue-HK-Standard-A'
    }
  },
  // Spanish
  {
    command: 'vesm',
    gcParams: {
      languageCode: 'es-ES',
      voiceName: 'es-ES-Neural2-B'
    }
  },
  {
    command: 'vesf',
    gcParams: {
      languageCode: 'es-ES',
      voiceName: 'es-ES-Neural2-A'
    }
  },
  // Portuguese
  {
    command: 'vptm',
    gcParams: {
      languageCode: 'pt-PT',
      voiceName: 'pt-PT-Wavenet-C'
    }
  },
  {
    command: 'vptf',
    gcParams: {
      languageCode: 'pt-PT',
      voiceName: 'pt-PT-Wavenet-A'
    }
  },
  {
    command: 'vnlm',
    gcParams: {
      languageCode: 'nl-NL',
      ssmlGender: 'MALE',
      voiceName: 'nl-NL-Wavenet-C'
    }
  },
  {
    command: 'vnlf',
    gcParams: {
      languageCode: 'nl-NL',
      ssmlGender: 'FEMALE',
      voiceName: 'nl-NL-Wavenet-D'
    }
  },
  {
    command: 'vfrm',
    gcParams: {
      languageCode: 'fr-FR',
      ssmlGender: 'MALE',
      voiceName: 'fr-FR-Wavenet-D'
    }
  },
  {
    command: 'vfrf',
    gcParams: {
      languageCode: 'fr-FR',
      ssmlGender: 'FEMALE',
      voiceName: 'fr-FR-Wavenet-C'
    }
  },
  {
    command: 'vaff',
    gcParams: {
      languageCode: 'af-ZA',
      ssmlGender: 'FEMALE',
      voiceName: 'af-ZA-Standard-A'
    }
  },
  {
    command: 'varf',
    gcParams: {
      languageCode: 'ar-XA',
      ssmlGender: 'FEMALE',
      voiceName: 'ar-XA-Wavenet-A'
    }
  },
  {
    command: 'varm',
    gcParams: {
      languageCode: 'ar-XA',
      ssmlGender: 'MALE',
      voiceName: 'ar-XA-Wavenet-B'
    }
  },
  {
    command: 'vbgf',
    gcParams: {
      languageCode: 'bg-BG',
      ssmlGender: 'FEMALE',
      voiceName: 'bg-BG-Standard-A'
    }
  },
  {
    command: 'vbnf',
    gcParams: {
      languageCode: 'bn-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'bn-IN-Wavenet-A'
    }
  },
  {
    command: 'vbnm',
    gcParams: {
      languageCode: 'bn-IN',
      ssmlGender: 'MALE',
      voiceName: 'bn-IN-Wavenet-B'
    }
  },
  {
    command: 'vcaf',
    gcParams: {
      languageCode: 'ca-ES',
      ssmlGender: 'FEMALE',
      voiceName: 'ca-ES-Standard-A'
    }
  },
  {
    command: 'vcsf',
    gcParams: {
      languageCode: 'cs-CZ',
      ssmlGender: 'FEMALE',
      voiceName: 'cs-CZ-Wavenet-A'
    }
  },
  {
    command: 'vdaf',
    gcParams: {
      languageCode: 'da-DK',
      ssmlGender: 'FEMALE',
      voiceName: 'da-DK-Wavenet-D'
    }
  },
  {
    command: 'vdam',
    gcParams: {
      languageCode: 'da-DK',
      ssmlGender: 'MALE',
      voiceName: 'da-DK-Wavenet-C'
    }
  },
  {
    command: 'vdef',
    gcParams: {
      languageCode: 'de-DE',
      ssmlGender: 'FEMALE',
      voiceName: 'de-DE-Wavenet-F'
    }
  },
  {
    command: 'vdem',
    gcParams: {
      languageCode: 'de-DE',
      ssmlGender: 'MALE',
      voiceName: 'de-DE-Wavenet-B'
    }
  },
  {
    command: 'velf',
    gcParams: {
      languageCode: 'el-GR',
      ssmlGender: 'FEMALE',
      voiceName: 'el-GR-Wavenet-A'
    }
  },
  {
    command: 'veuf',
    gcParams: {
      languageCode: 'eu-ES',
      ssmlGender: 'FEMALE',
      voiceName: 'eu-ES-Standard-A'
    }
  },
  {
    command: 'vfif',
    gcParams: {
      languageCode: 'fi-FI',
      ssmlGender: 'FEMALE',
      voiceName: 'fi-FI-Wavenet-A'
    }
  },
  {
    command: 'vfilf',
    gcParams: {
      languageCode: 'fil-PH',
      ssmlGender: 'FEMALE',
      voiceName: 'fil-PH-Wavenet-A'
    }
  },
  {
    command: 'vfilm',
    gcParams: {
      languageCode: 'fil-PH',
      ssmlGender: 'MALE',
      voiceName: 'fil-PH-Wavenet-C'
    }
  },
  {
    command: 'vglf',
    gcParams: {
      languageCode: 'gl-ES',
      ssmlGender: 'FEMALE',
      voiceName: 'gl-ES-Standard-A'
    }
  },
  {
    command: 'vguf',
    gcParams: {
      languageCode: 'gu-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'gu-IN-Wavenet-A'
    }
  },
  {
    command: 'vgum',
    gcParams: {
      languageCode: 'gu-IN',
      ssmlGender: 'MALE',
      voiceName: 'gu-IN-Wavenet-B'
    }
  },
  {
    command: 'vhef',
    gcParams: {
      languageCode: 'he-IL',
      ssmlGender: 'FEMALE',
      voiceName: 'he-IL-Wavenet-A'
    }
  },
  {
    command: 'vhem',
    gcParams: {
      languageCode: 'he-IL',
      ssmlGender: 'MALE',
      voiceName: 'he-IL-Wavenet-D'
    }
  },
  {
    command: 'vhif',
    gcParams: {
      languageCode: 'hi-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'hi-IN-Wavenet-D'
    }
  },
  {
    command: 'vhim',
    gcParams: {
      languageCode: 'hi-IN',
      ssmlGender: 'MALE',
      voiceName: 'hi-IN-Wavenet-B'
    }
  },
  {
    command: 'vhuf',
    gcParams: {
      languageCode: 'hu-HU',
      ssmlGender: 'FEMALE',
      voiceName: 'hu-HU-Wavenet-A'
    }
  },
  {
    command: 'vidf',
    gcParams: {
      languageCode: 'id-ID',
      ssmlGender: 'FEMALE',
      voiceName: 'id-ID-Wavenet-D'
    }
  },
  {
    command: 'vidm',
    gcParams: {
      languageCode: 'id-ID',
      ssmlGender: 'MALE',
      voiceName: 'id-ID-Wavenet-B'
    }
  },
  {
    command: 'visf',
    gcParams: {
      languageCode: 'is-IS',
      ssmlGender: 'FEMALE',
      voiceName: 'is-IS-Standard-A'
    }
  },
  {
    command: 'vitf',
    gcParams: {
      languageCode: 'it-IT',
      ssmlGender: 'FEMALE',
      voiceName: 'it-IT-Wavenet-A'
    }
  },
  {
    command: 'vitm',
    gcParams: {
      languageCode: 'it-IT',
      ssmlGender: 'MALE',
      voiceName: 'it-IT-Wavenet-C'
    }
  },
  {
    command: 'vjaf',
    gcParams: {
      languageCode: 'ja-JP',
      ssmlGender: 'FEMALE',
      voiceName: 'ja-JP-Wavenet-B'
    }
  },
  {
    command: 'vjam',
    gcParams: {
      languageCode: 'ja-JP',
      ssmlGender: 'MALE',
      voiceName: 'ja-JP-Wavenet-C'
    }
  },
  {
    command: 'vknf',
    gcParams: {
      languageCode: 'kn-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'kn-IN-Wavenet-A'
    }
  },
  {
    command: 'vknm',
    gcParams: {
      languageCode: 'kn-IN',
      ssmlGender: 'MALE',
      voiceName: 'kn-IN-Wavenet-B'
    }
  },
  {
    command: 'vkof',
    gcParams: {
      languageCode: 'ko-KR',
      ssmlGender: 'FEMALE',
      voiceName: 'ko-KR-Wavenet-A'
    }
  },
  {
    command: 'vkom',
    gcParams: {
      languageCode: 'ko-KR',
      ssmlGender: 'MALE',
      voiceName: 'ko-KR-Wavenet-C'
    }
  },
  {
    command: 'vltm',
    gcParams: {
      languageCode: 'lt-LT',
      ssmlGender: 'MALE',
      voiceName: 'lt-LT-Standard-A'
    }
  },
  {
    command: 'vlvm',
    gcParams: {
      languageCode: 'lv-LV',
      ssmlGender: 'MALE',
      voiceName: 'lv-LV-Standard-A'
    }
  },
  {
    command: 'vmlf',
    gcParams: {
      languageCode: 'ml-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'ml-IN-Wavenet-A'
    }
  },
  {
    command: 'vmlm',
    gcParams: {
      languageCode: 'ml-IN',
      ssmlGender: 'MALE',
      voiceName: 'ml-IN-Wavenet-B'
    }
  },
  {
    command: 'vmrf',
    gcParams: {
      languageCode: 'mr-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'mr-IN-Wavenet-A'
    }
  },
  {
    command: 'vmrm',
    gcParams: {
      languageCode: 'mr-IN',
      ssmlGender: 'MALE',
      voiceName: 'mr-IN-Wavenet-B'
    }
  },
  {
    command: 'vmsf',
    gcParams: {
      languageCode: 'ms-MY',
      ssmlGender: 'FEMALE',
      voiceName: 'ms-MY-Wavenet-A'
    }
  },
  {
    command: 'vmsm',
    gcParams: {
      languageCode: 'ms-MY',
      ssmlGender: 'MALE',
      voiceName: 'ms-MY-Wavenet-B'
    }
  },
  {
    command: 'vnbf',
    gcParams: {
      languageCode: 'nb-NO',
      ssmlGender: 'FEMALE',
      voiceName: 'nb-NO-Wavenet-A'
    }
  },
  {
    command: 'vnbm',
    gcParams: {
      languageCode: 'nb-NO',
      ssmlGender: 'MALE',
      voiceName: 'nb-NO-Wavenet-B'
    }
  },
  {
    command: 'vpaf',
    gcParams: {
      languageCode: 'pa-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'pa-IN-Wavenet-A'
    }
  },
  {
    command: 'vpam',
    gcParams: {
      languageCode: 'pa-IN',
      ssmlGender: 'MALE',
      voiceName: 'pa-IN-Wavenet-B'
    }
  },
  {
    command: 'vplf',
    gcParams: {
      languageCode: 'pl-PL',
      ssmlGender: 'FEMALE',
      voiceName: 'pl-PL-Wavenet-A'
    }
  },
  {
    command: 'vplm',
    gcParams: {
      languageCode: 'pl-PL',
      ssmlGender: 'MALE',
      voiceName: 'pl-PL-Wavenet-B'
    }
  },
  {
    command: 'vrof',
    gcParams: {
      languageCode: 'ro-RO',
      ssmlGender: 'FEMALE',
      voiceName: 'ro-RO-Wavenet-A'
    }
  },
  {
    command: 'vruf',
    gcParams: {
      languageCode: 'ru-RU',
      ssmlGender: 'FEMALE',
      voiceName: 'ru-RU-Wavenet-E'
    }
  },
  {
    command: 'vrum',
    gcParams: {
      languageCode: 'ru-RU',
      ssmlGender: 'MALE',
      voiceName: 'ru-RU-Wavenet-B'
    }
  },
  {
    command: 'vskf',
    gcParams: {
      languageCode: 'sk-SK',
      ssmlGender: 'FEMALE',
      voiceName: 'sk-SK-Wavenet-A'
    }
  },
  {
    command: 'vsrf',
    gcParams: {
      languageCode: 'sr-RS',
      ssmlGender: 'FEMALE',
      voiceName: 'sr-RS-Standard-A'
    }
  },
  {
    command: 'vsvf',
    gcParams: {
      languageCode: 'sv-SE',
      ssmlGender: 'FEMALE',
      voiceName: 'sv-SE-Wavenet-B'
    }
  },
  {
    command: 'vsvm',
    gcParams: {
      languageCode: 'sv-SE',
      ssmlGender: 'MALE',
      voiceName: 'sv-SE-Wavenet-C'
    }
  },
  {
    command: 'vtaf',
    gcParams: {
      languageCode: 'ta-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'ta-IN-Wavenet-A'
    }
  },
  {
    command: 'vtam',
    gcParams: {
      languageCode: 'ta-IN',
      ssmlGender: 'MALE',
      voiceName: 'ta-IN-Wavenet-B'
    }
  },
  {
    command: 'vtef',
    gcParams: {
      languageCode: 'te-IN',
      ssmlGender: 'FEMALE',
      voiceName: 'te-IN-Standard-A'
    }
  },
  {
    command: 'vtem',
    gcParams: {
      languageCode: 'te-IN',
      ssmlGender: 'MALE',
      voiceName: 'te-IN-Standard-B'
    }
  },
  {
    command: 'vthf',
    gcParams: {
      languageCode: 'th-TH',
      ssmlGender: 'FEMALE',
      voiceName: 'th-TH-Standard-A'
    }
  },
  {
    command: 'vtrf',
    gcParams: {
      languageCode: 'tr-TR',
      ssmlGender: 'FEMALE',
      voiceName: 'tr-TR-Wavenet-C'
    }
  },
  {
    command: 'vtrm',
    gcParams: {
      languageCode: 'tr-TR',
      ssmlGender: 'MALE',
      voiceName: 'tr-TR-Wavenet-B'
    }
  },
  {
    command: 'vukf',
    gcParams: {
      languageCode: 'uk-UA',
      ssmlGender: 'FEMALE',
      voiceName: 'uk-UA-Wavenet-A'
    }
  },
  {
    command: 'vvif',
    gcParams: {
      languageCode: 'vi-VN',
      ssmlGender: 'FEMALE',
      voiceName: 'vi-VN-Wavenet-A'
    }
  },
  {
    command: 'vvim',
    gcParams: {
      languageCode: 'vi-VN',
      ssmlGender: 'MALE',
      voiceName: 'vi-VN-Wavenet-B'
    }
  },
  {
    command: 'vyuef',
    gcParams: {
      languageCode: 'yue-HK',
      ssmlGender: 'FEMALE',
      voiceName: 'yue-HK-Standard-A'
    }
  },
  {
    command: 'vyuem',
    gcParams: {
      languageCode: 'yue-HK',
      ssmlGender: 'MALE',
      voiceName: 'yue-HK-Standard-B'
    }
  }

]

export function getCommandList (): string[] { return commandConfigList.map(item => item.command) }
export function getConfigByCommand (command: string): CommandConfigItem | undefined {
  return commandConfigList.find((item) => item.command === command)
}
