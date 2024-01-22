import type { Metadata } from "next"
import { appTitle } from "@/constants/app"
import { Button } from "@nextui-org/button"
import Link from "next/link"

const description = 'This page could not be found.'

export const metadata: Metadata = {
  title: appTitle('404 Not Found'),
  description,
}

export default function NotFound() {
  return (<>
    <title>{appTitle('404 Not Found')}</title>
    <div className="fixed top-0 left-0 z-50 flex-center w-screen h-screen select-none">
      <div className="flex-center flex-col gap-12">
        <div className="flex-center gap-4">
          <div className="text-2xl font-bold">404</div>
          <div className="h-10 border-1 border-default-600"></div>
          <div>{description}</div>
        </div>
        <div>
          <Button color="secondary" href="/" variant="ghost" as={Link}>Back to Home</Button>
        </div>
      </div>
    </div>
  </>)
}
