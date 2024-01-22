'use client'
import Link from 'next/link';
import { NextUIProvider, Button, Spacer } from '@nextui-org/react'
import { HiChatBubbleOvalLeftEllipsis, HiCurrencyDollar, HiCalculator, HiBookmarkSquare } from "react-icons/hi2";

function Home() {
  return (
    <div className="flex justify-center">
      <div className="max-w-[1024px] w-full px-6 py-12">
        <h1 className="text-2xl font-bold">Free AI Chat</h1>
        <div className="py-2">
          <Button
            as={Link}
            href="/c/"
            startContent={<div className="scale-125"><HiChatBubbleOvalLeftEllipsis/></div>}
            color="primary"
            className="font-semibold"
            variant="shadow"
          >
            AI Chat
          </Button>
        </div>
        <Spacer y={8} />
        <h1 className="text-2xl font-bold">Useful Tools</h1>
        <div className="flex flex-wrap py-2 gap-4 items-center">
          <Button
            as={Link}
            href="/"
            startContent={<div className="scale-125"><HiChatBubbleOvalLeftEllipsis/></div>}
            color="secondary"
            className="font-semibold"
          >
            QR Code Generator
          </Button>
          <Button
            as={Link}
            href="/"
            startContent={<div className="scale-125"><HiCurrencyDollar/></div>}
            color="secondary"
            className="font-semibold"
          >
            Currency Converter
          </Button>
          <Button
            as={Link}
            href="/"
            startContent={<div className="scale-125"><HiCalculator/></div>}
            color="secondary"
            className="font-semibold"
          >
            Matrix Calculator
          </Button>
          <Button
            as={Link}
            href="/"
            startContent={<div className="scale-125"><HiBookmarkSquare/></div>}
            color="secondary"
            className="font-semibold"
          >
            LS
          </Button>
        </div>
        <Spacer y={8} />
        <h1 className="text-2xl font-bold">Join our Discord community!</h1>
        <div className="flex flex-wrap py-2 gap-4 items-center">
          <Button
            as={Link}
            href="https://discord.gg/5v49JKKmzJ"
            target="_blank"
            startContent={<div className="scale-125"><img height={"20px"} width={"20px"} src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"/></div>}
            // color="primary"
            className="font-semibold"
            variant="bordered"
          >
            Join
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <NextUIProvider>
      <Home />
    </NextUIProvider>
  )
}
