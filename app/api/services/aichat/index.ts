import messageManager from "./message-manager";
import aiProvider from "./aiProvider";
import { UniOptions } from "@cch137/utils/ai/types";

const aiChat = Object.freeze({
  messageManager,
  aiProvider,
});

export {
  messageManager,
  aiProvider,
}

export default aiChat;
