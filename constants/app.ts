export const appName = "137";
export const discordLink = "https://discord.gg/5v49JKKmzJ";

export const appTitle = (...title: string[]) =>
  title.length ? `${title.join(" ")} | ${appName}` : appName;

export const CONTENT_MAX_W = 765;
