import { Schema, model } from 'mongoose'

export default model('AiAsstTrigger', new Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  enbl: { type: Boolean, required: true },
  type: { type: String, required: true },
  modl: { type: String, required: true },
  main: { type: String, required: true },
  strt: { type: Date, required: true },
  // endt: { type: Date, required: true },
  intv: { type: Number, required: true },
  plug: { type: [String], required: true },
  nextsche: { type: Date },
  execlogs: { type: [String], required: true },
}, {
  versionKey: false,
}), 'aiasst-trigger', { overwriteModels: true })
