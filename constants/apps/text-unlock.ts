export const TEXTUNLOCK_PATHNAME = `/apps/text-unlock`;
export const STEPBYSTEP_PATHNAME = `/apps/step-by-step`;
export const stepByStepBookPathname = (isbn: string) =>
  `/apps/step-by-step/${isbn}`;
export const viewProblemPathname = (isbn_c_p: string, link: string) =>
  `/view/text-ans/i/${isbn_c_p}/${link}`;
export const getQueryJSONUrl = (s: string) =>
  `https://raw.githubusercontent.com/cch137/ggehc/main/query/${s}.json`;
