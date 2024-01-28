import status from '@/server/aichat/status'
import mongoose, { AiChatConversation, AiChatMessage, User } from '@/server/mongoose/'

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
    totalConversations,
    totalMessages,
    totalRegisteredUsers,
    dbStats,
  ] = await Promise.all([
    AiChatConversation.countDocuments(),
    AiChatMessage.countDocuments(),
    User.countDocuments({auth: { $gte: 1 }}),
    mongoose.connection.db.stats()
  ])
  return {
    models: status.table,
    totalConversations,
    totalMessages,
    totalRegisteredUsers,
    dataSize: (dbStats as MongoDbStats).dataSize
  }
}
