import {
  Noto_Sans,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_HK,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Serif,
  Noto_Serif_SC,
  Noto_Serif_TC,
  Noto_Serif_HK,
  Noto_Serif_JP,
  Noto_Serif_KR,
} from "next/font/google";
import type { NextFont } from "next/dist/compiled/@next/font/dist/types";

const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], weight: "300" });
const notoSansTC = Noto_Sans_TC({ subsets: ["latin"], weight: "300" });
const notoSansHK = Noto_Sans_HK({ subsets: ["latin"], weight: "300" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: "300" });
const notoSansKR = Noto_Sans_KR({ subsets: ["latin"], weight: "300" });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: "400" });

const notoSerifSC = Noto_Serif_SC({ subsets: ["latin"], weight: "300" });
const notoSerifTC = Noto_Serif_TC({ subsets: ["latin"], weight: "300" });
const notoSerifHK = Noto_Serif_HK({ subsets: ["latin"], weight: "300" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: "300" });
const notoSerifKR = Noto_Serif_KR({ subsets: ["latin"], weight: "300" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: "400" });

const mergeFonts = (className: string, fonts: NextFont[]): NextFont => {
  const style = fonts.reduce(
    ({ fontFamilies }, { style: { fontFamily } }, i, a) => {
      fontFamilies.add(fontFamily);
      return { fontFamilies };
    },
    {
      fontFamilies: new Set<string>(),
    }
  );
  return {
    className: className,
    style: {
      fontFamily: [...style.fontFamilies].join(",").replace(/,[\s]+/g, ","),
    },
  };
};

const sansFont = mergeFonts("sans-font", [
  notoSans,
  notoSansTC,
  notoSansSC,
  notoSansHK,
  notoSansJP,
  notoSansKR,
]);

const serifFont = mergeFonts("serif-font", [
  notoSerif,
  notoSerifTC,
  notoSerifSC,
  notoSerifHK,
  notoSerifJP,
  notoSerifKR,
]);

export const sansFontClassname = sansFont.className;
export const serifFontClassname = serifFont.className;

export const css = [sansFont, serifFont]
  .map(
    ({ className, style: { fontFamily } }) =>
      `.${className}{font-family:${fontFamily}}`
  )
  .join("");
