"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef, useCallback } from "react";

import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { Select, SelectItem } from "@nextui-org/select";
import { Tooltip } from "@nextui-org/tooltip";

import { IoSettingsSharp, IoChevronUp, IoCloseOutline } from "react-icons/io5";

import {
  correctModelName,
  models as _models,
  MAX_CTXT,
} from "@/constants/chat";
import type { ModelType, ConvConfig } from "@/constants/chat/types";
import type { SetState } from "@/constants/types";
import { useAiChatConvConfig, updateConv } from "@/app/apps/ai-chat/useAiChat";
import useIsSmallScreen from "@/hooks/useIsSmallScreen";

const MODEL_SETTINGS_ID = "model-settings";

function ConvConfigSlider({
  model,
  conf,
  label,
  name,
  minValue,
  maxValue,
  step,
  hidden = false,
  isDisabled,
  getValue,
}: {
  model?: ModelType;
  conf: ConvConfig;
  label: string;
  name: keyof ConvConfig;
  minValue: number;
  maxValue: number;
  step: number;
  hidden?: boolean;
  isDisabled?: boolean;
  getValue?: (v: number | number[]) => string;
}) {
  const isSmallScreen = useIsSmallScreen();
  return !hidden && (model?.configKeys || []).includes(name) ? (
    <Slider
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      value={Number(conf[name])}
      onChange={(v) => updateConv({ ...conf, [name]: Number(v) })}
      className="w-full"
      getValue={getValue}
      color="secondary"
      size={isSmallScreen ? "md" : "sm"}
      classNames={{
        base: "gap-0 select-none",
        label: `${isSmallScreen ? "text-sm" : "text-xs"} text-default-600`,
        value: `${isSmallScreen ? "text-sm" : "text-xs"} text-default-500`,
        thumb: "conv-config-slider",
        track: "cursor-pointer",
        trackWrapper: "-mt-1",
      }}
      isDisabled={isDisabled}
    />
  ) : (
    <></>
  );
}

export default function ConversationConfig({
  closeSidebar,
  modelSettingOpened,
  setModelSettingOpened,
}: {
  closeSidebar: () => void;
  modelSettingOpened: boolean;
  setModelSettingOpened: SetState<boolean>;
}) {
  const { convConfig, isLoadingConv: isDisabled } = useAiChatConvConfig();
  const [modelSettingsHeight, setModelSettingsHeight] = useState("");
  const [isFetchingModels, setIsFetchingModels] = useState(true);
  const [showAdditional, setShowAdditional] = useState(false);
  const models = _models.map((m) => ({
    ...m,
    value: correctModelName(m.value),
  }));
  const selectedModel = models.find((m) => m.value === convConfig.modl);
  const selectedModels = selectedModel ? [selectedModel.value] : [];
  const isSmallScreen = useIsSmallScreen();

  const setSelectedModel = useCallback(
    async (model: ModelType, update = true) => {
      updateConv({ ...convConfig, modl: model.value }, update);
    },
    [convConfig]
  );

  const adjustModelSettingsElHeight = useCallback(async () => {
    setTimeout(async () => {
      setModelSettingsHeight(
        `${
          (document.getElementById(MODEL_SETTINGS_ID) as HTMLDivElement)
            .offsetHeight
        }px`
      );
    }, 0);
  }, [setModelSettingsHeight]);

  const modelOnChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const model = models.find((m) => m.value === value);
    if (!model) return;
    setSelectedModel(model);
    adjustModelSettingsElHeight();
  };

  const inited = useRef(false);
  useEffect(() => {
    adjustModelSettingsElHeight();
    if (inited.current) return;
    inited.current = true;
    (async () => {
      setSelectedModel(models[0], false);
      setIsFetchingModels(false);
      adjustModelSettingsElHeight();
    })();
  }, [
    inited,
    setSelectedModel,
    setIsFetchingModels,
    adjustModelSettingsElHeight,
    models,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Select
          isDisabled={isDisabled || isFetchingModels}
          label="Model"
          className="max-w-xs"
          onChange={modelOnChange}
          selectedKeys={selectedModels}
          color="secondary"
          variant="underlined"
        >
          {models.map((model, i) => (
            <SelectItem
              color="secondary"
              variant="bordered"
              key={model.value}
              value={model.value}
            >
              {model.name}
            </SelectItem>
          ))}
        </Select>
        <div className="flex-1 gap-1 flex-center">
          <Tooltip
            content="Model settings"
            placement="right"
            isDisabled={modelSettingOpened}
          >
            <Button
              isIconOnly
              color="secondary"
              variant={modelSettingOpened ? "flat" : "light"}
              onClick={() => {
                adjustModelSettingsElHeight();
                setModelSettingOpened((v) => !v);
                if (modelSettingOpened) setShowAdditional(false);
              }}
            >
              {modelSettingOpened ? (
                <IoChevronUp style={{ scale: 4 / 3 }} />
              ) : (
                <IoSettingsSharp style={{ scale: 4 / 3 }} />
              )}
            </Button>
          </Tooltip>
          {isSmallScreen ? (
            <>
              <div className="flex-1"></div>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onClick={closeSidebar}
              >
                <IoCloseOutline style={{ scale: 2 }} />
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div
        className="border-b-0 border-default-200"
        style={{
          transition: ".2s ease-out",
          height: modelSettingOpened ? modelSettingsHeight : "0px",
          opacity: modelSettingOpened ? "100%" : "0%",
        }}
      >
        <div
          id={MODEL_SETTINGS_ID}
          className={`flex flex-col ${isSmallScreen ? "pb-2" : "pb-0"}`}
        >
          {(
            [
              [
                "Temperature",
                "temp",
                0,
                1,
                0.01,
                false,
                (v: number | number[]) => Number(v).toFixed(2),
              ],
              [
                "History messages",
                "ctxt",
                0,
                MAX_CTXT,
                1,
                false,
                (v: number | number[]) =>
                  (v == MAX_CTXT ? "max" : v == 0 ? "none" : v).toString(),
              ],
              [
                "Top P",
                "topP",
                0,
                1,
                0.01,
                true,
                (v: number | number[]) => Number(v).toFixed(2),
              ],
              ["Top K", "topK", 1, 16, 1, true],
            ] as [
              string,
              keyof ConvConfig,
              number,
              number,
              number,
              boolean,
              ((v: number | number[]) => string) | undefined
            ][]
          ).map(([label, name, min, max, step, isAdditional, getValue]) => (
            <ConvConfigSlider
              model={selectedModel}
              key={name}
              conf={convConfig}
              label={label}
              name={name}
              minValue={min}
              maxValue={max}
              step={step}
              hidden={isAdditional && !showAdditional}
              isDisabled={isDisabled}
              getValue={getValue}
            />
          ))}
          {showAdditional ? null : (
            <div className="flex-center">
              <Button
                variant="light"
                size="sm"
                className="h-6 text-default-300"
                disableAnimation
                onClick={() => setShowAdditional(true)}
              >
                show more options
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
