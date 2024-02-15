import type { Metadata } from "next"
import { appTitle } from "@/constants/app"
import { Button } from "@nextui-org/button"
import Link from "next/link"
import AppNavbar from "./components/app-navbar"

const description = 'This page could not be found.'

export const metadata: Metadata = {
  title: appTitle('404 Not Found'),
  description,
}

export default function NotFound() {
  return (<>
    <AppNavbar />
    <div className="fixed z-50" style={{top: '50%', left: '50%', transform: 'translate(-50%,-50%)'}}>
      <div className="flex-center flex-col gap-12">
        <div className="flex-center gap-4 text-default-700">
          <div className="text-2xl font-semibold">404</div>
          <div className="h-10 border-1 border-default-500"></div>
          <div className="text-default-600">{description}</div>
        </div>
        <div>
          <Button color="secondary" href="/" variant="ghost" as={Link}>Back to Home</Button>
        </div>
      </div>
    </div>
  </>)
}
