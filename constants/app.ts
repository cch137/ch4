export const appName = "137";
export const discordLink = "https://discord.gg/5v49JKKmzJ";

export const appTitle = (...title: string[]) =>
  title.length ? `${title.join(" ")} | ${appName}` : appName;

export const CONTENT_MAX_W = 765;

export const SIGNIN_PATHNAME = "/auth/signin";
export const SIGNUP_PATHNAME = "/auth/signup";
export const SIGNOUT_PATHNAME = "/auth/signout";
export const RESETPW_PATHNAME = "/auth/reset-password";

export const SIGNUPDONE_PATHNAME = "/auth/signup/done";
export const RESETPWDONE_PATHNAME = "/auth/reset-password/done";

export const PROFILE_PATHNAME = "/profile";

const withNext = (pathname: string, next?: string | null) =>
  `${pathname}/?next=${next || "/"}`;
export const signInHrefWithNext = (next?: string | null) =>
  withNext(SIGNIN_PATHNAME, next);
export const signUpHrefWithNext = (next?: string | null) =>
  withNext(SIGNUP_PATHNAME, next);
export const signOutHrefWithNext = (next?: string | null) =>
  withNext(SIGNOUT_PATHNAME, next);
export const resetPwHrefWithNext = (next?: string | null) =>
  withNext(RESETPW_PATHNAME, next);
