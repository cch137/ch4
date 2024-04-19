"use client";

import FullpageSpinner from "@/app/components/fullpage-spiner";
import { SIGNIN_PATHNAME } from "@/constants/app";

export default function AuthRedirect() {
  return <FullpageSpinner redirectTo={SIGNIN_PATHNAME} />;
}
