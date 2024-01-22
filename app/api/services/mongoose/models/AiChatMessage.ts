import { Schema, model } from 'mongoose'

export default model('AiChatMessage', new Schema({
  conv: { type: String, required: true },
  text: { type: String, required: true  },
  modl: { type: String },
  root: { type: String },
  urls: { type: [String], default: undefined },
  args: { type: [String], default: undefined },
  ctms: { type: Number, required: true },
  mtms: { type: Number },
  dtms: { type: Number },
}, {
  versionKey: false,
}), 'aichat-messages', { overwriteModels: true })
