"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const unpackData = (array) => JSON.parse(new TextDecoder().decode(array.reverse().map((v) => ~v & 0xff)));
const packData = (data) => {
    return new TextEncoder()
        .encode(JSON.stringify(data))
        .map((v) => ~v & 0xff)
        .reverse();
};
class Tracker {
    static init() {
        window.addEventListener("blur", () => {
            Tracker.isBlur = true;
            Tracker.tracker.record("blur");
        });
        window.addEventListener("focus", () => {
            Tracker.isBlur = false;
            Tracker.tracker.record("focus");
        });
        window.addEventListener("popstate", () => {
            Tracker.tracker.recordView();
        });
        return Tracker.tracker || (Tracker.tracker = new Tracker());
    }
    get uid() {
        return localStorage.getItem(Tracker.UID_KEY) || "";
    }
    set uid(v) {
        localStorage.setItem(Tracker.UID_KEY, v);
    }
    constructor() {
        this.closed = false;
        Tracker.tracker = this;
        const ws = new WebSocket(`wss://space.cch137.link/${this.uid || ""}`);
        // const ws = new WebSocket(`ws://localhost:4000/${this.uid}`);
        this.ws = ws;
        ws.addEventListener("open", () => {
            if (this.closed)
                return ws.close();
            // send heartbeats
            // console.time("heartbeat");
            const heartbeatInterval = setInterval(() => {
                if (ws.readyState !== ws.OPEN) {
                    clearInterval(heartbeatInterval);
                    return;
                }
                // console.timeEnd("heartbeat");
                // console.time("heartbeat");
                ws.send(new Uint8Array([0]));
            }, 1000);
        });
        ws.addEventListener("message", (ev) => __awaiter(this, void 0, void 0, function* () {
            // parse command pack from server
            const _a = unpackData(new Uint8Array(yield ev.data.arrayBuffer())), { cmd } = _a, data = __rest(_a, ["cmd"]);
            // execute command
            switch (cmd) {
                case "uid": {
                    this.uid = data.uid;
                    break;
                }
                case "view": {
                    this.recordView();
                    break;
                }
                case "close": {
                    ws.close();
                    break;
                }
            }
        }));
        ws.addEventListener("error", (ev) => {
            console.error(ev);
            ws.close();
        });
        ws.addEventListener("close", () => {
            if (this.closed)
                return;
            this.closed = true;
            const itv = setInterval(() => {
                if (Tracker.isBlur)
                    return;
                clearInterval(itv);
                Tracker.tracker = new Tracker();
            }, 1000);
        });
    }
    record(type, data = {}) {
        const { ws } = Tracker.tracker;
        if (ws.readyState !== ws.OPEN) {
            const sending = () => {
                Tracker.tracker.record(type, data);
                ws.removeEventListener("open", sending);
            };
            ws.addEventListener("open", sending);
            return;
        }
        ws.send(packData(Object.assign(Object.assign({}, data), { type })));
    }
    recordView() {
        Tracker.tracker.record("view", { href: location.href });
    }
}
Tracker.UID_KEY = "t";
Tracker.isBlur = false;
Tracker.init();