import status from '@/server/aichat/status'
import mongoose, { AiChatConversation, AiChatMessage, User } from '@/server/mongoose/'
import { NextResponse } from 'next/server'

interface MongoDbStats {
  db: string,
  collections: number,
  views: number,
  objects: number,
  avgObjSize: number,
  dataSize: number,
  storageSize: number,
  totalFreeStorageSize: number,
  numExtents: number,
  indexes: number,
  indexSize: number,
  indexFreeStorageSize: number,
  fileSize: number,
  nsSizeMB: number,
  ok: number
}

export async function POST() {
  const [
    dbStats,
    totalConversations,
    totalMessages,
    totalRegisteredUsers,
    onlineUsers,
  ] = await Promise.all([
    mongoose.connection.db.stats(),
    AiChatConversation.countDocuments(),
    AiChatMessage.countDocuments(),
    User.countDocuments({auth: { $gte: 1 }}),
    User.countDocuments({atms: { $gte: Date.now() - 60000 }}),
  ])
  return NextResponse.json({
    models: status.table,
    dataSize: (dbStats as MongoDbStats).dataSize,
    totalConversations,
    totalMessages,
    totalRegisteredUsers,
    onlineUsers,
  })
}
