import { Schema, model } from 'mongoose'

export default model('Admin', new Schema({
  key:   { type: String, required: true },
  value: { type: Buffer, required: true },
}, {
  versionKey: false,
}), 'admin', { overwriteModels: true })
