import messageManager from "./message-manager";
import aiProvider from "./aiProvider";

const aiChat = Object.freeze({
  messageManager,
  aiProvider,
});

export {
  messageManager,
  aiProvider,
}

export default aiChat;
