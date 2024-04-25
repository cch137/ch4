export const TEXTUNLOCK_PATHNAME = `/apps/text-unlock`;
export const textUnlockBookPathname = (isbn: string) =>
  `/apps/text-unlock/${isbn}`;
export const getStaticLink = (isbn_c_p: string) =>
  `https://raw.githubusercontent.com/cch137/ggehc/main/static/${
    isbn_c_p.split("_")[0]
  }/${isbn_c_p}.png`;
export const getProblemLinks = (
  isbn_c_p: string,
  link: string,
  isCached: boolean
) => {
  const view = isCached
    ? `/view/text-ans/s/${isbn_c_p}`
    : `/view/text-ans/i/${isbn_c_p}/${link}`;
  const preview = isCached ? getStaticLink(isbn_c_p) : view;
  return { view, preview };
};
export const getQueryJSONUrl = (s: string) =>
  `https://raw.githubusercontent.com/cch137/ggehc/main/query/${s}.json`;
