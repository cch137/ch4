import { Button } from "@nextui-org/button";
import Link from "next/link";

export default function SignUpDone() {
  const color = "secondary";
  return (
    <>
      <div
        className="w-full flex-center pb-16 absolute left-0 top-14"
        style={{ height: "calc(100dvh - 3rem)" }}
      >
        <div className="w-unit-80 max-w-full flex flex-col gap-4">
          <h1 className="text-4xl text-center font-bold text-default-600">
            Sign up Successful!
          </h1>
          <div></div>
          <Button color={color} href="/" className="mx-12" as={Link}>
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}
