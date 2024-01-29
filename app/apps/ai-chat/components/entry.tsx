'use client';

import { Button } from '@nextui-org/button';
import { Link } from "@nextui-org/link";

export default function Entry({
  appPath,
  isSmallScreen,
}: {
  appPath: string,
  isSmallScreen: boolean,
}) {
  return (<>
    <div className="flex-center px-8" style={{height: 'calc(100dvh - 4rem)'}}>
      <div className="flex flex-col gap-8 w-full max-w-4xl">
        <h1 className="text-6xl font-bold">AI Chat</h1>
        <section className="text-xl">
          <p>A simple AI chat app by @cch137.</p>
          <p>Offers various models for free.</p>
          <p>This is for everyone.</p>
        </section>
        <div className="pt-4 py-8">
          <Button
            size="lg"
            color="secondary"
            className="rounded-full"
            variant="shadow"
            as={Link}
            href={`/auth/signin?next=/${appPath}/`}
          >
            Sign in
          </Button>
        </div>
      </div>
      {isSmallScreen ? null : (<>
        <div className="relative flex-center w-0">
          <div className="crystal-outer absolute flex-center right-0">
            <div className="crystal" />
            <div className="crystal" />
            <div className="crystal" />
          </div>
        </div>
      </>)}
    </div>
  </>)
}
