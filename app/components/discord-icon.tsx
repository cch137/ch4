import Image from 'next/image'

export default function DiscordIcon() {
  return <div className="scale-125" style={{width: 20}}>
    <Image
      height={20}
      width={20}
      alt="Discord"
      className="pointer-events-none"
      src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
    />
  </div>
}
