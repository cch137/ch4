import tokenizer from './tokenizer'
import emailVerifier from './email-verifier'
import userManager from './user-manager'

const auth = {
  tokenizer,
  emailVerifier,
  userManager,
}

export {
  tokenizer,
  emailVerifier,
  userManager,
}

export default auth;

(async () => {
  const {default: formatDate} = await import('@cch137/utils/format/date');
  const { AiChatMessage, AiChatConversation } = await import('../mongoose');
  const timeLog = (...m: string[]) => console.log(formatDate(new Date), ...m);
});
