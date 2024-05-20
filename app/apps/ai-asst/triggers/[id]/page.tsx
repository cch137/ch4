"use client";

import {
  AIASST_DESC_LINES,
  AIASST_PATH,
  CONTENT_MAX_W,
  PluginObject,
  PluginType,
  Trigger,
  calcNextSche,
  parsePlugins,
  pluginDefs,
  serializePlugins,
} from "@/constants/asst";
import { useEffect, useRef, useState } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { Divider } from "@nextui-org/divider";
import { Spacer } from "@nextui-org/spacer";
import {
  IoAddOutline,
  IoChevronBackOutline,
  IoCreateOutline,
  IoPlay,
  IoTrashOutline,
} from "react-icons/io5";

import formatDate from "@cch137/utils/str/date";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import store, { StoreType } from "@cch137/utils/store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/spinner";
import {
  deleteTrigger,
  getTrigger,
  testTrigger,
  updateTrigger,
} from "@/app/apps/ai-asst/useAiTriggers";
import { useUserInfo } from "@/hooks/useAppDataManager";
import SigninToContinue from "@/components/SignInToContinue";
import useConfirm from "@/hooks/useConfirm";
import PageSpinner from "@/components/PageSpinner";

type PluginObjectDisplay = PluginObject & {
  isNew?: boolean;
};

function PluginItem({
  index,
  plugins,
}: {
  index: number;
  plugins: StoreType<PluginObjectDisplay[]>;
}) {
  const [plugin, setPlugin] = useState(plugins[index]);
  useEffect(() => plugins.$on((o) => setPlugin(o[index])));

  const { type, args: argValues, isNew } = plugin;
  const pluginDef = pluginDefs.get(type);
  const { args: argNames = [], desc } = pluginDef || {};

  const args = argNames.map((n, i) => [n, argValues[i]] as [string, any]);

  const setArg = (index: number, value: any) => {
    const _args = [...argValues];
    _args[index] = value;
    setPlugin({ ...plugin, args: _args });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const deletePlugin = () => {
    plugins.splice(index, 1);
    onClose();
  };

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    if (isNew) onOpen();
  }, [isNew, onOpen]);

  return (
    <>
      <div className="flex gap-2 bg-default-50 rounded-xl px-4 py-2 w-full">
        <span>{pluginDefs.get(type)?.name || "Unknown"} </span>
        <div className="flex-1 select-none">
          <div className="relative">
            <div className="absolute w-full text-default-300 text-nowrap text-ellipsis overflow-hidden">
              {args
                .map((item) => {
                  const name = item[0];
                  const value = String(item[1] || "");
                  return `${name}: ${
                    (value.length || 0) > 64
                      ? `${value.substring(0, 64)}...`
                      : value
                  }`;
                })
                .join("; ")}
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-inherit">
          <Tooltip content="Edit" placement="right">
            <div
              onClick={onOpen}
              className="flex-center p-1 bg-inherit rounded-lg cursor-pointer hover:brightness-150 transition text-lg"
            >
              <IoCreateOutline />
            </div>
          </Tooltip>
        </div>
      </div>
      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Plugin
              </ModalHeader>
              <ModalBody>
                <div className="flex-center">
                  <Select
                    label="Type"
                    variant="bordered"
                    color="secondary"
                    className="w-64 max-w-full"
                    size="sm"
                    value={type}
                    defaultSelectedKeys={[type]}
                    onChange={(e) =>
                      setPlugin((o) => ({
                        ...o,
                        type: e.target.value as PluginType,
                      }))
                    }
                  >
                    <SelectItem value="text" key="text">
                      Plain Text
                    </SelectItem>
                    <SelectItem value="google" key="google">
                      Google Search
                    </SelectItem>
                    <SelectItem value="time" key="time">
                      Time
                    </SelectItem>
                    <SelectItem value="crawl" key="crawl">
                      Crawl URL
                    </SelectItem>
                  </Select>
                  <div className="flex-1" />
                  <div>
                    <Tooltip content="Delete">
                      <Button
                        onClick={deletePlugin}
                        color="danger"
                        variant="flat"
                        isIconOnly
                      >
                        <span className="text-lg">
                          <IoTrashOutline />
                        </span>
                      </Button>
                    </Tooltip>
                  </div>
                </div>
                <div className="p-1 text-sm text-default-400">{desc}</div>
                {args.map(([name, value], i) => {
                  return (
                    <>
                      <Textarea
                        label={name}
                        classNames={{ input: "text-base" }}
                        variant="bordered"
                        color="secondary"
                        defaultValue={value}
                        value={value}
                        onChange={(e) => setArg(i, e.target.value)}
                        key={i}
                      />
                    </>
                  );
                })}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onClick={() => {
                    if (isNew) deletePlugin();
                    else setPlugin(plugins[index]);
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={() => {
                    plugins[index] = { ...plugin, isNew: false };
                    setPlugin(plugins[index]);
                    onClose();
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function AsstTrigger({ trigger }: { trigger: Trigger }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...trigger,
    plug: store<PluginObjectDisplay[]>(parsePlugins(trigger.plug)),
  });

  const [pluginsMirror, setPluginsMirror] = useState(form.plug.$object);
  useEffect(() => {
    return form.plug.$on((o) => {
      setPluginsMirror(o);
      setForm({ ...form });
    });
  }, [setPluginsMirror, setForm, form]);

  const updateTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(async () => {
      setIsSaving(true);
      await updateTrigger({ ...form, plug: serializePlugins(form.plug) });
      setIsSaving(false);
    }, 1000);
  }, [form]);

  const [date, setDate] = useState(formatDate(form.strt, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatDate(form.strt, "HH:mm"));
  useEffect(() => {
    setForm((o) => ({ ...o, strt: new Date(`${date} ${time}`.trim()) }));
  }, [date, time]);
  const [selectedIntv, setSelectedIntv] = useState([`${form.intv}`]);
  const nextExec = calcNextSche(form.strt, form.intv);

  const [isConfirmDelete, onConfirmDelete] = useConfirm();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [execResult, setExecResult] = useState("");

  const _testTrigger = async () => {
    try {
      setExecResult("");
      setIsTesting(true);
      const res = await testTrigger(form._id);
      if (!res) throw new Error("No Response");
      res.on("data", () => setExecResult(res.chunks.join("")));
      await res.process;
    } finally {
      setIsTesting(false);
    }
  };

  const _deleteTrigger = async () => {
    if (onConfirmDelete()) {
      setIsDeleting(true);
      try {
        if (await deleteTrigger(trigger._id)) {
          return router.push(AIASST_PATH);
        }
      } catch {}
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center flex-wrap gap-4">
        <Select
          label="Type"
          variant="underlined"
          color="secondary"
          className="w-24 max-w-full"
          size="sm"
          selectedKeys={["mailer"]}
          isDisabled
        >
          <SelectItem key="mailer">Mailer</SelectItem>
        </Select>
        <Input
          label="Name"
          type="text"
          size="sm"
          variant="underlined"
          color="secondary"
          className="w-96 max-w-full"
          value={form.name}
          onChange={(e) => setForm((o) => ({ ...o, name: e.target.value }))}
        />
        <Select
          label="Enabled"
          variant="underlined"
          color="secondary"
          className="w-24 max-w-full"
          size="sm"
          value={form.enbl ? 1 : 0}
          defaultSelectedKeys={[form.enbl ? "1" : "0"]}
          onChange={(e) =>
            setForm((o) => ({ ...o, enbl: Boolean(Number(e.target.value)) }))
          }
        >
          <SelectItem value={1} key={1}>
            ON
          </SelectItem>
          <SelectItem value={0} key={0}>
            OFF
          </SelectItem>
        </Select>
        <div className="flex-1" />
        <div className="text-sm text-default-400 select-none">
          {isSaving ? (
            <div className="flex-center gap-2">
              <Spinner color="default" size="sm" />
              <span>Saving...</span>
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <Tooltip content="Delete">
            <Button
              onClick={_deleteTrigger}
              color="danger"
              variant="flat"
              isIconOnly={!isConfirmDelete && !isDeleting}
              isLoading={isDeleting}
            >
              <IoTrashOutline className="text-lg" />
              {isDeleting ? (
                <span>Deleting...</span>
              ) : isConfirmDelete ? (
                <span>Confirm delete</span>
              ) : null}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-default-500">
          When this trigger is activated, an email will be sent to your account
          mailbox.
        </div>
        <div className="flex items-end flex-wrap gap-2">
          <span className="text-default-500 mb-0.5">
            Execute {form.intv > 0 ? "every " : ""}
          </span>
          <Select
            label="Interval"
            variant="underlined"
            color="secondary"
            className="w-32 max-w-full"
            size="sm"
            selectedKeys={selectedIntv}
            onChange={(e) => {
              const intv = Number(e.target.value);
              setSelectedIntv([`${intv}`]);
              setForm((o) => ({ ...o, intv }));
            }}
          >
            <SelectItem key={0}>only once</SelectItem>
            <SelectItem key={1 * 3600000}>60 minutes</SelectItem>
            <SelectItem key={2 * 3600000}>2 hours</SelectItem>
            <SelectItem key={4 * 3600000}>4 hours</SelectItem>
            <SelectItem key={8 * 3600000}>8 hours</SelectItem>
            <SelectItem key={12 * 3600000}>12 hours</SelectItem>
            <SelectItem key={24 * 3600000}>24 hours</SelectItem>
            <SelectItem key={72 * 3600000}>3 days</SelectItem>
            <SelectItem key={168 * 3600000}>7 days</SelectItem>
          </Select>
          <span className="text-default-500 mb-0.5">
            {form.intv > 0 ? " starting from " : " at "}
          </span>
          <div className="flex-center">
            <Input
              label="Date"
              color="secondary"
              variant="bordered"
              type="date"
              size="sm"
              placeholder=" "
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex-center">
            <Input
              label="Time"
              color="secondary"
              variant="bordered"
              type="time"
              size="sm"
              placeholder=" "
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      {isNaN(nextExec.getTime()) ? null : (
        <div className="text-default-300 text-sm">
          (next execution: {formatDate(nextExec)})
        </div>
      )}
      <Textarea
        label="Prompt"
        color="secondary"
        variant="bordered"
        value={form.main}
        onChange={(e) => setForm((o) => ({ ...o, main: e.target.value }))}
      />
      <div className="max-w-2xl">
        <div className="flex gap-4">
          <h2 className="flex-1 text-xl font-medium">Plugins</h2>
          <div className="flex-center full">
            <Button
              onClick={() =>
                form.plug.push({ type: "text", args: [""], isNew: true })
              }
              variant="light"
              size="sm"
            >
              <span className="flex-center gap-1 h-0">
                <IoAddOutline className="text-lg" />
                <span>Add a plugin</span>
              </span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 py-2">
          {pluginsMirror.map((p, i) => (
            <PluginItem index={i} plugins={form.plug} key={i} />
          ))}
        </div>
      </div>
      <Spacer y={2} />
      <Divider />
      <div className="flex flex-col gap-2">
        <div className="flex items-end">
          <h2 className="flex-1 text-xl font-medium">Testing</h2>
          <div className="text-sm text-default-300">
            Note: Test results will not be sent to your mailbox.
          </div>
        </div>
        <div>
          <Button
            startContent={
              isTesting || isSaving ? void 0 : <IoPlay className="text-lg" />
            }
            size="sm"
            variant="faded"
            color={isTesting ? "success" : "default"}
            isLoading={isTesting || isSaving || isDeleting}
            onClick={_testTrigger}
          >
            <span className="text-sm pr-2">
              {isSaving ? "Saving..." : isTesting ? "Executing..." : "Test"}
            </span>
          </Button>
        </div>
        {execResult ? (
          <Textarea
            label="Test result"
            color="secondary"
            variant="bordered"
            value={execResult}
            maxRows={64}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function AiAsst() {
  const { id: _id } = useParams();
  const id = Array.isArray(_id) ? _id[0] : _id;
  const [trigger, setTrigger] = useState<Trigger | null>();

  const isLoading = trigger === undefined;
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      (async () => {
        const trigger = await getTrigger(id);
        setTrigger(trigger);
        // if (!trigger) router.push(AIASST_PATH);
        // else setTrigger(trigger);
      })();
    }
  }, [id]);

  const { isPending, isLoggedIn } = useUserInfo();

  if (isPending) return <PageSpinner />;

  if (!isLoggedIn)
    return (
      <SigninToContinue
        nextPath={AIASST_PATH}
        title="AI Assistant"
        descriptions={AIASST_DESC_LINES}
      />
    );

  return (
    <>
      <div
        className="max-w-full px-4 py-8 m-auto"
        style={{ width: CONTENT_MAX_W }}
      >
        <div className="flex">
          <Button variant="light" size="sm" as={Link} href={AIASST_PATH}>
            <IoChevronBackOutline className="text-lg" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
        {isLoading ? (
          <div className="flex-center py-16">
            <Spinner size="lg" color="secondary" />
          </div>
        ) : trigger ? (
          <AsstTrigger trigger={trigger} />
        ) : (
          <div className="flex-center py-16 text-default-300">
            Trigger Not Found
          </div>
        )}
      </div>
    </>
  );
}
