"use client";

import { packData } from "@cch137/utils/shuttle";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Link as UiLink } from "@nextui-org/link";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import FullpageSpinner from "@/app/components/FullpageSpinner";
import { StatusResponse } from "@/constants/types";
import { useRouter, useSearchParams } from "next/navigation";
import useErrorMessage from "@/hooks/useErrorMessage";
import { useUserInfo } from "@/hooks/useUserInfo";
import { signInHrefWithNext, SIGNUPDONE_PATHNAME } from "@/constants/app";

function _SignUp() {
  const variant = "underlined";
  const color = "secondary";
  const [pwIsVisible, setPwIsVisible] = useState(false);
  const [isPosting, setIsPosting] = useState<boolean | undefined>(false);
  const [form, setForm] = useState({
    eadd: "",
    name: "",
    pass: "",
    code: "",
  });

  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const redirectToHome = useCallback(() => router.replace("/"), [router]);
  const redirectToDone = useCallback(
    () => router.replace(SIGNUPDONE_PATHNAME),
    [router]
  );

  const { openErrorMessageBox, errorMessageBox } = useErrorMessage();

  const { isPending, isLoggedIn, update: userUpdate } = useUserInfo();

  const post = async () => {
    setIsPosting(true);
    const { success, message }: StatusResponse = await (
      await fetch("/api/auth/signup", {
        method: "POST",
        body: packData(form, 519746, 8),
      })
    ).json();
    if (message) openErrorMessageBox(message);
    if (success) return userUpdate(), redirectToDone();
    else if (!message) openErrorMessageBox();
    setIsPosting(false);
  };

  const sendVerificationCode = async () => {
    setIsPosting(true);
    const { success, message }: StatusResponse = await (
      await fetch("/api/auth/user/eadd", {
        method: "POST",
        body: packData({ action: 1, eadd: form.eadd }, 377417, 666),
      })
    ).json();
    if (success) setIsSentCode(true), setResendCooling(60);
    if (message) openErrorMessageBox(message);
    setIsPosting(false);
  };

  const [isSentCode, setIsSentCode] = useState(false);
  const [resendCooling, setResendCooling] = useState(0);

  useEffect(() => {
    if (resendCooling <= 0) return;
    setTimeout(() => setResendCooling((r) => r - 1), 1000);
  }, [resendCooling]);

  const redirected = useRef(false);
  useEffect(() => {
    if (redirected.current) return;
    if (isLoggedIn) {
      redirected.current = true;
      redirectToHome();
      setIsPosting(undefined);
    }
  }, [isLoggedIn, redirectToHome, setIsPosting]);

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
          visibility: isPosting === undefined ? "hidden" : "visible",
        }}
      >
        <div className="w-unit-80 max-w-full flex flex-col gap-4">
          <h1 className="text-4xl text-center font-bold text-default-600">
            Sign up
          </h1>
          <div className="-m-1"></div>
          <Input
            label="Email"
            variant={variant}
            color={color}
            type="email"
            onChange={(e) => setForm({ ...form, eadd: e.target.value })}
            isDisabled={isPosting}
          />
          <Input
            label="Username"
            variant={variant}
            color={color}
            type="text"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <Input
            label="Verification Code"
            variant={variant}
            color={color}
            type="text"
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            isDisabled={isPosting}
          />
          <div className="m-2"></div>
          {isSentCode ? (
            <>
              <Button
                color={color}
                className="mx-12"
                onClick={post}
                isLoading={isPosting}
              >
                Sign up
              </Button>
              <div className="flex-center">
                <UiLink
                  underline="hover"
                  color={color}
                  className="cursor-pointer"
                  size="sm"
                  isDisabled={resendCooling > 0 || isPosting}
                  onClick={sendVerificationCode}
                >
                  Resend verification email
                  {resendCooling <= 0
                    ? ""
                    : ` (${resendCooling} second${
                        resendCooling > 1 ? "s" : ""
                      })`}
                </UiLink>
              </div>
            </>
          ) : (
            <Button
              color={color}
              className="mx-12"
              onClick={sendVerificationCode}
              isLoading={isPosting}
            >
              Send Verification Code
            </Button>
          )}
          <div></div>
          <div className="text-default-500 flex-center flex-col">
            <div>
              <span>Already have an account? </span>
              <UiLink
                href={signInHrefWithNext(next)}
                color={color}
                className="hover:underline"
                as={Link}
              >
                Sign in
              </UiLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUp() {
  return (
    <Suspense>
      <_SignUp />
    </Suspense>
  );
}
