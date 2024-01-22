import { Schema, model } from 'mongoose'

export default model('User', new Schema({
  id: { type: String, required: true },
  eadd: { type: String },
  name: { type: String },
  pass: { type: String },
  auth: { type: Number },
  ctms: { type: Number },
  mtms: { type: Number },
  atms: { type: Number },
}, {
  versionKey: false,
}), 'x-users', { overwriteModels: true })
