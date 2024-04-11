import { type Logger, pino } from 'pino'

// import { getCommandNamePrompt } from '../1country/utils'
import { type BotPayments } from '../payment'
import {
  type OnMessageContext,
  type OnCallBackQueryData,
  type ChatConversation,
  type ChatPayload,
  type PayableBot,
  RequestState,
  type BotSessionData,
  type LmmsSessionData,
  type SubagentResult,
  SubagentStatus
} from '../types'
import { appText } from '../../utils/text'
import { chatService } from '../../database/services'
import config from '../../config'
import {
  getMinBalance,
  getPromptPrice,
  preparePrompt,
  sendMessage
  // SupportedCommands
} from './utils/helpers'
import { type LlmCompletion, deleteCollection } from './api/llmApi'
import * as Sentry from '@sentry/node'
import { now } from '../../utils/perf'
import { type LlmsModelsEnum } from './utils/types'
import { ErrorHandler } from '../errorhandler'
import { AgentBase } from '../agents/agentBase'

export abstract class LlmsBase implements PayableBot {
  public module: string
  protected sessionDataKey: string
  protected readonly logger: Logger
  protected readonly payments: BotPayments
  protected agents: AgentBase[] = []
  protected botSuspended: boolean
  errorHandler: ErrorHandler

  constructor (payments: BotPayments,
    module: string,
    sessionDataKey: string
  ) {
    this.module = module
    this.logger = pino({
      name: this.module,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    })
    this.sessionDataKey = sessionDataKey
    this.botSuspended = false
    this.payments = payments
    this.errorHandler = new ErrorHandler()
  }

  public abstract onEvent (ctx: OnMessageContext | OnCallBackQueryData, refundCallback: (reason?: string) => void): Promise<void>
  public abstract isSupportedEvent (
    ctx: OnMessageContext | OnCallBackQueryData
  ): boolean

  public abstract getEstimatedPrice (ctx: any): number

  protected abstract chatStreamCompletion (
    conversation: ChatConversation[],
    model: LlmsModelsEnum,
    ctx: OnMessageContext | OnCallBackQueryData,
    msgId: number,
    limitTokens: boolean): Promise<LlmCompletion>

  protected abstract chatCompletion (
    conversation: ChatConversation[],
    model: LlmsModelsEnum
  ): Promise<LlmCompletion>

  protected abstract hasPrefix (prompt: string): string

  protected getSession (ctx: OnMessageContext | OnCallBackQueryData): LmmsSessionData {
    return (ctx.session[this.sessionDataKey as keyof BotSessionData] as LmmsSessionData)
  }

  protected async runSubagents (ctx: OnMessageContext | OnCallBackQueryData, msg: ChatConversation): Promise<void> {
    // const id = ctx.message?.message_id ?? ctx.message?.reply_to_message?.message_thread_id ?? 0
    const result = await Promise.all(this.agents.map(async (agent: AgentBase) =>
      await agent.run(ctx, msg)))
    const agentsCompletion = result.filter(agent => agent.status === SubagentStatus.PROCESSING)
    await this.onAgentRequestHandler(ctx, msg, agentsCompletion)
  }

  isSupportedSubagent (ctx: OnMessageContext | OnCallBackQueryData): number {
    let supportedAgents = 0
    for (let i = 0; this.agents.length > i; i++) {
      if (this.agents[i].isSupportedSubagent(ctx)) {
        supportedAgents++
      }
    }
    return supportedAgents
  }

  async onChat (ctx: OnMessageContext | OnCallBackQueryData, model: string, stream: boolean): Promise<void> {
    const session = this.getSession(ctx)
    try {
      if (this.botSuspended) {
        ctx.transient.analytics.sessionState = RequestState.Error
        sendMessage(ctx, 'The bot is suspended').catch(async (e) => { await this.onError(ctx, e) })
        ctx.transient.analytics.actualResponseTime = now()
        return
      }
      const prompt = ctx.match ? ctx.match : ctx.message?.text
      const supportedAgents = this.isSupportedSubagent(ctx)
      console.log('JAJAJAJ', supportedAgents)
      if (supportedAgents === 0) {
        session.requestQueue.push({
          id: ctx.message?.message_id,
          model,
          content: await preparePrompt(ctx, prompt as string),
          numSubAgents: 0
        })
        if (!session.isProcessingQueue) {
          session.isProcessingQueue = true
          await this.onChatRequestHandler(ctx, stream).then(() => {
            session.isProcessingQueue = false
          })
        }
      } else {
        const msg = {
          id: ctx.message?.message_id ?? ctx.message?.message_thread_id ?? 0,
          model,
          content: await preparePrompt(ctx, prompt as string),
          numSubAgents: supportedAgents
        }
        await this.runSubagents(ctx, msg) //  prompt as string)
      }
      ctx.transient.analytics.actualResponseTime = now()
    } catch (e: any) {
      await this.onError(ctx, e)
    }
  }

  async onAgentRequestHandler (ctx: OnMessageContext | OnCallBackQueryData, msg: ChatConversation, subagents: SubagentResult[]): Promise<void> {
    const session = this.getSession(ctx)
    await Promise.all(subagents.map(async (subagent: SubagentResult) => {
      for (const agent of this.agents) {
        if (agent.agentName === subagent.agentName) {
          await agent.onCheckAgentStatus(ctx)
        }
      }
    }))
    const agentsCompletion = AgentBase.getAgents(ctx, msg.id ?? 0)
    if (agentsCompletion && agentsCompletion.length > 0) {
      session.requestQueue.push(msg)
      if (!session.isProcessingQueue) {
        session.isProcessingQueue = true
        await this.onChatRequestHandler(ctx, true).then(() => {
          session.isProcessingQueue = false
        })
      }
    }
  }

  async onChatRequestHandler (ctx: OnMessageContext | OnCallBackQueryData, stream: boolean): Promise<void> {
    const session = this.getSession(ctx)
    while (session.requestQueue.length > 0) {
      try {
        const msg = session.requestQueue.shift()
        const prompt = msg?.content as string
        const model = msg?.model
        const { chatConversation } = session
        const minBalance = await getMinBalance(ctx, msg?.model as LlmsModelsEnum)
        let enhancedPrompt = ''
        if (await this.hasBalance(ctx, minBalance)) {
          if (!prompt) {
            const errorMsg =
              chatConversation.length > 0
                ? `${appText.gptLast}\n_${
                    chatConversation[chatConversation.length - 1].content
                  }_`
                : appText.introText
            ctx.transient.analytics.sessionState = RequestState.Success
            await sendMessage(ctx, errorMsg, { parseMode: 'Markdown' }).catch(async (e) => {
              await this.onError(ctx, e)
            })
            ctx.transient.analytics.actualResponseTime = now()
            return
          }
          if (msg?.numSubAgents && msg?.numSubAgents > 0 && msg.id) {
            const agents = AgentBase.getAgents(ctx, msg.id)
            if (agents) {
              const agentCompletions = agents.map((agent: SubagentResult) => agent.completion)
              enhancedPrompt = prompt.concat(...agentCompletions)
              console.log(enhancedPrompt)
              AgentBase.deleteCompletion(ctx, msg.id)
            } else {
              continue
            }
          }
          const chat: ChatConversation = {
            content: enhancedPrompt || prompt,
            role: 'user',
            model
          }
          chatConversation.push(chat)
          const payload = {
            conversation: chatConversation,
            model: model ?? config.llms.model,
            ctx
          }
          let result: { price: number, chat: ChatConversation[] } = { price: 0, chat: [] }
          if (stream) {
            result = await this.completionGen(payload)
          } else {
            result = await this.promptGen(payload)
          }
          session.chatConversation = [...result.chat]
          if (
            !(await this.payments.pay(ctx as OnMessageContext, result.price))
          ) {
            await this.onNotBalanceMessage(ctx)
          }
          ctx.chatAction = null
        } else {
          await this.onNotBalanceMessage(ctx)
        }
      } catch (e: any) {
        session.chatConversation = []
        await this.onError(ctx, e)
      }
    }
  }

  protected async hasBalance (ctx: OnMessageContext | OnCallBackQueryData, minBalance = +config.llms.minimumBalance): Promise<boolean> {
    const minBalanceOne = this.payments.toONE(await this.payments.getPriceInONE(minBalance), false)
    const accountId = this.payments.getAccountId(ctx)
    const addressBalance = await this.payments.getUserBalance(accountId)
    const { totalCreditsAmount } = await chatService.getUserCredits(accountId)
    const balance = addressBalance.plus(totalCreditsAmount)
    const balanceOne = this.payments.toONE(balance, false).toFixed(2)
    const isGroupInWhiteList = await this.payments.isGroupInWhitelist(ctx as OnMessageContext)
    return (
      +balanceOne > +minBalanceOne ||
      (this.payments.isUserInWhitelist(ctx.from.id, ctx.from.username)) ||
      isGroupInWhiteList
    )
  }

  private async completionGen (data: ChatPayload, msgId?: number, outputFormat = 'text'): Promise< { price: number, chat: ChatConversation[] }> {
    const { conversation, ctx, model } = data
    try {
      if (!msgId) {
        ctx.transient.analytics.firstResponseTime = now()
        msgId = (
          await ctx.reply('...', {
            message_thread_id:
              ctx.message?.message_thread_id ??
              ctx.message?.reply_to_message?.message_thread_id
          })
        ).message_id
      }
      if (outputFormat === 'text') {
        const isTypingEnabled = config.openAi.chatGpt.isTypingEnabled
        if (isTypingEnabled) {
          ctx.chatAction = 'typing'
        }
        const completion = await this.chatStreamCompletion(conversation,
          model as LlmsModelsEnum,
          ctx,
          msgId,
          true // telegram messages has a character limit
        )
        if (isTypingEnabled) {
          ctx.chatAction = null
        }
        if (completion) {
          ctx.transient.analytics.sessionState = RequestState.Success
          ctx.transient.analytics.actualResponseTime = now()
          const price = getPromptPrice(completion, data)
          this.logger.info(
            `streamChatCompletion result = tokens: ${price.promptTokens + price.completionTokens} | ${model} | price: ${price.price}¢` //   }
          )
          conversation.push({
            role: 'assistant',
            content: completion.completion?.content ?? '',
            model
          })
          return {
            price: price.price,
            chat: conversation
          }
        }
      } else {
        const response = await this.chatCompletion(conversation, model as LlmsModelsEnum)
        conversation.push({
          role: 'assistant',
          content: response.completion?.content ?? '',
          model
        })
        return {
          price: response.price,
          chat: conversation
        }
      }
      return {
        price: 0,
        chat: conversation
      }
    } catch (e: any) {
      Sentry.captureException(e)
      ctx.chatAction = null
      throw e
    }
  }

  private async promptGen (data: ChatPayload): Promise<{ price: number, chat: ChatConversation[] }> {
    const { conversation, ctx, model } = data
    if (!ctx.chat?.id) {
      throw new Error('internal error')
    }
    const msgId = (
      await ctx.reply('...', { message_thread_id: ctx.message?.message_thread_id })
    ).message_id
    ctx.chatAction = 'typing'
    const response = await this.chatCompletion(conversation, model as LlmsModelsEnum)
    if (response.completion) {
      await ctx.api.editMessageText(
        ctx.chat.id,
        msgId,
        response.completion.content as string
      )
      conversation.push(response.completion)
      // const price = getPromptPrice(completion, data);
      // this.logger.info(
      //   `streamChatCompletion result = tokens: ${
      //     price.promptTokens + price.completionTokens
      //   } | ${model} | price: ${price}¢`
      // );
      return {
        price: 0,
        chat: conversation
      }
    }
    // ctx.chatAction = null
    ctx.transient.analytics.actualResponseTime = now()
    return {
      price: 0,
      chat: conversation
    }
  }

  async onNotBalanceMessage (ctx: OnMessageContext | OnCallBackQueryData): Promise<void> {
    const accountId = this.payments.getAccountId(ctx)
    const account = this.payments.getUserAccount(accountId)
    const addressBalance = await this.payments.getUserBalance(accountId)
    const { totalCreditsAmount } = await chatService.getUserCredits(accountId)
    const balance = addressBalance.plus(totalCreditsAmount)
    const balanceOne = this.payments.toONE(balance, false).toFixed(2)
    const balanceMessage = appText.notEnoughBalance
      .replaceAll('$CREDITS', balanceOne)
      .replaceAll('$WALLET_ADDRESS', account?.address ?? '')
    ctx.transient.analytics.sessionState = RequestState.Success
    await sendMessage(ctx, balanceMessage, { parseMode: 'Markdown' }).catch(async (e) => { await this.onError(ctx, e) })
    ctx.transient.analytics.actualResponseTime = now()
  }

  async onStop (ctx: OnMessageContext | OnCallBackQueryData): Promise<void> {
    const session = this.getSession(ctx)
    for (const c of ctx.session.collections.activeCollections) {
      this.logger.info(`Deleting collection ${c.collectionName}`)
      await deleteCollection(c.collectionName)
    }
    ctx.session.collections.activeCollections = []
    ctx.session.collections.collectionConversation = []
    ctx.session.collections.collectionRequestQueue = []
    ctx.session.collections.currentCollection = ''
    ctx.session.collections.isProcessingQueue = false
    session.chatConversation = []
    session.usage = 0
    session.price = 0
  }

  async onError (
    ctx: OnMessageContext | OnCallBackQueryData,
    e: any,
    retryCount: number = this.errorHandler.maxTries,
    msg = ''
  ): Promise<void> {
    await this.errorHandler.onError(ctx, e, retryCount, this.logger, msg, this.onStop.bind(this))
  }
}
