import { Noto_Sans, Noto_Sans_SC, Noto_Sans_TC, Noto_Sans_HK, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google'
import type { NextFont } from 'next/dist/compiled/@next/font/dist/types'

const notoSansSC = Noto_Sans_SC({subsets: ['latin']});
const notoSansTC = Noto_Sans_TC({subsets: ['latin']});
const notoSansHK = Noto_Sans_HK({subsets: ['latin']});
const notoSansJP = Noto_Sans_JP({subsets: ['latin']});
const notoSansKR = Noto_Sans_KR({subsets: ['latin']});
const notoSans = Noto_Sans({subsets: ['latin']});

export const fonts = [
  notoSansTC,
  notoSansSC,
  notoSansHK,
  notoSansJP,
  notoSansKR,
  notoSans,
];

const styles = fonts.reduce(({fontFamilies, fontStyles}, {style: {fontFamily, fontStyle}}, i, a) => {
  fontFamilies.add(fontFamily);
  if (fontStyle) fontStyles.add(fontStyle);
  return {fontFamilies, fontStyles};
}, {
  fontFamilies: new Set<string>(),
  fontStyles: new Set<string>(),
});

export const font: NextFont = {
  className: 'default-font',
  style: {
    fontFamily: [...styles.fontFamilies].join(',').replace(/,[\s]+/g, ','),
    fontStyle: [...styles.fontStyles].join(' '),
  }
}

export const fontClassName = font.className;

export default fonts;
