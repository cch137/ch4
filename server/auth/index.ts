import tokenizer from "./tokenizer";
import emailVerifier from "./email-verifier";
import userManager from "./user-manager";

const auth = {
  tokenizer,
  emailVerifier,
  userManager,
};

export { tokenizer, emailVerifier, userManager };

export default auth;
