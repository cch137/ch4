import { Schema, model } from 'mongoose'

export default model('AiChatConversation', new Schema({
  id:   { type: String, required: true },
  user:  { type: String, required: true },
  name: { type: String },
  curr: { type: String },
  conf: { type: String },
  ctms: { type: Number, required: true },
  mtms: { type: Number },
  atms: { type: Number },
}, {
  versionKey: false,
}), 'aichat-conversations', { overwriteModels: true })
