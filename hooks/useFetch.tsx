"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseFetchResponseType = "text" | "json" | "arrayBuffer" | "blob";

const isUseFetchResponseType = (s?: string): s is UseFetchResponseType => {
  if (s)
    switch (s) {
      case "json":
      case "text":
      case "arrayBuffer":
      case "blob":
        return true;
    }
  return false;
};

const defineResponseType = <T,>(
  _type?: UseFetchResponseType,
  contentType?: string | null,
  data?: T
) => {
  if (isUseFetchResponseType(_type)) return _type;
  if (contentType) {
    const [_, t1, t2] =
      /^([a-z]*)\/([a-z]*);?/.exec(contentType.toLowerCase()) || [];
    if (isUseFetchResponseType(t1)) return t1;
    if (isUseFetchResponseType(t2)) return t2;
  }
  switch (typeof data) {
    case "string":
      return "text";
    case "object":
      if (data instanceof Blob) return "blob";
      if (data instanceof ArrayBuffer) return "arrayBuffer";
      return "json";
  }
  return "arrayBuffer";
};

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
  const symbol = useRef<Symbol>();
  const ctrl = useRef<AbortController>();
  const fetched = useRef(_fetched);
  const [allowFetch, setAllowFetch] = useState(!_fetched);
  const [response, setResponse] = useState<Response>();
  const [data, setData] = useState<T | undefined>(defaultData);
  const [isPending, setIsPending] = useState(!_fetched);
  const [fetchError, setFetchError] = useState<any>();
  const [dataError, setDataError] = useState<any>();

  useEffect(() => {
    if (!allowFetch || fetched.current) return;
    setAllowFetch(false);
    fetched.current = true;
    setResponse(void 0);
    setIsPending(true);
    const sym = Symbol();
    const abt = new AbortController();
    symbol.current = sym;
    if (ctrl.current) ctrl.current.abort();
    ctrl.current = abt;
    fetch(input, { signal: abt.signal, ...init })
      .then((res) => {
        if (symbol.current !== sym) throw new Error("Symbol changed");
        setResponse(res);
        setFetchError(void 0);
        res[defineResponseType(type, res.headers.get("Content-Type"), data)]()
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
        if (ctrl.current === abt) ctrl.current = void 0;
      });
  }, [
    fetched,
    allowFetch,
    input,
    init,
    type,
    data,
    setAllowFetch,
    setResponse,
    setData,
    setFetchError,
    setDataError,
    setIsPending,
  ]);

  const refresh = useCallback(() => {
    fetched.current = false;
    setAllowFetch(true);
  }, [fetched, setAllowFetch]);

  return {
    data,
    setData,
    response,
    error: fetchError || dataError,
    isPending,
    refresh,
  };
}
