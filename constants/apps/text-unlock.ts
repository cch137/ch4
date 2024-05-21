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
  const view = `/view/text-ans/${isbn_c_p}${isCached ? "" : "/" + link}`;
  const preview = isCached ? getStaticLink(isbn_c_p) : view;
  return { view, preview };
};
export const getQueryJSONUrl = (s: string) =>
  `https://raw.githubusercontent.com/cch137/ggehc/main/query/${s}.json`;
export type Problem = {
  isbn_c_p: string;
  link: string;
};
export function sortChapterProblems(problems: Problem[]) {
  return (
    problems
      .map(({ isbn_c_p, link }) => ({
        isbn_c_p,
        p: isbn_c_p.split("_").at(-1)!,
        link,
      }))
      .map((item) => {
        const numeric = Number(
          item.p
            .split("")
            .filter((i) => "1234567890".includes(i))
            .join("")
        );
        const alphabetic = item.p
          .split("")
          .filter((i) => !"1234567890".includes(i))
          .join("");
        return { item, numeric, alphabetic };
      })
      .sort((a, b) => a.numeric - b.numeric)
      // .sort((a, b) => {
      //   if (a.alphabetic > b.alphabetic) return 1;
      //   if (a.alphabetic < b.alphabetic) return -1;
      //   return 0;
      // })
      .map(({ item: { p, isbn_c_p, link } }) => ({ p, isbn_c_p, link }))
  );
}
