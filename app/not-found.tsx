"use client";

import type { Metadata } from "next";
import {
  appTitle,
  discordLink,
  RESETPW_PATHNAME,
  SIGNIN_PATHNAME,
  SIGNOUT_PATHNAME,
} from "@/constants/app";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useOrigin from "@/hooks/useOrigin";
import { MdCheck, MdContentCopy } from "react-icons/md";
import useCopyText from "@/hooks/useCopyText";
import PageSpinner from "../components/PageSpinner";
import sleep from "@/utils/sleep";

const title = appTitle("Not Found");
const description = "This page could not be found.";

export const metadata: Metadata = {
  title,
  description,
};

const getAutoRedirectPathname = (
  pathname: string,
  origin: string = ""
): { to: string; auto?: boolean } | null => {
  switch (pathname.toLowerCase()) {
    case "/apps/ncu/text-ans":
    case "/apps/ncu/harimau":
    case "/tools/ls": {
      return { to: `${origin}/apps/text-unlock`, auto: false };
    }
    case "/login":
    case "/signin":
    case "/auth/login": {
      return { to: SIGNIN_PATHNAME };
    }
    case "/logout":
    case "/signout":
    case "/auth/logout": {
      return { to: SIGNOUT_PATHNAME };
    }
    case "/reset-password": {
      return { to: RESETPW_PATHNAME };
    }
    case "/dc":
    case "/discord": {
      return { to: discordLink };
    }
  }
  return null;
};

export function Redirect({
  to,
  auto = true,
  isLoading = false,
  label,
  sleep: _sleepMs,
  callback,
}: {
  to: string;
  auto?: boolean;
  isLoading?: boolean;
  label?: string;
  sleep?: number;
  callback?: Function;
}) {
  const router = useRouter();
  const [copied, copyText] = useCopyText(to || "");

  if (auto)
    return (
      <>
        <title>Redirecting...</title>
        <PageSpinner
          task={async () => {
            const sleeping = sleep(_sleepMs);
            if (callback) await callback();
            router.replace(to);
            await sleeping;
          }}
          label={label}
        />
      </>
    );

  return (
    <>
      <title>Redirecting...</title>
      <div className="fixed max-w-[480px] px-4 w-full text-default-600 z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div>{"The page you're looking for has been moved."}</div>
        <div>Please use the following link:</div>
        <div className="flex justify-start items-center gap-4 text-default-600 py-4">
          <Button as={Link} href={to} variant="flat" isLoading={isLoading}>
            {to}
          </Button>
          <Button
            variant="light"
            isIconOnly
            onClick={copyText}
            as={copied ? Link : void 0}
            href={copied ? to : void 0}
            color={copied ? "success" : "default"}
            className={`${
              copied ? "text-success-500" : ""
            } text-lg text-current`}
            isDisabled={isLoading}
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

export function NotFoundComponent() {
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

function _NotFound({ to: redirectTo, auto }: { to?: string; auto?: boolean }) {
  const origin = useOrigin();
  const pathname = usePathname();
  const search = useSearchParams();
  const redirect = getAutoRedirectPathname(pathname, origin);

  if (redirectTo) return <Redirect to={redirectTo} auto={auto} />;
  if (redirect)
    return (
      <Redirect
        to={`${redirect.to}?${search.toString()}`}
        auto={redirect.auto}
        isLoading={!Boolean(origin)}
      />
    );
  return <NotFoundComponent />;
}

export default function NotFound({ redirectTo }: { redirectTo?: string }) {
  return (
    <Suspense>
      <_NotFound to={redirectTo} />
    </Suspense>
  );
}
