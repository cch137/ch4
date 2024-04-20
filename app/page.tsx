"use client";

import Link from "next/link";
import {} from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Image } from "@nextui-org/image";
import { Tooltip } from "@nextui-org/react";

import MainLayout from "@/app/components/MainLayout";

function LoremIpsum() {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere
        diam scelerisque, scelerisque est ut, euismod nulla. Mauris rhoncus ex
        eu tellus rhoncus lobortis. Nullam in blandit nulla. Morbi et mauris
        ornare eros gravida tristique. Class aptent taciti sociosqu ad litora
        torquent per conubia nostra, per inceptos himenaeos. Curabitur
        sollicitudin felis nec leo accumsan, eget accumsan nisl maximus. Aenean
        facilisis orci vitae purus bibendum auctor. Etiam consequat velit nibh,
        et pretium mauris volutpat eget.
      </p>
      <p>
        Vivamus pharetra venenatis augue ornare dignissim. Aliquam in sapien
        lorem. Cras id ultrices lorem. Pellentesque habitant morbi tristique
        senectus et netus et malesuada fames ac turpis egestas. Aenean sit amet
        felis lacus. Praesent mollis ipsum purus, in fringilla augue sodales ut.
        In posuere rhoncus viverra. Ut porta arcu semper placerat rhoncus.
        Vivamus et lorem nulla. Nulla convallis metus nulla, gravida vulputate
        elit consectetur at.
      </p>
      <p>
        Sed ante sapien, rhoncus sit amet nisl quis, placerat tincidunt arcu. Ut
        efficitur, tellus ac mollis ullamcorper, turpis augue vehicula purus, et
        semper nisi ante vitae risus. Cras quis nunc quis nunc varius vehicula.
        In id turpis nec ante scelerisque maximus sed at enim. Morbi ut leo eu
        mi consequat laoreet sit amet ac sapien. Sed sagittis feugiat arcu
        iaculis congue. Morbi efficitur laoreet ultricies. Curabitur interdum
        urna id orci pharetra convallis. Donec vel elit ac eros porttitor
        tempus. Nullam ut leo porttitor, accumsan arcu vitae, pharetra justo.
        Integer scelerisque, est a tincidunt feugiat, ipsum neque hendrerit
        arcu, in rutrum mauris sem ut purus. Fusce pretium varius placerat.
        Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam at
        hendrerit ante, in euismod ante.
      </p>
      <p>
        Duis quis felis placerat, mollis turpis at, varius dui. Aenean vehicula
        eros eu quam pulvinar vestibulum. Morbi in purus blandit, commodo neque
        vel, tristique ante. Quisque sagittis urna porta porta scelerisque. Cras
        bibendum lorem in purus pharetra, et interdum libero tempus. Integer
        blandit libero nunc, at elementum turpis euismod in. In porta varius
        ante. Fusce egestas felis nulla, pulvinar sodales nisi sollicitudin ut.
      </p>
      <p>
        Vestibulum mattis sem nunc, et facilisis ipsum bibendum sed. Curabitur
        diam magna, porttitor blandit imperdiet quis, scelerisque non neque.
        Vestibulum varius vitae mauris pulvinar congue. Suspendisse potenti. Sed
        vitae fermentum risus. Vivamus vel pretium purus. Nunc commodo, ipsum
        luctus venenatis tempus, nisl nisl tincidunt magna, ut lobortis arcu leo
        in metus. Aliquam posuere imperdiet purus, sit amet ullamcorper tortor
        mollis id. Aliquam commodo consectetur tempus. Curabitur consequat nisi
        id tellus pharetra, non vestibulum diam accumsan. Nunc sed ex vitae arcu
        lobortis fermentum.
      </p>
    </>
  );
}

function LinkCard({
  title,
  description,
  link,
  icon = "/favicon.ico",
}: {
  title: string;
  description?: string;
  link: string;
  icon?: string;
}) {
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
          className="block group w-full h-[72px] py-4 px-3 rounded-md flex-auto bg-neutral-900 text-default-500 hover:text-default-600 transition ease-in-out hover:-translate-y-1"
        >
          <div className="flex-center gap-2 flex-1">
            <div className="flex-center w-10 h-10">
              <Image src={icon} height={40} width={40} />
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

const data = [
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
  },
  {
    title: "IMG to PDF",
    link: "/apps/ncu/images-to-pdf",
  },
  {
    title: "Text Unlock",
    description: "數本舊教科書的答案",
    link: "/apps/text-unlock",
  },
  {
    title: "天氣 API",
    link: "/apps/ncu/weather",
  },
  {
    title: "甲骨文速查",
    link: "/apps/ncu/oracle",
  },
  {
    title: "Maze",
    description: "迷宮生成器與路徑搜尋",
    link: "/apps/lab/maze",
  },
  {
    title: "洗衣房",
    link: "/apps/ncu/laundry",
  },
];

export default function Cyberpunk() {
  return (
    <MainLayout>
      <h1 className="font-bold text-xl pl-2">本站應用</h1>
      <div className="flex flex-wrap py-3 gap-4">
        {data.map((d, i) => (
          <LinkCard
            title={d.title}
            description={d.description}
            link={d.link}
            key={i}
          />
        ))}
      </div>
      {new Array(4).fill(0).map((_, i) => (
        <LoremIpsum key={i} />
      ))}
    </MainLayout>
  );
}
