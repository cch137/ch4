import { AiChatMessage, AiChatConversation, dataSetter } from '../mongoose'
import type { ObjectId } from 'mongodb'
import type { ConvCompleted, ConvItem, MssgItem, SaveMssg, SaveMssgRes } from "@/constants/chat/types";
import { correctConvConfig } from '@/constants/chat';
import type { StatusResponse } from '@/constants/types';
import random from '@cch137/utils/random';

const ConvOp = dataSetter(AiChatConversation, 'user', 'id')

const getConvList = async (userId?: string) => {
  try {
    if (!userId) throw new Error('UserId is required');
    return await AiChatConversation.find({ user: userId }, { _id: 0, id: 1, name: 1, mtms: 1 })
  } catch {
    return [];
  }
}

const isOwnerOfConv = async (userId?: string, convId?: string) => {
  if (!userId || !convId) return false;
  return Boolean(await AiChatConversation.findOne({ user: userId, id: convId }, { _id: 1 }))
}

const getMessages = async (userId: string, convId: string) => {
  if (!await isOwnerOfConv(userId, convId)) return []
  return (await AiChatMessage.find({ conv: convId }, { conv: 0 }).lean()) as MssgItem[]
}

const getConv = async (userId: string, convId: string) => {
  return (await ConvOp.find(userId, convId).get({ _id: 0, user: 0 })) as ConvItem || null
}

const getConvCompleted = async (userId: string, convId: string) => {
  const conv = getConv(userId, convId) || { id: convId };
  const messages = getMessages(userId, convId);
  return {
    ...(await conv),
    messages: await messages,
  } as ConvCompleted
}

const setConvNameAndConf = async (userId?: string, convId?: string, name?: string, conf?: string) => {
  if (!userId) return { success: false, message: 'UserId is required' }
  if (!convId) return { success: false, message: 'ConvId is required' }
  let op = ConvOp.find(userId, convId)
  if (typeof name === 'string') op = op.set('name', name.trim())
  if (typeof conf === 'string') op = op.set('conf', correctConvConfig(conf))
  return await op.save()
}

const transferConvs = async (fromUserId: string, toUserId: string) => {
  return await AiChatConversation.updateMany({ user: fromUserId }, { $set: { user: toUserId } })
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

const _createConv = async (userId?: string): Promise<StatusResponse<string>> => {
  if (!userId) return { success: false, message: 'UserId is required' }
  try {
    const convId = random.base64(8)
    const now = Date.now()
    await AiChatConversation.create({
      id: convId,
      user: userId,
      ctms: now,
      mtms: now,
    });
    return { success: true, value: convId }
  } catch {
    return { success: false, message: 'Failed to create conversation' }
  }
}

const insertMessage = async (userId?: string, msg?: SaveMssg): Promise<StatusResponse<SaveMssgRes>> => {
  if (!msg) return { success: false, message: 'Message is required' };
  const { conv, text, modl, root, urls, args, dtms } = msg;
  const convId = conv ? conv : (await _createConv(userId)).value;
  if (!convId) return { success: false, message: 'Conversation is requried' };
  const ctms = Date.now();
  const createdMsg = await AiChatMessage.create({
    conv: convId,
    text: text.trim(),
    modl,
    root,
    dtms,
    ctms,
    // mtms: undefined,
    // urls,
    // args,
  })
  return {
    success: true,
    value: {
      conv: convId,
      isNewConv: conv !== convId,
      mssg: { _id: createdMsg._id.toHexString(), text, modl, root, dtms, ctms }
    }
  }
}

const getMessage = async (userId: string, convId: string, msgId: string) => {
  if (!await isOwnerOfConv(userId, convId)) return null;
  return (await AiChatMessage.findOne({ conv: convId, _id: msgId }, { conv: 0 }).lean()) as MssgItem
}

const setMessage = async (userId: string, convId: string, _id?: ObjectId | string, msg?: MssgItem) => {
  const msgId = _id || msg?._id;
  if (!msgId || !msg) return { success: false, message: 'Message is empty' }
  if (!await isOwnerOfConv(userId, convId)) return { success: false, message: 'Not owner' }
  const { text, modl, root, urls, args } = msg;
  return await AiChatMessage.updateOne({ _id: msgId }, { $set: { text: text.trim(), modl, root, urls, args } });
}

const delMessage = async (userId: string, convId: string, _id?: ObjectId | string) => {
  if (!await isOwnerOfConv(userId, convId)) return { success: false, message: 'Not owner' }
  if (!_id) return { success: false, message: 'Message not found' }
  return await AiChatMessage.deleteOne({ conv: convId, _id });
}

const messageManager = {
  isOwnerOfConv,
  getConvList,
  getConv,
  getConvCompleted,
  getMessage,
  getMessages,
  insertMessage,
  setConvNameAndConf,
  setMessage,
  delMessage,
  delConv,
  accessedConv,
  transferConvs,
}

export default messageManager
