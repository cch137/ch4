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
} from 'next/font/google'
import type { NextFont } from 'next/dist/compiled/@next/font/dist/types'

export const notoSansSC = Noto_Sans_SC({subsets: ['latin'], weight: '300'});
export const notoSansTC = Noto_Sans_TC({subsets: ['latin'], weight: '300'});
export const notoSansHK = Noto_Sans_HK({subsets: ['latin'], weight: '300'});
export const notoSansJP = Noto_Sans_JP({subsets: ['latin'], weight: '300'});
export const notoSansKR = Noto_Sans_KR({subsets: ['latin'], weight: '300'});
export const notoSans = Noto_Sans({subsets: ['latin'], weight: '400'});

export const notoSerifSC = Noto_Serif_SC({subsets: ['latin'], weight: '300'});
export const notoSerifTC = Noto_Serif_TC({subsets: ['latin'], weight: '300'});
export const notoSerifHK = Noto_Serif_HK({subsets: ['latin'], weight: '300'});
export const notoSerifJP = Noto_Serif_JP({subsets: ['latin'], weight: '300'});
export const notoSerifKR = Noto_Serif_KR({subsets: ['latin'], weight: '300'});
export const notoSerif = Noto_Serif({subsets: ['latin'], weight: '400'});

const sansFonts = [
  notoSans,
  notoSansTC,
  notoSansSC,
  notoSansHK,
  notoSansJP,
  notoSansKR,
];

const serifFonts = [
  notoSerif,
  notoSerifTC,
  notoSerifSC,
  notoSerifHK,
  notoSerifJP,
  notoSerifKR,
];

const mergeFonts = (className: string, fonts: NextFont[]): NextFont => {
  const style = fonts.reduce(({fontFamilies}, {style: {fontFamily}}, i, a) => {
    fontFamilies.add(fontFamily);
    return {fontFamilies};
  }, {
    fontFamilies: new Set<string>(),
  });
  return {
    className,
    style: {
      fontFamily: [...style.fontFamilies].join(',').replace(/,[\s]+/g, ','),
    }
  }
}

export const sansFont = mergeFonts('silence-font', sansFonts);
export const serifFont = mergeFonts('default-font', serifFonts);

export const sansClassName = sansFont.className;
export const serifClassName = serifFont.className;
