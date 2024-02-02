import status from '@/server/aichat/status'
import mongoose, { AiAsstTrigger, AiChatConversation, AiChatMessage, User } from '@/server/mongoose/'
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
    totalTriggers,
    totalEnabledTriggers,
  ] = await Promise.all([
    mongoose.connection.db.stats(),
    AiChatConversation.countDocuments(),
    AiChatMessage.countDocuments(),
    User.countDocuments({auth: { $gte: 1 }}),
    User.countDocuments({atms: { $gte: Date.now() - 60000 }}),
    AiAsstTrigger.countDocuments(),
    AiAsstTrigger.countDocuments({enbl: true}),
  ])
  return NextResponse.json({
    models: status.table,
    dataSize: (dbStats as MongoDbStats).dataSize,
    totalConversations,
    totalMessages,
    totalRegisteredUsers,
    onlineUsers,
    totalTriggers,
    totalEnabledTriggers,
  })
}

import random from "@cch137/utils/random";
import {sleep} from "@cch137/utils/time";
import fs from "fs";
import { triggersManager } from '@/server/aiasst'

const mchnCode = random.base64(8);
fs.writeFileSync('.next/mchnCode.txt', mchnCode, 'utf-8');
new Promise<void>(async (r) => {
  while (true) {
    const now = new Date();
    const fileMchnCode = fs.readFileSync('.next/mchnCode.txt', 'utf-8');
    if (fileMchnCode !== mchnCode) break;
    const execNeededTriggers = await AiAsstTrigger.find({nextsche: {$lte: now, enbl: true}}).lean();
    await Promise.all(execNeededTriggers.map(async (trigger) => {
      const {_id, nextsche} = trigger;
      return await triggersManager.execTrigger({...trigger, _id: _id.toHexString(), nextsche: new Date(nextsche||NaN)})
    }));
    await sleep(1000);
  }
  r();
});
