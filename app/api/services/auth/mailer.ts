import nodemailer from 'nodemailer'
import admin, { adminProvider } from '../admin'

const transporter = await adminProvider([
  admin.config['nodemailer-email'],
  admin.config['nodemailer-password']
], ([user, pass]) => nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: { user: user.value, pass: pass.value }
}));

const sendMail = async (
  toEmailAddress: string,
  subject: string,
  message: string,
  type: 'text' | 'html' = 'text'
) => {
  return await new Promise<void>(async (resolve, reject) => {
    transporter.value.sendMail({
      from: admin.config['nodemailer-email'].value,
      to: toEmailAddress,
      subject,
      [type]: message
    }, (err, info) => {
      if (err) {
        return reject(err)
      }
      console.log(`Email sent: (${subject}) ${info.response}`)
      resolve()
    })
  })
}

const sendText = async (toEmailAddress: string, subject: string, content: string) => {
  return await sendMail(toEmailAddress, subject, content, 'text')
}

const sendHtml = async (toEmailAddress: string, subject: string, content: string) => {
  return await sendMail(toEmailAddress, subject, content, 'html')
}

const mailer = {
  transporter,
  sendText,
  sendHtml,
}

export default mailer
