import { Schema, model } from 'mongoose'

export default model('AiAsstTrigger', new Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  enbl: { type: Boolean, required: true },
  text: { type: String, required: true },
  sche: { type: Date, required: true },
  intv: { type: Number, required: true },
  plug: { type: [String], required: true },
  nextsche: { type: Date, required: true },
  execlogs: { type: [String], required: true },
}, {
  versionKey: false,
}), 'aiasst-trigger', { overwriteModels: true })
