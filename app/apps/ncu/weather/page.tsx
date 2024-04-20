"use client";

import { Button } from "@nextui-org/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { Input } from "@nextui-org/input";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { Spacer } from "@nextui-org/spacer";
import useUserInfo from "@/hooks/useUserInfo";

export default function Laundry() {
  const { auth } = useUserInfo();
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const inited = useRef(false);

  const update = useCallback(
    async (loc: string = city, useLoading = true) => {
      setCity(city);
      if (useLoading) setIsLoading(true);
      try {
        const res = await fetch("https://api.cch137.link/weather-text", {
          method: "POST",
          body: JSON.stringify({ loc }),
        });
        setContent(await res.text());
      } catch {}
      setIsLoading(false);
    },
    [setIsLoading, setContent, city, setCity]
  );

  const autoLoad = useRef(false);
  useEffect(() => {
    if (autoLoad.current) return;
    if (auth > 3 && !city) {
      autoLoad.current = true;
      update("中壢");
    }
  }, [auth, city, update]);

  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      if (city) update();
    }
    const interval = setInterval(() => update(city, false), 60000);
    return () => clearInterval(interval);
  }, [inited, city, update]);

  return (
    <div className="max-w-sm m-auto py-8 px-4">
      <div>
        <Button
          color="default"
          variant="light"
          isIconOnly
          as={Link}
          href="/"
          size="sm"
        >
          <IoChevronBack className="text-lg" />
        </Button>
      </div>
      <Spacer y={4} />
      <div className="flex-center gap-4">
        <Input
          label="City"
          type="text"
          variant="bordered"
          value={city}
          onValueChange={(v) => setCity(v)}
          size="sm"
        />
        <Button color="default" variant="flat" onClick={() => update()}>
          Refresh
        </Button>
      </div>
      <Spacer y={8} />
      <div className="flex-center">
        {isLoading ? (
          <Spinner size="lg" color="default" className="py-4" />
        ) : (
          <pre>{content}</pre>
        )}
      </div>
    </div>
  );
}
