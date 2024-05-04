"use client";

import "./signin-to-continue.css";

import { Button } from "@nextui-org/button";
import Link from "next/link";
import { signInHrefWithNext } from "@/constants/app";
import { useIsSmallScreen } from "@/hooks/useAppDataManager";

export default function SigninToContinue({
  nextPath: nextPath,
  title,
  descriptions,
}: {
  nextPath: string;
  title: string;
  descriptions: string[] | string;
}) {
  const isSmallScreen = useIsSmallScreen();
  return (
    <>
      <div
        className="flex-center px-8 h-full"
        style={{ height: "calc(80dvh)" }}
      >
        <div className="flex flex-col gap-8 w-full max-w-4xl">
          <h1 className="text-6xl font-bold">{title}</h1>
          <section className="text-xl">
            {(typeof descriptions === "string"
              ? [descriptions]
              : descriptions
            ).map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </section>
          <div className="pt-4 py-8">
            <Button
              size="lg"
              color="secondary"
              className="rounded-full"
              variant="shadow"
              as={Link}
              href={signInHrefWithNext(nextPath)}
            >
              Sign in
            </Button>
          </div>
        </div>
        {isSmallScreen ? null : (
          <>
            <div className="relative flex-center w-0">
              <div className="crystal-outer absolute flex-center right-0">
                <div className="crystal" />
                <div className="crystal" />
                <div className="crystal" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
