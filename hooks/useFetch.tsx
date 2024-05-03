"use client";

import { useEffect, useRef, useState } from "react";

export default function useFetch(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>();
  const [response, setResponse] = useState<Response>();
  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setResponse(void 0);
    setError(void 0);
    setIsPending(true);
    fetch(input, init)
      .then((res) => setResponse(res))
      .catch((err) => setError(err))
      .finally(() => setIsPending(false));
  }, [fetched, setResponse, setError, setIsPending]);
  const refresh = () => {
    fetched.current = false;
  };
  return {
    response,
    error,
    isPending,
    refresh,
  };
}

function _useFetchData<T = any>(
  type: "text" | "json" | "arrayBuffer" | "blob",
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  const [data, setData] = useState<T>();
  const [dataError, setDataError] = useState<T>();
  const { response, error, isPending, refresh } = useFetch(input, init);
  const lastResponse = useRef<Response>();
  useEffect(() => {
    if (!response) return setData(void 0);
    if (response !== lastResponse.current) {
      lastResponse.current = response;
      response[type]()
        .then((r) => setData(r))
        .catch((e) => setDataError(e));
    }
  }, [response, setData, setDataError]);
  return { data, response, error: error || dataError, isPending, refresh };
}

export function useFetchJSON<T = any>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return _useFetchData<T>("json", input, init);
}

export function useFetchText(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return _useFetchData<string>("text", input, init);
}

export function useFetchBlob(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return _useFetchData<Blob>("blob", input, init);
}

export function useFetchArrayBuffer(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return _useFetchData<ArrayBuffer>("arrayBuffer", input, init);
}
