"use client";

import "./laundry.css";

import { packData } from "@cch137/utils/shuttle";
import formatDate from "@cch137/utils/format/date";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { Spinner } from "@nextui-org/spinner";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IoChevronBack, IoRefreshOutline } from "react-icons/io5";

type Machine = {
  gaia_machine_name: string;
  isOnline: boolean;
  machineName: string;
  no: string;
  status: string;
  type: string;
  lastRun?: string;
};

type MachineInfo = {
  floor: string;
  area: string;
  no: string;
  type: string;
  status: string;
  isOnline: boolean;
  lastRun?: string;
};

export default function Laundry() {
  const update = async (useLoading = true) => {
    try {
      if (useLoading) setIsLoading(true);
      const res = await fetch("https://api.cch137.link/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/uint8array",
        },
        body: packData(
          {
            input: "http://monitor.isesa.com.tw/monitor/dispatch.ajax",
            method: "POST",
            body: "code=QOu6tH&ran=8589&funcName=F_CUSTOMER&subFuncName=SUB_QUERY_CODE",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              Host: "monitor.isesa.com.tw",
              Origin: "http://monitor.isesa.com.tw",
              Referer: "http://monitor.isesa.com.tw/monitor/?code=QOu6tH",
            },
          },
          0
        ),
      });
      const content = await res.text();
      const data = JSON.parse(
        content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1)
      );
      const machines: MachineInfo[] = (data.jsonObj.machineArray as Machine[])
        .map(({ machineName, status, isOnline, lastRun }) => {
          const matched = /(\S+)-(\d+)(\S+)(\d+)/i.exec(machineName);
          const [_, area, floor, type, no] = matched || [
            "-",
            "-",
            "-",
            "-",
            "-",
          ];
          return { floor, area, type, no, status, lastRun, isOnline };
        })
        .sort(({ no: a }, { no: b }) => (a === b ? 0 : a > b ? 1 : -1))
        .sort(({ type: a }, { type: b }) => (a === b ? 0 : a > b ? 1 : -1))
        .sort(({ area: a }, { area: b }) => (a === b ? 0 : a > b ? 1 : -1))
        .sort(({ floor: a }, { floor: b }) => (a === b ? 0 : a > b ? 1 : -1));
      setMachines(machines);
    } catch {
      setMachines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [machines, setMachines] = useState<MachineInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [floor, setFloor] = useState("3");
  const floors = ["ALL", ...new Set(machines.map(({ floor }) => floor))];
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      update();
    }
    const interval = setInterval(() => update(false), 60000);
    return () => clearInterval(interval);
  }, [inited]);

  return (
    <div className="max-w-lg m-auto flex flex-col items-center py-8">
      <div className="flex-center gap-4 w-full">
        <div className="flex-1 flex-center">
          <Button as={Link} size="sm" variant="flat" href="/" isIconOnly>
            <IoChevronBack className="text-lg" />
          </Button>
        </div>
        <div className="flex-1 flex-center">
          <Select
            label="樓層"
            size="sm"
            className="w-20"
            defaultSelectedKeys={[floor]}
            onChange={(e) => setFloor(e.target.value)}
            isDisabled={isLoading}
          >
            {floors.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex-1 flex-center">
          <Button
            onClick={() => update()}
            size="sm"
            variant="flat"
            isDisabled={isLoading}
            startContent={<IoRefreshOutline className="text-lg" />}
          >
            Refresh
          </Button>
        </div>
      </div>
      {isLoading ? (
        <Spinner size="lg" color="default" className="py-16" />
      ) : (
        <table className="m-4 laundry-table">
          <tbody>
            <tr>
              <td>樓層</td>
              <td>區域</td>
              <td>機型</td>
              <td>編號</td>
              <td>狀態</td>
            </tr>
            {machines
              .filter((i) => (floor === "ALL" ? true : floor === i.floor))
              .map(({ floor, area, type, no, status, lastRun }, i) => {
                const isDone = ["空機", "運轉結束"].includes(status);
                return (
                  <tr key={i} className="text-default-500">
                    <td>{floor}</td>
                    <td>{area}</td>
                    <td>{type}</td>
                    <td>{no}</td>
                    <td
                      className={
                        isDone ? "text-success-500" : "text-warning-500"
                      }
                    >
                      <span>{status}</span>
                      <span className="text-default-400">
                        {lastRun
                          ? ` 始於${formatDate(
                              new Date(+lastRun * 1000),
                              "HH:mm"
                            )}`
                          : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}
