const appName = 'CH4'
const discordLink = 'https://discord.gg/5v49JKKmzJ'

const appTitle = (...title: string[]) => title.length ? `${title.join(' ')} | ${appName}` : appName

export {
  appName,
  appTitle,
  discordLink,
}