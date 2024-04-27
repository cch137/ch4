"use client";

import type { Metadata } from "next";
import { appTitle } from "@/constants/app";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import useOrigin from "@/hooks/useOrigin";
import { MdCheck, MdContentCopy } from "react-icons/md";
import useCopyText from "@/hooks/useCopyText";

const description = "This page could not be found.";

const title = appTitle("Not Found");

export const metadata: Metadata = {
  title,
  description,
};

function _NotFound() {
  const origin = useOrigin();
  const pathname = usePathname();
  const link = `${origin}/apps/text-unlock`;
  const [copied, copyText] = useCopyText(link);
  switch (pathname) {
    // old stuff redirect
    case "/apps/ncu/text-ans":
    case "/apps/ncu/harimau":
    case "/tools/ls": {
      return (
        <>
          <title>{title}</title>
          <div className="fixed max-w-[480px] px-4 w-full text-default-600 z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div>{"The page you're looking for has been moved."}</div>
            <div>Please use the following link:</div>
            <div className="flex justify-start items-center gap-4 text-default-600 py-4">
              <Button
                as={Link}
                href={link}
                variant="flat"
                isLoading={!Boolean(origin)}
              >
                {link}
              </Button>
              <Button
                variant="light"
                isIconOnly
                onClick={copyText}
                as={copied ? Link : void 0}
                href={copied ? link : void 0}
                color={copied ? "success" : "default"}
                className={`${
                  copied ? "text-success-500" : ""
                } text-lg text-current`}
                isDisabled={!Boolean(origin)}
              >
                {copied ? (
                  <MdCheck className="text-success-500" />
                ) : (
                  <MdContentCopy />
                )}
              </Button>
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <>
      <title>{title}</title>
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex-center flex-col gap-12">
          <div className="flex-center gap-4 text-default-700">
            <div className="text-2xl font-semibold">404</div>
            <div className="h-10 border-1 border-default-500"></div>
            <div className="text-default-600">{description}</div>
          </div>
          <div>
            <Button href="/" variant="flat" as={Link}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NotFound() {
  return (
    <Suspense>
      <_NotFound />
    </Suspense>
  );
}
