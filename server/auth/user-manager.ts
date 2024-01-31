import random from '@cch137/utils/random'
import sha3 from 'crypto-js/sha3.js'
import { User, dataSetter } from '../mongoose'
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH } from '@/constants/auth'
import type { StatusResponse, UserDetails } from '@/constants/types'

const _hashPass = (message: string): string => {
  return sha3(message, { outputLength: 256 }).toString()
}

const _safeUserName = (name: string) => {
  return name.padEnd(USERNAME_MIN_LENGTH, '_').replace(/[^\w]+/g, '').substring(0, USERNAME_MAX_LENGTH);
}

const _generateUserId = async () => {
  while (true) {
    const id = random.base64(16)
    if (!await hasUserById(id)) return id
  }
}

const hasUserById = async (id?: string) => {
  try {
    if (!id) return false;
    return Boolean(await User.findOne({ id }, { _id: 1 }))
  } catch {
    return false
  }
}

const hasUserByName = async (name: string) => {
  try {
    return Boolean(await User.findOne({ $or: [{ name }] }, { _id: 1 }))
  } catch {
    return false
  }
}

const hasUserByUserIdentity = async (nameOrEadd: string) => {
  try {
    return Boolean(await User.findOne({ $or: [{ eadd: nameOrEadd }, { name: nameOrEadd }] }, { _id: 1 }))
  } catch {
    return false
  }
}

const getUserByUserIdentityAndPass = async (nameOrEadd: string, pass: string, hashed = false) => {
  const hashedPass = hashed ? pass : _hashPass(pass)
  try {
    return await User.findOne({
      $or: [
        { eadd: nameOrEadd, pass: hashedPass },
        { name: nameOrEadd, pass: hashedPass },
      ]
    }, { _id: 0 })
  } catch {
    return null
  }
}

const getUserById = async (id: string) => {
  try {
    return await User.findOne({ id }).lean()
  } catch {
    return null
  }
}

const getUserByIdAndHashedPass = async (id: string, hashedPass?: string) => {
  try {
    if (!hashedPass) return null
    return await User.findOne({ id, pass: hashedPass }, { _id: 0 }).lean()
  } catch {
    return null
  }
}

const getUserDetailsById = async (userId?: string): Promise<StatusResponse<UserDetails>> => {
  if (!userId) return { success: false, message: 'User not found' }
  const { eadd, ctms, mtms, atms } = await User.findOne({ id: userId }, { _id: 0, eadd: 1, ctms: 1, mtms: 1, atms: 1 }).lean() || {}
  return {
    success: true,
    value: {
      eadd: eadd || undefined,
      ctms: ctms || undefined,
      mtms: mtms || undefined,
      atms: atms || undefined,
    }
  }
}

const getUserIdByUserIdentity = async (nameOrEadd: string) => {
  try {
    return (await User.findOne({ $or: [{ eadd: nameOrEadd }, { name: nameOrEadd }] }, { _id: 0, id: 1 }))?.id || null
  } catch {
    return null
  }
}

/** Warning: please ONLY use it in authNext. */
const _createUserTemporary = async (): Promise<StatusResponse<string>> => {
  try {
    const id = await _generateUserId();
    await User.create({ id, ctms: Date.now(), })
    return { success: true, value: id }
  } catch {
    return { success: false, message: 'Failed to create a temporary user' }
  }
}

const createUser = async (eadd: string, name: string, pass: string): Promise<StatusResponse> => {
  const hashedPass = _hashPass(pass)
  name = _safeUserName(name)
  const checkEmail = User.findOne({ eadd }, { _id: 1 })
  const checkUsername = User.findOne({ name }, { _id: 1 })
  if (Boolean(await checkEmail)) return { success: false, message: 'Email address is already in use' } 
  if (Boolean(await checkUsername)) return { success: false, message: 'Username is already in use' }
  try {
    await User.create({
      id: await _generateUserId(),
      eadd,
      name,
      pass: hashedPass,
      auth: 1,
      ctms: 1,
    })
    return { success: true }
  } catch {
    return { success: false, message: 'Failed to create a user' }
  }
}

const UserOp = dataSetter(User, 'id')

const modifiedUser = async (id?: string) => {
  if (!id) return { success: false, message: 'Id is empty' }
  return await UserOp.find(id)
    .set('mtms', Date.now())
    .save()
}

const accessedUser = async (id?: string) => {
  if (!id) return { success: false, message: 'Id is empty' }
  return await UserOp.find(id)
    .set('atms', Date.now())
    .save()
}

const setPass = async (id: string, newPassword: string) => {
  if (!id) throw new Error('Id is empty');
  return await UserOp.find(id)
    .set('pass', _hashPass(newPassword))
    .save((s) => s ? modifiedUser(id) : void 0)
}

const setName = async (id: string, name: string) => {
  if (!id) throw new Error('Id is empty');
  return await UserOp.find(id)
    .set('name', _safeUserName(name), true)
    .save((s) => s ? modifiedUser(id) : void 0)
}

const setEadd = async (id: string, eadd: string) => {
  if (!id) throw new Error('Id is empty');
  return await UserOp.find(id)
    .set('eadd', eadd, true)
    .save((s) => s ? modifiedUser(id) : void 0)
}

const userManager = {
  UserOp,
  hasUserById,
  hasUserByName,
  hasUserByUserIdentity,
  getUserById,
  getUserByIdAndHashedPass,
  getUserByUserIdentityAndPass,
  getUserDetailsById,
  getUserIdByUserIdentity,
  createUser,
  _createUserTemporary,
  accessedUser,
  modifiedUser,
  setEmail: setEadd,
  setPassword: setPass,
  setName,
}

export default userManager
