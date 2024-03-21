import {
  Noto_Sans,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Noto_Sans_HK,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Serif_TC,
} from 'next/font/google'
import type { NextFont } from 'next/dist/compiled/@next/font/dist/types'

export const notoSansSC = Noto_Sans_SC({subsets: ['latin'], weight: '300'});
export const notoSansTC = Noto_Sans_TC({subsets: ['latin'], weight: '300'});
export const notoSansHK = Noto_Sans_HK({subsets: ['latin'], weight: '300'});
export const notoSansJP = Noto_Sans_JP({subsets: ['latin'], weight: '300'});
export const notoSansKR = Noto_Sans_KR({subsets: ['latin'], weight: '300'});
export const notoSans = Noto_Sans({subsets: ['latin'], weight: '400'});

export const notoSerifTC = Noto_Serif_TC({subsets: ['latin'], weight: '300'});

export const fonts = [
  notoSans,
  notoSansTC,
  notoSansSC,
  notoSansHK,
  notoSansJP,
  notoSansKR,
];

const styles = fonts.reduce(({fontFamilies}, {style: {fontFamily}}, i, a) => {
  fontFamilies.add(fontFamily);
  return {fontFamilies};
}, {
  fontFamilies: new Set<string>(),
});

export const font: NextFont = {
  className: 'default-font',
  style: {
    fontFamily: [...styles.fontFamilies].join(',').replace(/,[\s]+/g, ','),
  }
}

export const fontClassName = font.className;

export default fonts;
