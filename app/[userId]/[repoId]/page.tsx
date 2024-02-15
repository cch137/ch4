'use client'

import { Button } from "@nextui-org/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import NotFound from "@/app/not-found";

export default function App() {
  const params = useParams();
  const userId: string = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const repoId: string = Array.isArray(params.repoId) ? params.repoId[0] : params.repoId;

  switch (userId.toLowerCase() + '/' + repoId.toLocaleLowerCase()) {
    case 'tools/ls': // old stuff redirect
      return <FullpageSpinner redirectTo={'/apps/harimau'} />
  }

  return <NotFound />

  return (
    <div>
      <h1>User: {userId}</h1>
      <h1>Repository: {repoId}</h1>
      <div>
        <Link href="/">
          <Button
            href="/"
            color="primary"
            className="font-semibold pointer-events-none"
            variant="shadow"
          >
            Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
