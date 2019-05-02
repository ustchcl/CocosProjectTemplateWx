import { Fn } from "./Types";
import { ifNullThen } from "./BaseFunction";

export type TimerOptions = {
    tick: number;
    onstart?: Fn<void, void>;
    onstop?: Fn<void, void>;
    onpause?: Fn<void, void>;
    onend?: Fn<void, void>;
    ontick?: Fn<number, void>;
};

const defaultOptions: TimerOptions = {
    tick: 1,
    onstart: null,
    ontick: null,
    onpause: null,
    onstop: null,
    onend: null
};

type EventType = "onstart" | "ontick" | "onpause" | "onstop" | "onend";

type TimerStatus = "initialized" | "started" | "paused" | "stopped";



export class Timer {
    _id: number;
    _options: TimerOptions;
    _duration: number;
    _status: TimerStatus;
    _start: number;
    _measures: Array<number>;
    _timeout = null;
    _interval: number = null;

    static readonly Infinity = 86400;

    constructor(options?: TimerOptions) {
        this._options = ifNullThen(options, defaultOptions);
    }

    start(duration?: number) {
        if (!+duration && !this._duration) return this;
        // to ms
        duration && (duration *= 1000);

        if (this._timeout && this._status === "started") return this;
        this._duration = ifNullThen(duration, this._duration);

        this._timeout = setTimeout(this.end.bind(this), this._duration);
        if (typeof this._options.ontick === "function") {
            let _this = this;
            this._interval = setInterval(
                function() {
                    _this.trigger.call(this, "ontick", this.getDuration());
                }.bind(this),
                +this._options.tick * 1000
            );
        }
        this._start = Date.now();
        this._status = "started";
        this.trigger.call(this, "onstart", this.getDuration());
        return this;
    }

    pause() {
        if (this._status !== "started") return this;
        this._duration -= Date.now() - this._start;
        this.clear(false);
        this._status = "paused";
        this.trigger.call(this, "onpause");
        return this;
    }

    stop() {
        if (!/started|paused/.test(this._status)) return this;
        this.clear(true);
        this._status = "stopped";
        this.trigger.call(this, "onstop");
        return this;
    }

    on(eventType: EventType, value: Fn<void | number, void>) {
        this._options[eventType] = value;
        return this;
    }

    off(eventType: EventType) {
        this._options[eventType] = defaultOptions[eventType];
    }

    measureStart(label: string) {
        this._measures[label || ""] = Date.now();
        return this;
    }

    measureStop(label: string) {
        return Date.now() - this._measures[label || ""];
    }

    getDuration(): number {
        if (this._status == "started") {
            return this._duration - (Date.now() - this._start);
        } else if (this._status == "paused") {
            return this._duration;
        } else {
            return 0;
        }
    }

    trigger(event: EventType) {
        let callback = this._options[event];
        let args = [].slice.call(arguments, 1);
        typeof callback === "function" && callback.apply(this, args);
    }

    clear(clearDuration: boolean) {
        clearTimeout(this._timeout);
        clearInterval(this._interval);
        if (clearDuration === true) {
            this._duration = 0;
        }
    }

    end() {
        this.clear.call(this);
        this._status = "stopped";
        this.trigger.call(this, "onend");
    }
}

// test

// let timer = new Timer();
// let total = 20;
// timer.on('ontick', (d: number) => console.log(d))
//     .on("onend", () => console.log("end"))
//     .start(total);
