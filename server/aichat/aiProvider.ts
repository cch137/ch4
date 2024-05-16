import admin, { adminProvider } from "../admin";
import SuperProvider, {
  GeminiProvider,
  OneApiProvider,
} from "@/server/ai-providers";
import statusAnalysis from "./status";

// await admin.config["gemini-key"].set("key");

const gemini = await adminProvider(
  [admin.config["gemini-key"]],
  ([key]) => new GeminiProvider(key.value)
);

const provider0 = await adminProvider(
  [admin.config["gpt-provider0-host"], admin.config["gpt-provider0-key"]],
  ([host, key]) => new OneApiProvider(host.value, key.value)
);

const provider1 = await adminProvider(
  [admin.config["gpt-provider1-host"], admin.config["gpt-provider1-key"]],
  ([host, key]) => new OneApiProvider(host.value, key.value)
);

export type SupportedModel =
  | "gemini-pro"
  | "gpt-4o"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-2";

const aiProvider = new SuperProvider(
  Object.freeze({
    get ["gemini-pro"]() {
      return gemini.value;
    },
    get ["gpt-3.5-turbo"]() {
      return provider0.value;
    },
    get ["gpt-4"]() {
      return provider0.value;
    },
    get ["gpt-4o"]() {
      return provider0.value;
    },
    get ["claude-2"]() {
      return provider1.value;
    },
  })
);

aiProvider.listen(async (res) => {
  try {
    await res.untilDone;
    if (res.lastError) throw new Error(res.lastError);
    statusAnalysis.record(res.model, true);
  } catch {
    statusAnalysis.record(res.model, false);
  }
  statusAnalysis;
});

export default aiProvider;
