import { AiChatMessage, AiChatConversation, dataSetter } from '../mongoose'
import type { ObjectId } from 'mongodb'
import type { ConvCompleted, ConvItem, MssgItem } from "@/constants/chat/types";
import { correctConvConfig } from '@/constants/chat'
import type { StatusResponse } from '@/constants/types'
import random from '@cch137/utils/random'
import { userManager } from '../auth';

const ConvOp = dataSetter(AiChatConversation, 'user', 'id')

const getConvList = async (userId?: string) => {
  try {
    if (!userId) throw new Error('UserId is required')
    return await AiChatConversation.find({ user: userId }, { _id: 0, id: 1, name: 1, mtms: 1 })
  } catch {
    return []
  }
}

const isOwnerOfConv = async (userId?: string, convId?: string) => {
  if (!userId || !convId) return false
  return Boolean(await AiChatConversation.findOne({ user: userId, id: convId }, { _id: 1 }))
}

const getMessages = async (userId: string, convId: string) => {
  if (!await isOwnerOfConv(userId, convId)) return []
  return (await AiChatMessage.find({ conv: convId }).lean()) as MssgItem[]
}

const getConv = async (userId: string, convId: string) => {
  accessedConv(userId, convId)
  return (await ConvOp.find(userId, convId).get({ _id: 0, user: 0 })) as ConvItem || null
}

const getConvCompleted = async (userId: string, convId: string) => {
  const conv = getConv(userId, convId) || { id: convId }
  const messages = getMessages(userId, convId)
  return {
    ...(await conv),
    messages: await messages,
  } as ConvCompleted
}

const setConv = async (userId?: string, convId?: string, data?: {name?: string, conf?: string, tail?: string}) => {
  if (!userId) return { success: false, message: 'UserId is required' }
  if (!convId) return { success: false, message: 'ConvId is required' }
  const {name, conf, tail} = data || {};
  let op = ConvOp.find(userId, convId)
  if (typeof name === 'string') op = op.set('name', name.trim())
  if (typeof conf === 'string') op = op.set('conf', correctConvConfig(conf))
  if (typeof tail === 'string') op = op.set('tail', tail)
  return await op.set('mtms', Date.now()).save()
}

const transferConvs = async (fromUserId: string, toUserId: string) => {
  if (!fromUserId) return
  if (!toUserId) return
  await AiChatConversation.updateMany({ user: fromUserId }, { $set: { user: toUserId } })
  return
}

const delConv = async (userId?: string, convId?: string) => {
  if (!userId) return { success: false, message: 'UserId is required' }
  if (!convId) return { success: false, message: 'ConvId is required' }
  try {
    await Promise.all([
      AiChatConversation.deleteOne({ user: userId, id: convId }),
      AiChatMessage.deleteMany({ conv: convId }),
    ])
    return { success: true }
  } catch {
    return { success: false, message: 'Failed to delete covnversation' }
  }
}

const accessedConv = async (userId?: string, convId?: string) => {
  if (!userId) return { success: false, message: 'UserId is required' }
  if (!convId) return { success: false, message: 'ConvId is required' }
  return await ConvOp.find(userId)
    .set('atms', Date.now())
    .save()
}

const modifiedConv = async (userId?: string, convId?: string) => {
  if (!userId) return { success: false, message: 'UserId is required' }
  if (!convId) return { success: false, message: 'ConvId is required' }
  return await ConvOp.find(userId)
    .set('mtms', Date.now())
    .save()
}

const _generateConvId = async () => {
  while (true) {
    const id = random.base64(8)
    if (await AiChatConversation.findOne({ id }, { _id: 1 })) continue
    return id
  }
}

const createConv = async (userId?: string): Promise<StatusResponse<string>> => {
  if (!userId || !await userManager.hasUserById(userId)) return { success: false, message: 'UserId is required' }
  try {
    const convId = await _generateConvId()
    const now = Date.now()
    await AiChatConversation.create({
      id: convId,
      user: userId,
      ctms: now,
    })
    return { success: true, value: convId }
  } catch {
    return { success: false, message: 'Failed to create conversation' }
  }
}

const insertMessage = async (userId?: string, msg?: MssgItem): Promise<StatusResponse<MssgItem>> => {
  if (!msg) return { success: false, message: 'Message is required' }
  const { conv, text, modl, root, urls, args, dtms } = msg
  if (!userId || !conv || !(await isOwnerOfConv(userId, conv))) return { success: false, message: 'Conversation is requried' }
  const ctms = Date.now()
  modifiedConv(userId, conv)
  const createdMsg = await AiChatMessage.create({
    conv,
    text: text.trim(),
    modl,
    root,
    dtms,
    ctms,
    // urls,
    // args,
  })
  return {
    success: true,
    value: {
      _id: createdMsg._id.toHexString(),
      conv, text, modl, root, dtms, ctms
    }
  }
}

const getMessage = async (userId: string, convId: string, msgId: string) => {
  if (!await isOwnerOfConv(userId, convId)) return null
  return (await AiChatMessage.findOne({ conv: convId, _id: msgId }).lean()) as MssgItem
}

const setMessage = async (userId: string, convId: string, _id?: ObjectId | string, msg?: MssgItem) => {
  const msgId = _id || msg?._id
  if (!msgId || !msg) return { success: false, message: 'Message is empty' }
  if (!await isOwnerOfConv(userId, convId)) return { success: false, message: 'Not owner' }
  const { text, modl, root, urls, args } = msg
  modifiedConv(userId, convId)
  return await AiChatMessage.updateOne(
    { _id: msgId },
    {
      $set: {
        text: text.trim(),
        modl,
        root,
        urls,
        args,
        mtms: Date.now(),
      }
    })
}

const delMessage = async (userId?: string, convId?: string, _id?: ObjectId | string): Promise<StatusResponse> => {
  if (!userId || !convId || !_id) return {success: false, message: 'Message not found'}
  if (typeof _id !== 'string') return await delMessage(userId, convId, _id.toHexString());
  if (!await isOwnerOfConv(userId, convId)) return {success: false, message: 'Not owner'}
  const [message, child] = await Promise.all([
    AiChatMessage.findOne({ conv: convId, _id }),
    AiChatMessage.findOne({ conv: convId, root: _id }),
  ])
  if (!message) return {success: false, message: 'Message not found'}
  const {root} = message
  try {
    await Promise.all([
      AiChatMessage.deleteOne({ _id }),
      AiChatMessage.updateMany({root: _id}, root ? {$set: {root}} : {$unset: {root: 1}}),
      AiChatConversation.updateOne({tail: _id}, root ? {$set: {tail: root}} : {$unset: {tail: 1}}),
    ])
    return {success: true}
  } catch {
    return {success: true, message: 'Failed to delete message'}
  }
}

const messageManager = {
  isOwnerOfConv,
  getConvList,
  getConv,
  getConvCompleted,
  getMessage,
  getMessages,
  insertMessage,
  createConv,
  setConv,
  setMessage,
  delMessage,
  delConv,
  accessedConv,
  modifiedConv,
  transferConvs,
}

export default messageManager
