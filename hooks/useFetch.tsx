"use client";

import { useEffect, useRef, useState } from "react";

export type UseFetchResponseType = "text" | "json" | "arrayBuffer" | "blob";

function defineDataType<T>(_type: UseFetchResponseType | undefined, data?: T) {
  const dataType = typeof data;
  return (
    _type ||
    (dataType === "string"
      ? "text"
      : dataType === "object"
      ? data instanceof Blob
        ? "blob"
        : !(data instanceof ArrayBuffer)
        ? "json"
        : 0
      : 0) ||
    "arrayBuffer"
  );
}

export default function useFetch<T = any>(
  input: string | URL | globalThis.Request,
  init?: RequestInit | undefined,
  options: {
    type?: UseFetchResponseType;
    data?: T;
    fetched?: boolean;
  } = {}
) {
  const { type, data: defaultData, fetched: _fetched = false } = options;
  const fetched = useRef(_fetched);
  const [response, setResponse] = useState<Response>();
  const [data, setData] = useState<T | undefined>(defaultData);
  const [isPending, setIsPending] = useState(!_fetched);
  const [fetchError, setFetchError] = useState<any>();
  const [dataError, setDataError] = useState<any>();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setResponse(void 0);
    setIsPending(true);
    fetch(input, init)
      .then((res) => {
        setResponse(res);
        setFetchError(void 0);
        res[defineDataType(type, data)]()
          .then((r) => {
            setData(r);
            setDataError(void 0);
          })
          .catch((e) => {
            setData(void 0);
            setDataError(e);
          });
      })
      .catch((err) => {
        setFetchError(err);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [
    fetched,
    type,
    data,
    setResponse,
    setData,
    setFetchError,
    setDataError,
    setIsPending,
  ]);

  const refresh = () => {
    fetched.current = false;
  };

  return { data, response, error: fetchError || dataError, isPending, refresh };
}
