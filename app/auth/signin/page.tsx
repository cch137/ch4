"use client";

import { packData } from "@cch137/utils/shuttle";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Link as UiLink } from "@nextui-org/link";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import FullpageSpinner from "@/app/components/FullpageSpinner";
import { StatusResponse } from "@/constants/types";
import { useRouter, useSearchParams } from "next/navigation";
import useErrorMessage from "@/hooks/useErrorMessage";
import toolUrlParams from "@/app/tools/toolUrlParams";
import useUserInfo from "@/hooks/useUserInfo";
import { resetPwHrefWithNext, signUpHrefWithNext } from "@/constants/app";

export default function SignIn() {
  const variant = "underlined";
  const color = "secondary";
  const [pwIsVisible, setPwIsVisible] = useState(false);
  const [isPosting, setIsPosting] = useState<boolean | undefined>(false);
  const [form, setForm] = useState({ user: "", pass: "" });

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const redirectToNext = useCallback(() => {
    const path = toolUrlParams(location).get("next") || "/";
    return router.replace(path);
  }, [router]);

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();

  const { isPending, isLoggedIn, update: userUpdate } = useUserInfo();

  const post = async () => {
    setIsPosting(true);
    const res: StatusResponse = await (
      await fetch("/api/auth/signin", {
        method: "POST",
        body: packData(form, 70614, 1),
      })
    ).json();
    await userUpdate();
    if (res?.success) return redirectToNext();
    openErrorMessageBox(res?.message || "Failed to sign in");
    setIsPosting(false);
  };

  const redirected = useRef(false);
  useEffect(() => {
    if (redirected.current) return;
    if (isLoggedIn) {
      redirected.current = true;
      redirectToNext();
      setIsPosting(undefined);
    }
  }, [isLoggedIn, redirectToNext, setIsPosting]);

  if (isPending || isLoggedIn)
    return (
      <>
        {errorMessageBox}
        <FullpageSpinner />
      </>
    );

  return (
    <>
      {errorMessageBox}
      <div
        className="w-full flex-center pb-16 absolute left-0 top-14"
        style={{
          height: "calc(100dvh - 3rem)",
          // visibility: isPosting === undefined ? "hidden" : "visible",
        }}
      >
        <div className="w-unit-80 max-w-full flex flex-col gap-4">
          <h1 className="text-4xl text-center font-bold text-default-600">
            Sign in
          </h1>
          <div className="-m-1"></div>
          <Input
            label="Email / Username"
            variant={variant}
            color={color}
            type="text"
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            isDisabled={isPosting}
          />
          <Input
            label="Password"
            variant={variant}
            color={color}
            endContent={
              <button
                className="focus:outline-none text-2xl text-default-400"
                onClick={() => setPwIsVisible(!pwIsVisible)}
              >
                {pwIsVisible ? <IoEyeOff /> : <IoEye />}
              </button>
            }
            type={pwIsVisible ? "text" : "password"}
            onChange={(e) => setForm({ ...form, pass: e.target.value })}
            isDisabled={isPosting}
          />
          <div className="m-2"></div>
          <Button
            color={color}
            className="mx-12"
            onClick={post}
            isLoading={isPosting}
          >
            Sign in
          </Button>
          <div></div>
          <div className="text-default-500 flex-center flex-col">
            <div>
              <span>Create a new account! </span>
              <UiLink
                href={signUpHrefWithNext(next)}
                color={color}
                className="hover:underline"
                as={Link}
              >
                Sign up
              </UiLink>
            </div>
            <div>
              <UiLink
                href={resetPwHrefWithNext(next)}
                color={color}
                className="hover:underline"
                as={Link}
              >
                Reset Password
              </UiLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
