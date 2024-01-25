'use client'

import Link from 'next/link';
import { Button } from '@nextui-org/button'
import { Spacer } from '@nextui-org/spacer'
import { HiChatBubbleOvalLeftEllipsis, HiCurrencyDollar, HiCalculator, HiBookmarkSquare } from "react-icons/hi2";
import { discordLink } from '@/constants/app';
import AppNavbar from '@/app/components/app-navbar'
import DiscordIcon from '@/app/components/discord-icon'
import useVersion from '@/hooks/useVersion';

export default function App() {
  const version = useVersion();
  return (<>
    <AppNavbar />
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
        {/* <h1 className="text-2xl font-bold">Useful Tools</h1>
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
            href="/apps/currency"
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
            href="/apps/harimau"
            startContent={<div className="scale-125"><HiBookmarkSquare/></div>}
            color="secondary"
            className="font-semibold"
          >
            Harimau
          </Button>
        </div>
        <Spacer y={8} /> */}
        <h1 className="text-2xl font-bold">Join our Discord community!</h1>
        <div className="flex flex-wrap py-2 gap-4 items-center">
          <Button
            as={Link}
            href={discordLink}
            target="_blank"
            startContent={<DiscordIcon />}
            color="secondary"
            className="font-semibold"
            variant="bordered"
          >
            Join
          </Button>
        </div>
        <Spacer y={8} />
        <div className="text-default-400 text-sm">
          <div>{version ? `version: ${version}` : ''}</div>
        </div>
      </div>
    </div>
  </>)
}
