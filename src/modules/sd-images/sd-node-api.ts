// import sdwebui, { Client, SamplingMethod } from 'node-sd-webui'
import { Client, SamplingMethod } from './sd-node-client'

const NEGATIVE_PROMPT = 'ugly, deformed, watermark';

export class SDNodeApi {
  client: Client;

  constructor({ apiUrl }: { apiUrl: string }) {
    this.client = new Client()
  }

  generateImage = async (prompt: string) => {
    const { images, parameters, info } = await this.client.txt2img({
      prompt,
      // negativePrompt: '(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation',
      negativePrompt: NEGATIVE_PROMPT,
      samplingMethod: SamplingMethod.DPMPlusPlus_2M_Karras,
      width: 1024,
      height: 1024,
      steps: 30,
      batchSize: 1,
    })

    return images[0]; // Buffer.from(images[0], 'base64');
  }

  generateImageFull = async (prompt: string, seed: number) => {
    const { images, parameters, info } = await this.client.txt2img({
      prompt,
      // negativePrompt: '(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation',
      negativePrompt: NEGATIVE_PROMPT,
      samplingMethod: SamplingMethod.DPMPlusPlus_2M_Karras,
      width: 1024,
      height: 1024,
      steps: 30,
      batchSize: 1,
      cfgScale: 7,
      seed
    })

    return images[0]; // Buffer.from(images[0], 'base64');
  }

  generateImagesPreviews = async (prompt: string) => {
    const res = await this.client.txt2img({
      prompt,
      // negativePrompt: '(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation',
      negativePrompt: NEGATIVE_PROMPT,
      samplingMethod: SamplingMethod.DPMPlusPlus_2M_Karras,
      width: 1024,
      height: 1024,
      steps: 15,
      batchSize: 4,
      cfgScale: 10,
    })

    return res;
  }
}