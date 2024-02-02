import { config } from 'dotenv'
import type { Model, ProjectionType } from 'mongoose'
import mongoose from 'mongoose'
import type { StatusResponse } from '@/constants/types'

config()

mongoose.connect(process.env.MONGODB_KEY as string)
  .then(() => console.log('connected to MongoDB'))
  .catch(() => console.error('failed to connect to MongoDB'));

export default mongoose

function dataSetter<M extends typeof Model>(model: M, ...uniqueKeys: (keyof InstanceType<M>)[]) {
  class DataSetterUnit<I = any> {
    key: string;
    value: I;
    isUniqueValue: boolean;
    neFilters: {[x:string]:{$ne: any}}[];
  
    constructor(key: string, value: I, isUniqueValue = false, neFilters: {[x:string]:{$ne: any}}[] = []) {
      this.key = key
      this.value = value
      this.isUniqueValue = isUniqueValue
      this.neFilters = neFilters
    }

    get name() {
      return this.key.charAt(0).toUpperCase() + this.key.slice(1)
    }
  
    async checkUnique(): Promise<StatusResponse> {
      if (!this.isUniqueValue) return { success: true }
      try {
        const isExist = Boolean(await model.findOne({
          $and: [{ [this.key]: this.value }, ...this.neFilters]
        }, { _id: 1 }))
        if (isExist) return { success: false, message: this.name }
        return { success: true }
      } catch {
        return { success: false, message: this.name }
      }
    }
  }

  return class DataOperator<V extends any[] = []> extends Set<DataSetterUnit> {
    #uniqueVals: V;
    #filter: Record<string, any>;

    get #neFilters() {
      return uniqueKeys.map((k, i) => ({ [k]: { $ne: this.#uniqueVals[i] } }))
    }
  
    constructor(...uniqueVals: V) {
      super()
      this.#uniqueVals = uniqueVals
      const filter = {} as Record<keyof InstanceType<M>, any>
      for (let i = 0; i < uniqueKeys.length; i++) filter[uniqueKeys[i]] = this.#uniqueVals[i]
      this.#filter = filter
    }

    async checkUnique() {
      const statusResponses = await Promise.all([...this].filter((u) => u.isUniqueValue).map((u) => u.checkUnique()))
      if (statusResponses.every(i => i.success)) return { success: true }
      const message = `${statusResponses.filter(i => !i.success).map(i => i.message as string).join(', ')} is already in use`
      return { success: false, message }
    }

    async save(callback?: (success: boolean) => void): Promise<StatusResponse> {
      if (this.size === 0) return { success: true }
      const { success, message } = await this.checkUnique()
      if (!success) return { success: false, message }
      const setter: Record<string, any> = {}
      this.forEach((u) => setter[u.key] = u.value)
      this.clear()
      try {
        await model.updateOne(this.#filter, { $set: setter })
        if (callback) callback(true);
        return { success: true }
      } catch {
        if (callback) callback(false);
        return { success: false, message: 'Failed to change data' }
      }
    }

    set(key: keyof InstanceType<M>, value: any, isUniqueValue = false) {
      return this.add(new DataSetterUnit(key.toString(), value, isUniqueValue, this.#neFilters))
    }

    get(projection?: ProjectionType<InstanceType<M>>): Promise<InstanceType<M> | null> {
      return model.findOne(this.#filter, projection).lean()
    }

    static find(...uniqueVals: any[]) {
      return new DataOperator(...uniqueVals)
    }
  }
}

import Admin from './models/Admin'
import User from './models/User'
import AiChatMessage from './models/AiChatMessage'
import AiChatConversation from './models/AiChatConversation'
import AiAsstTrigger from './models/AiAsstTrigger'

export {
  dataSetter,
  Admin,
  User,
  AiChatConversation,
  AiChatMessage,
  AiAsstTrigger,
}
