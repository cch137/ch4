import { Trigger, TriggerItem } from "@/constants/asst";
import { StatusResponse } from "@/constants/types";
import Broadcaster from "@cch137/utils/dev/broadcaster";
import store from "@cch137/utils/dev/store";
import { ShuttleWithHash, packDataWithHash, unpackDataWithHash } from "@cch137/utils/shuttle";
import { readStream } from "@cch137/utils/stream";
import { useEffect, useState } from "react";
import { wrapStreamResponse } from "./useAiChat";

export const triggersErrorBroadcaster = new Broadcaster<{message:string,title?:string}>('aiasst-trigger-error');

const handleTriggersError = (err: any): void => {
  if (err instanceof Error) return handleTriggersError(err.message || err.name);
  if (typeof err === 'string') triggersErrorBroadcaster.broadcast({message: err});
  else console.error(err);
}

export const createTrigger = async () => {
  try {
    const {success, value, message}: StatusResponse<string> = await (await fetch('/api/ai-asst/triggers/', {method: 'PUT'})).json();
    if (!success || !value) throw new Error(message || 'Failed to create trigger');
    await triggersStore.$update();
    return value;
  } catch (e) {
    handleTriggersError(e);
    return null;
  }
}

export const deleteTrigger = async (_id?: string) => {
  try {
    console.log('Deleting trigger', _id);
    if (!_id) throw new Error('Trigger id not provided');
    const {success, message}: StatusResponse<string> = await (await fetch(`/api/ai-asst/triggers/${_id}`, {method: 'DELETE'})).json();
    if (!success) throw new Error(message || 'Failed to delete trigger');
    await triggersStore.$update();
    return true;
  } catch (e) {
    handleTriggersError(e);
    return false;
  }
}

let updateTriggerAbortController: AbortController;
export const updateTrigger = async (trigger?: Trigger) => {
  try {
    if (updateTriggerAbortController) updateTriggerAbortController.abort();
    updateTriggerAbortController = new AbortController();
    if (!trigger) throw new Error('Trigger not provided');
    const {success, message}: StatusResponse = await (await fetch(`/api/ai-asst/triggers/${trigger._id}`, {
      method: 'PUT',
      body: packDataWithHash<Trigger>(trigger, 256, 721663210, 20240202),
      signal: updateTriggerAbortController.signal,
    })).json();
    if (!success) throw new Error(message || 'Failed to update trigger');
    await triggersStore.$update();
  } catch (e) {
    handleTriggersError(e);
    return null;
  }
}

export const testTrigger = async (_id?: string) => {
  try {
    if (!_id) throw new Error('Trigger id not provided');
    const res = await fetch(`/api/ai-asst/triggers/${_id}/test`, {method: 'POST'});
    return wrapStreamResponse(res);
  } catch (e) {
    handleTriggersError(e);
    return null;
  }
}

export const getTrigger = async (_id?: string) => {
  try {
    if (!_id) throw new Error('Trigger id not provided');
    const res = await fetch(`/api/ai-asst/triggers/${_id}`, {method: 'POST'});
    try {
      const trigger = unpackDataWithHash<Trigger>(await readStream(res.body), 256, 721663210, 20240202);
      if (trigger) return trigger;
    } catch {}
    throw new Error('Failed to get trigger');
  } catch (e) {
    handleTriggersError(e);
    return null;
  }
}

export const triggersStore = store<TriggerItem[]>([], async () => {
  try {
    return await (await fetch('/api/ai-asst/triggers', {method: 'POST'})).json();
  } catch {
    return [];
  }
}, {
  autoInit: false,
  initAfterOn: true,
});

export default function useAiTriggers() {
  const [triggers, setTriggers] = useState(triggersStore.$object);

  useEffect(() => {
    return triggersStore.$on(o => setTriggers(o));
  }, []);

  return {
    triggers,
  }
}
