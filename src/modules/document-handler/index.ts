import { type OnMessageContext, type RefundCallback } from '../types'
import * as Sentry from '@sentry/node'

const SupportedDocuments = { PDF: 'application/pdf' }

export class DocumentHandler {
  public getEstimatedPrice (ctx: OnMessageContext): number {
    return 1
  }

  public async onEvent (ctx: OnMessageContext, refundCallback: RefundCallback): Promise<void> {
    try {
      const file = await ctx.getFile()
      console.log(file)
      await ctx.reply('you did it kid')
    } catch (ex) {
      Sentry.captureException(ex)
      await ctx.reply('you failed kid')
    }
  }

  public isSupportedEvent (ctx: OnMessageContext): boolean {
    const documentType = ctx.message.document?.mime_type

    if (documentType !== undefined) {
      return Object.values(SupportedDocuments).includes(documentType)
    }

    return false
  }
}
