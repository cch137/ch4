"use client";

import { Button } from "@nextui-org/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import FullpageSpinner from "@/app/components/fullpage-spiner";
import { discordLink, SIGNIN_PATHNAME } from "@/constants/app";
import NotFound from "@/app/not-found";

export default function UserProfile() {
  const params = useParams();
  const userId: string = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;

  switch (userId.toLowerCase()) {
    case "login":
      return <FullpageSpinner redirectTo={SIGNIN_PATHNAME} />;
    case "logout":
      return <FullpageSpinner redirectTo={`/auth/signout`} />;
    case "signin":
    case "signout":
    case "reset-password":
    case "signup":
      return <FullpageSpinner redirectTo={`/auth/${userId}`} />;
    case "dc":
    case "discord":
      return <FullpageSpinner redirectTo={discordLink} />;
  }

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
