import type { IResult as ParsedUa } from "ua-parser-js";

export default function detectBot({
  ua,
  dev = false,
}: {
  ua: ParsedUa;
  dev?: boolean;
}) {
  if (typeof window === "undefined") return { value: false, details: {} };
  const win = window;
  const doc = document;
  const nav = navigator;
  // @ts-ignore
  const { chrome } = win;
  const { ua: _ua1 } = ua;
  const {
    webdriver,
    language,
    languages = [],
    userAgent: _ua2 = "",
    platform = "",
  } = nav;
  const userAgent = _ua1 || _ua2;
  const isTouchScreen = "ontouchstart" in doc || nav.maxTouchPoints > 0;

  // 偵測 webdriver 是否存在，或是否被重新定義
  const isWebdriver =
    webdriver === true ||
    webdriver === undefined ||
    Object.keys(Object.getOwnPropertyDescriptors(nav)).includes("webdriver");

  // Plugins 異常（無頭瀏覽器沒有 Plugins，例如一些瀏覽器的插件，包括 PDF 查看器）
  const plugins = nav?.plugins || [];
  const pluginList = Object.values(
    Object.getOwnPropertyDescriptors(plugins)
  ).map((p) => p.value);
  // 如果是觸屏的話就不檢測 plugins
  const hasAnomalyPlugins = isTouchScreen
    ? false
    : // 如果 plugins 不存在或是沒有 plugins，是爬蟲
      plugins.length === 0 ||
      pluginList.length === 0 ||
      // 沒有 namedItem 的情況，不正常，是爬蟲
      pluginList.length === plugins.length ||
      // 如果 plugins 裡面的東西不是 Plugin 這個類，是爬蟲
      !pluginList.every((p) => p.constructor === Plugin);

  // language(s) 不存在（只有較舊的無頭請求才被抓到）
  const hasAnomalyLanguages = !language || !languages || languages.length === 0;

  // navigator.platform 和 userAgent 中的 platform 不符合
  const platfromIsNotSame = dev
    ? false
    : !userAgent.includes(
        platform.startsWith("Win")
          ? "Win"
          : platform.startsWith("Linux")
          ? "Linux"
          : platform.startsWith("Mac")
          ? "Mac"
          : platform
      );

  // Chrome 瀏覽器沒有 window.chrome 屬性
  const chromeIsAnomaly =
    ["Chrome", "Edge", "Opera"].includes(ua.browser?.name || "") && !chrome;

  // 检测 cdc 属性是否存在
  const cdcExists = (() => {
    const cdcDetectionMap = new Map(
      [Array, Object, Proxy, Promise, JSON, Symbol].map((i) => [i, 0])
    );
    for (const key of Object.keys(Object.getOwnPropertyDescriptors(win))) {
      if (/^cdc_/i.test(key) || /^\$cdc_/i.test(key)) return true;
      const value: any = win[key as any];
      if (cdcDetectionMap.has(value)) {
        cdcDetectionMap.set(value, cdcDetectionMap.get(value)! + 1);
        if (cdcDetectionMap.get(value)! > 1) return true;
      }
    }
    return false;
  })();

  const details = Object.freeze({
    wd: isWebdriver,
    pg: hasAnomalyPlugins,
    lg: hasAnomalyLanguages,
    pf: platfromIsNotSame,
    cr: chromeIsAnomaly,
    cd: cdcExists,
  });

  return Object.freeze({
    value: !Object.values(details).every((i) => !i),
    details,
  });
}
