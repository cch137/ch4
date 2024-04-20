"use client";

import FullpageSpinner from "@/app/components/fullpage-spiner";
import { SIGNOUT_PATHNAME } from "@/constants/app";

export default function AuthRedirect() {
  return <FullpageSpinner redirectTo={SIGNOUT_PATHNAME} />;
}
