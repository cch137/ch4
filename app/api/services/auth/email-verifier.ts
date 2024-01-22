import random from '@cch137/utils/random'
import mailer from './mailer'
import { appName } from '@/constants/app'
import timeMsToLocaleString from '@cch137/utils/format/timeMsToLocaleString'
import type { StatusResponse } from '@/constants/types'
import isemail from 'isemail'

const message_VerificationCodeHasExpired = 'Verification code has expired';
const message_IncorrectVerificationCode = 'Incorrect verification code';
const message_FailedToSendVerificationCodeMail = 'Failed to send verification code mail';

class EmailVerifierUnit {
  email: string;
  correctCode: string;
  ageMs: number;
  verifyTries = 0;
  resendTries = 0;
  timeout?: NodeJS.Timeout;

  constructor(email: string, code: string, ageMs: number = 15 * 60 * 1000) {
    this.email = email;
    this.correctCode = code;
    this.ageMs = ageMs;
    emailVerifier.set(email, this);
  }

  async send() {
    if (this.resendTries++ > 3) return { success: false, message: `Too many resend, please try again after ${timeMsToLocaleString(this.ageMs)}.` } as StatusResponse
    try {
      await mailer.sendText(this.email, `Verification code - ${appName}`, `Here is your ${appName} verification code:\n\n${this.correctCode}\n\nDo not share this information with anyone.\nThe verification code is valid for 5 minutes.\nIf you are unsure of the intended purpose of this code, kindly disregard this email.\nThis is an automated email. Please do not reply.`)
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.kill(), this.ageMs);
      return { success: true } as StatusResponse
    } catch (e) {
      return { success: false, message: message_FailedToSendVerificationCodeMail } as StatusResponse
    }
  }

  verify (code?: string) {
    if (code === this.correctCode) {
      this.kill();
      return { success: true } as StatusResponse;
    }
    if (this.verifyTries++ > 6) {
      this.kill();
      return { success: false, message: message_VerificationCodeHasExpired } as StatusResponse;
    }
    return { success: false, message: message_IncorrectVerificationCode } as StatusResponse;
  }

  kill() {
    clearTimeout(this.timeout);
    emailVerifier.delete(this.email);
  }
}

/** The keys of map are email addresses. */
class EmailVerifier extends Map<string, EmailVerifierUnit> {
  async create(email: string) {
    if (!isemail.validate(email)) return { success: false, message: 'Email format is invalid' };
    return await (this.get(email) || new EmailVerifierUnit(email, random.base10(6))).send();
  }

  verify(email: string, code?: string): StatusResponse {
    const verifier = this.get(email)
    if (!verifier) return { success: false, message: message_VerificationCodeHasExpired };
    return verifier.verify(code);
  }
}

const emailVerifier = new EmailVerifier()

export default emailVerifier
