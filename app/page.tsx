"use client";

import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Image } from "@nextui-org/image";
import { Spacer } from "@nextui-org/spacer";
import { Tooltip } from "@nextui-org/tooltip";

import MainLayout from "@/app/components/MainLayout";

type LinkItem = {
  title: string;
  description?: string;
  link: string;
  icon?: string;
  roundIcon?: boolean;
  whiteBg?: boolean;
};

function LinkCard(item: LinkItem | { item: LinkItem }) {
  const {
    title,
    description,
    link,
    icon = "/favicon.ico",
    roundIcon = false,
    whiteBg = false,
  } = "item" in item ? item.item : item;
  const isExternal = /^(\/\/|http:\/\/|https:\/\/|file:\/\/)/.test(link);
  return (
    <div
      className="flex justify-start items-start
    xl:w-32 lg:w-32 md:w-32 sm:w-24
    xl:max-w-[18%] lg:max-w-[24%] md:max-w-[32%] sm:max-w-[40%]
    xl:flex-[18%] lg:flex-[24%] md:flex-[32%] sm:flex-[40%]"
    >
      <Tooltip
        placement="bottom"
        showArrow
        title={title}
        content={description || title}
        classNames={{
          content: "text-default-600",
        }}
      >
        <Link
          href={link}
          target={isExternal ? "_blank" : void 0}
          className="block group w-full h-[72px] py-4 px-3 rounded-md flex-auto bg-neutral-900 text-default-500 hover:text-default-600 transition ease-in-out hover:-translate-y-1"
        >
          <div className="flex-center gap-2 flex-1">
            <div className="flex-center w-10 h-10">
              <Image
                src={icon}
                alt={title}
                height={40}
                width={40}
                className={`${roundIcon ? "rounded-full" : ""} ${
                  whiteBg ? "bg-white" : ""
                }`}
              />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="text-md font-bold truncate">{title}</div>
              <div className="text-xs text-default-400 truncate">
                {description || title}
              </div>
            </div>
            <div className="text-default-300 text-sm border-1 border-solid border-current rounded-full transition group-hover:brightness-125 group-hover:shadow-[0_0_3px_var(--tw-shadow-color)] group-hover:shadow-default-300">
              <MdKeyboardArrowRight />
            </div>
          </div>
        </Link>
      </Tooltip>
    </div>
  );
}

const apps: LinkItem[] = [
  {
    title: "AI Chat",
    description: "A simple AI chat app",
    link: "/apps/ai-chat",
  },
  {
    title: "AI Asst",
    description: "Timer-based task executor",
    link: "/apps/ai-asst",
  },
  {
    title: "Silence",
    description: "白噪音生成器",
    link: "/view/silence",
    icon: "/assets/icons/whitenoise.jpg",
  },
  {
    title: "IMG to PDF",
    link: "/apps/ncu/images-to-pdf",
    icon: "/assets/icons/img-to-pdf.jpg",
  },
  {
    title: "Text Unlock",
    description: "數本舊教科書的答案",
    link: "/apps/text-unlock",
    icon: "/assets/icons/text-unlock.jpg",
  },
  {
    title: "天氣 API",
    link: "/apps/ncu/weather",
    icon: "/assets/icons/weather.jpg",
  },
  {
    title: "甲骨文速查",
    link: "/apps/ncu/oracle",
    icon: "/assets/icons/oracle-bone.jpg",
  },
  {
    title: "Maze",
    description: "迷宮生成器與路徑搜尋",
    link: "/apps/lab/maze",
    icon: "/assets/icons/maze.jpg",
  },
  {
    title: "洗衣房",
    link: "/apps/ncu/laundry",
    icon: "/assets/icons/laundry.jpg",
  },
];

const aiApps: LinkItem[] = [
  {
    title: "ChatGPT",
    description: "By OpenAI",
    link: "//chat.openai.com",
    icon: "//chat.openai.com/favicon.ico",
  },
  {
    title: "Gemini",
    description: "By Google",
    link: "//gemini.google.com",
    icon: "//www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png",
  },
  {
    title: "Claude",
    description: "By Anthropic",
    link: "//claude.ai",
    icon: "//claude.ai/favicon.ico",
  },
  {
    title: "Perplexity",
    description: "AI 搜索引擎",
    link: "//www.perplexity.ai/",
    icon: "//nav.afmobi.com/wp-content/uploads/2024/02/eb7d4-www.perplexity.ai.png",
  },
  {
    title: "WolframAlpha",
    link: "//www.wolframalpha.com/",
    icon: "//www.wolframalpha.com/favicon.ico",
  },
  {
    title: "AIVA",
    description: "AI 音樂創作工具",
    link: "//www.aiva.ai//",
    icon: "//www.aiva.ai/assets/img/favicon.ico",
  },
  {
    title: "YOU",
    description: "AI 搜索引擎",
    link: "//you.com/",
    icon: "//you.com/favicon/apple-touch-icon-57x57.png",
  },
  {
    title: "DALL·E",
    description: "By OpenAI",
    link: "//labs.openai.com/",
    icon: "//labs.openai.com/favicon.ico",
  },
  {
    title: "GateKeep",
    description: "數理教學影片生成",
    link: "//app.gatekeep.ai/",
    icon: "//app.gatekeep.ai/favicon.ico",
  },
];

const otherTools: LinkItem[] = [
  {
    title: "Google 翻譯",
    link: "//translate.google.com",
    icon: "//translate.google.com/favicon.ico",
  },
  {
    title: "GitHub",
    description: "GitHub",
    link: "//github.com",
    icon: "//github.com/favicon.ico",
    roundIcon: true,
    whiteBg: true,
  },
  // {
  //   title: "LibGen",
  //   description: "Library Genesis",
  //   link: "//libgen.is",
  //   icon: "//libgen.is/favicon.ico",
  // },
];

export default function Cyberpunk() {
  return (
    <MainLayout>
      <h1 className="font-bold text-xl pl-2">本站應用</h1>
      <div className="flex flex-wrap py-3 gap-4">
        {apps.map((l, i) => (
          <LinkCard item={l} key={i} />
        ))}
      </div>
      <Spacer y={4} />
      <h1 className="font-bold text-xl pl-2">AI 應用</h1>
      <div className="flex flex-wrap py-3 gap-4">
        {aiApps.map((l, i) => (
          <LinkCard item={l} key={i} />
        ))}
      </div>
      <Spacer y={4} />
      <h1 className="font-bold text-xl pl-2">其他工具</h1>
      <div className="flex flex-wrap py-3 gap-4">
        {otherTools.map((l, i) => (
          <LinkCard item={l} key={i} />
        ))}
      </div>
      <Spacer y={4} />
      <Spacer y={16} />
    </MainLayout>
  );
}
