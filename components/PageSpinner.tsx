"use client";

import useInit from "@/hooks/useInit";
import { Spinner } from "@nextui-org/spinner";
import { useState } from "react";

type SpinnerColor =
  | "secondary"
  | "current"
  | "white"
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | undefined;

type PageSpinnerProps =
  | {
      label?: string;
      show?: boolean;
      color?: SpinnerColor;
    }
  | {
      label?: string;
      task?: Function;
      color?: SpinnerColor;
    };

function PageSpinnerComponents({
  color,
  label,
}: {
  color?: SpinnerColor;
  label?: string;
}) {
  return (
    <div className="fixed left-0 top-0 h-dvh w-dvw z-[999999] bg-black flex-center flex-col">
      <Spinner size="lg" color={color} style={{ scale: 2 }} />
      <div className="mt-10 text-default-600">{label}</div>
    </div>
  );
}

function TaskLoader({
  color,
  label,
  task,
}: {
  color?: SpinnerColor;
  label?: string;
  task: Function;
}) {
  const [isProcessing, setIsProcessing] = useState(true);
  useInit(() => {
    new Promise(async (r) => r(await task())).finally(() =>
      setIsProcessing(true)
    );
  }, [setIsProcessing, task]);
  if (!isProcessing) return null;
  return <PageSpinnerComponents color={color} label={label} />;
}

export default function PageSpinner(props: PageSpinnerProps) {
  const {
    label,
    show,
    task,
    color = "current",
  } = { show: void 0, task: void 0, ...props };
  if (typeof task === "function")
    return <TaskLoader task={task} color={color} label={label} />;
  if (show) return <PageSpinnerComponents color={color} label={label} />;
  return null;
}
