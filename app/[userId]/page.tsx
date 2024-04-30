"use client";

import { Button } from "@nextui-org/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import NotFound from "@/app/not-found";

export default function UserProfile() {
  const params = useParams();
  const userId: string = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  return <NotFound />;

  return (
    <div>
      <h1>User: {userId}</h1>
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
  );
}
