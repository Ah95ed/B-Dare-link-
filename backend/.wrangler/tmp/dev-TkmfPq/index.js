var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node-built-in-modules:crypto
import libDefault from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault;
  }
});

// node_modules/bcryptjs/dist/bcrypt.js
var require_bcrypt = __commonJS({
  "node_modules/bcryptjs/dist/bcrypt.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    (function(global, factory) {
      if (typeof define === "function" && define["amd"])
        define([], factory);
      else if (typeof __require === "function" && typeof module === "object" && module && module["exports"])
        module["exports"] = factory();
      else
        (global["dcodeIO"] = global["dcodeIO"] || {})["bcrypt"] = factory();
    })(exports, function() {
      "use strict";
      var bcrypt2 = {};
      var randomFallback = null;
      function random(len) {
        if (typeof module !== "undefined" && module && module["exports"])
          try {
            return require_crypto()["randomBytes"](len);
          } catch (e) {
          }
        try {
          var a;
          (self["crypto"] || self["msCrypto"])["getRandomValues"](a = new Uint32Array(len));
          return Array.prototype.slice.call(a);
        } catch (e) {
        }
        if (!randomFallback)
          throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
        return randomFallback(len);
      }
      __name(random, "random");
      var randomAvailable = false;
      try {
        random(1);
        randomAvailable = true;
      } catch (e) {
      }
      randomFallback = null;
      bcrypt2.setRandomFallback = function(random2) {
        randomFallback = random2;
      };
      bcrypt2.genSaltSync = function(rounds, seed_length) {
        rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof rounds !== "number")
          throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
        if (rounds < 4)
          rounds = 4;
        else if (rounds > 31)
          rounds = 31;
        var salt = [];
        salt.push("$2a$");
        if (rounds < 10)
          salt.push("0");
        salt.push(rounds.toString());
        salt.push("$");
        salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
        return salt.join("");
      };
      bcrypt2.genSalt = function(rounds, seed_length, callback) {
        if (typeof seed_length === "function")
          callback = seed_length, seed_length = void 0;
        if (typeof rounds === "function")
          callback = rounds, rounds = void 0;
        if (typeof rounds === "undefined")
          rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
        else if (typeof rounds !== "number")
          throw Error("illegal arguments: " + typeof rounds);
        function _async(callback2) {
          nextTick2(function() {
            try {
              callback2(null, bcrypt2.genSaltSync(rounds));
            } catch (err) {
              callback2(err);
            }
          });
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt2.hashSync = function(s, salt) {
        if (typeof salt === "undefined")
          salt = GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof salt === "number")
          salt = bcrypt2.genSaltSync(salt);
        if (typeof s !== "string" || typeof salt !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof salt);
        return _hash(s, salt);
      };
      bcrypt2.hash = function(s, salt, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s === "string" && typeof salt === "number")
            bcrypt2.genSalt(salt, function(err, salt2) {
              _hash(s, salt2, callback2, progressCallback);
            });
          else if (typeof s === "string" && typeof salt === "string")
            _hash(s, salt, callback2, progressCallback);
          else
            nextTick2(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof salt)));
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      function safeStringCompare(known, unknown) {
        var right = 0, wrong = 0;
        for (var i = 0, k = known.length; i < k; ++i) {
          if (known.charCodeAt(i) === unknown.charCodeAt(i))
            ++right;
          else
            ++wrong;
        }
        if (right < 0)
          return false;
        return wrong === 0;
      }
      __name(safeStringCompare, "safeStringCompare");
      bcrypt2.compareSync = function(s, hash) {
        if (typeof s !== "string" || typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof hash);
        if (hash.length !== 60)
          return false;
        return safeStringCompare(bcrypt2.hashSync(s, hash.substr(0, hash.length - 31)), hash);
      };
      bcrypt2.compare = function(s, hash, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s !== "string" || typeof hash !== "string") {
            nextTick2(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof hash)));
            return;
          }
          if (hash.length !== 60) {
            nextTick2(callback2.bind(this, null, false));
            return;
          }
          bcrypt2.hash(s, hash.substr(0, 29), function(err, comp) {
            if (err)
              callback2(err);
            else
              callback2(null, safeStringCompare(comp, hash));
          }, progressCallback);
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt2.getRounds = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        return parseInt(hash.split("$")[2], 10);
      };
      bcrypt2.getSalt = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        if (hash.length !== 60)
          throw Error("Illegal hash length: " + hash.length + " != 60");
        return hash.substring(0, 29);
      };
      var nextTick2 = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
      function stringToBytes(str) {
        var out = [], i = 0;
        utfx.encodeUTF16toUTF8(function() {
          if (i >= str.length) return null;
          return str.charCodeAt(i++);
        }, function(b) {
          out.push(b);
        });
        return out;
      }
      __name(stringToBytes, "stringToBytes");
      var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
      var BASE64_INDEX = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        -1,
        -1,
        -1,
        -1,
        -1
      ];
      var stringFromCharCode = String.fromCharCode;
      function base64_encode(b, len) {
        var off2 = 0, rs = [], c1, c2;
        if (len <= 0 || len > b.length)
          throw Error("Illegal len: " + len);
        while (off2 < len) {
          c1 = b[off2++] & 255;
          rs.push(BASE64_CODE[c1 >> 2 & 63]);
          c1 = (c1 & 3) << 4;
          if (off2 >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off2++] & 255;
          c1 |= c2 >> 4 & 15;
          rs.push(BASE64_CODE[c1 & 63]);
          c1 = (c2 & 15) << 2;
          if (off2 >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off2++] & 255;
          c1 |= c2 >> 6 & 3;
          rs.push(BASE64_CODE[c1 & 63]);
          rs.push(BASE64_CODE[c2 & 63]);
        }
        return rs.join("");
      }
      __name(base64_encode, "base64_encode");
      function base64_decode(s, len) {
        var off2 = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
        if (len <= 0)
          throw Error("Illegal len: " + len);
        while (off2 < slen - 1 && olen < len) {
          code = s.charCodeAt(off2++);
          c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          code = s.charCodeAt(off2++);
          c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c1 == -1 || c2 == -1)
            break;
          o = c1 << 2 >>> 0;
          o |= (c2 & 48) >> 4;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off2 >= slen)
            break;
          code = s.charCodeAt(off2++);
          c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c3 == -1)
            break;
          o = (c2 & 15) << 4 >>> 0;
          o |= (c3 & 60) >> 2;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off2 >= slen)
            break;
          code = s.charCodeAt(off2++);
          c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          o = (c3 & 3) << 6 >>> 0;
          o |= c4;
          rs.push(stringFromCharCode(o));
          ++olen;
        }
        var res = [];
        for (off2 = 0; off2 < olen; off2++)
          res.push(rs[off2].charCodeAt(0));
        return res;
      }
      __name(base64_decode, "base64_decode");
      var utfx = (function() {
        "use strict";
        var utfx2 = {};
        utfx2.MAX_CODEPOINT = 1114111;
        utfx2.encodeUTF8 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp < 128)
              dst(cp & 127);
            else if (cp < 2048)
              dst(cp >> 6 & 31 | 192), dst(cp & 63 | 128);
            else if (cp < 65536)
              dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            else
              dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            cp = null;
          }
        };
        utfx2.decodeUTF8 = function(src, dst) {
          var a, b, c, d, fail = /* @__PURE__ */ __name(function(b2) {
            b2 = b2.slice(0, b2.indexOf(null));
            var err = Error(b2.toString());
            err.name = "TruncatedError";
            err["bytes"] = b2;
            throw err;
          }, "fail");
          while ((a = src()) !== null) {
            if ((a & 128) === 0)
              dst(a);
            else if ((a & 224) === 192)
              (b = src()) === null && fail([a, b]), dst((a & 31) << 6 | b & 63);
            else if ((a & 240) === 224)
              ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 15) << 12 | (b & 63) << 6 | c & 63);
            else if ((a & 248) === 240)
              ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63);
            else throw RangeError("Illegal starting byte: " + a);
          }
        };
        utfx2.UTF16toUTF8 = function(src, dst) {
          var c1, c2 = null;
          while (true) {
            if ((c1 = c2 !== null ? c2 : src()) === null)
              break;
            if (c1 >= 55296 && c1 <= 57343) {
              if ((c2 = src()) !== null) {
                if (c2 >= 56320 && c2 <= 57343) {
                  dst((c1 - 55296) * 1024 + c2 - 56320 + 65536);
                  c2 = null;
                  continue;
                }
              }
            }
            dst(c1);
          }
          if (c2 !== null) dst(c2);
        };
        utfx2.UTF8toUTF16 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp <= 65535)
              dst(cp);
            else
              cp -= 65536, dst((cp >> 10) + 55296), dst(cp % 1024 + 56320);
            cp = null;
          }
        };
        utfx2.encodeUTF16toUTF8 = function(src, dst) {
          utfx2.UTF16toUTF8(src, function(cp) {
            utfx2.encodeUTF8(cp, dst);
          });
        };
        utfx2.decodeUTF8toUTF16 = function(src, dst) {
          utfx2.decodeUTF8(src, function(cp) {
            utfx2.UTF8toUTF16(cp, dst);
          });
        };
        utfx2.calculateCodePoint = function(cp) {
          return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
        };
        utfx2.calculateUTF8 = function(src) {
          var cp, l = 0;
          while ((cp = src()) !== null)
            l += utfx2.calculateCodePoint(cp);
          return l;
        };
        utfx2.calculateUTF16asUTF8 = function(src) {
          var n = 0, l = 0;
          utfx2.UTF16toUTF8(src, function(cp) {
            ++n;
            l += utfx2.calculateCodePoint(cp);
          });
          return [n, l];
        };
        return utfx2;
      })();
      Date.now = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      var BCRYPT_SALT_LEN = 16;
      var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
      var BLOWFISH_NUM_ROUNDS = 16;
      var MAX_EXECUTION_TIME = 100;
      var P_ORIG = [
        608135816,
        2242054355,
        320440878,
        57701188,
        2752067618,
        698298832,
        137296536,
        3964562569,
        1160258022,
        953160567,
        3193202383,
        887688300,
        3232508343,
        3380367581,
        1065670069,
        3041331479,
        2450970073,
        2306472731
      ];
      var S_ORIG = [
        3509652390,
        2564797868,
        805139163,
        3491422135,
        3101798381,
        1780907670,
        3128725573,
        4046225305,
        614570311,
        3012652279,
        134345442,
        2240740374,
        1667834072,
        1901547113,
        2757295779,
        4103290238,
        227898511,
        1921955416,
        1904987480,
        2182433518,
        2069144605,
        3260701109,
        2620446009,
        720527379,
        3318853667,
        677414384,
        3393288472,
        3101374703,
        2390351024,
        1614419982,
        1822297739,
        2954791486,
        3608508353,
        3174124327,
        2024746970,
        1432378464,
        3864339955,
        2857741204,
        1464375394,
        1676153920,
        1439316330,
        715854006,
        3033291828,
        289532110,
        2706671279,
        2087905683,
        3018724369,
        1668267050,
        732546397,
        1947742710,
        3462151702,
        2609353502,
        2950085171,
        1814351708,
        2050118529,
        680887927,
        999245976,
        1800124847,
        3300911131,
        1713906067,
        1641548236,
        4213287313,
        1216130144,
        1575780402,
        4018429277,
        3917837745,
        3693486850,
        3949271944,
        596196993,
        3549867205,
        258830323,
        2213823033,
        772490370,
        2760122372,
        1774776394,
        2652871518,
        566650946,
        4142492826,
        1728879713,
        2882767088,
        1783734482,
        3629395816,
        2517608232,
        2874225571,
        1861159788,
        326777828,
        3124490320,
        2130389656,
        2716951837,
        967770486,
        1724537150,
        2185432712,
        2364442137,
        1164943284,
        2105845187,
        998989502,
        3765401048,
        2244026483,
        1075463327,
        1455516326,
        1322494562,
        910128902,
        469688178,
        1117454909,
        936433444,
        3490320968,
        3675253459,
        1240580251,
        122909385,
        2157517691,
        634681816,
        4142456567,
        3825094682,
        3061402683,
        2540495037,
        79693498,
        3249098678,
        1084186820,
        1583128258,
        426386531,
        1761308591,
        1047286709,
        322548459,
        995290223,
        1845252383,
        2603652396,
        3431023940,
        2942221577,
        3202600964,
        3727903485,
        1712269319,
        422464435,
        3234572375,
        1170764815,
        3523960633,
        3117677531,
        1434042557,
        442511882,
        3600875718,
        1076654713,
        1738483198,
        4213154764,
        2393238008,
        3677496056,
        1014306527,
        4251020053,
        793779912,
        2902807211,
        842905082,
        4246964064,
        1395751752,
        1040244610,
        2656851899,
        3396308128,
        445077038,
        3742853595,
        3577915638,
        679411651,
        2892444358,
        2354009459,
        1767581616,
        3150600392,
        3791627101,
        3102740896,
        284835224,
        4246832056,
        1258075500,
        768725851,
        2589189241,
        3069724005,
        3532540348,
        1274779536,
        3789419226,
        2764799539,
        1660621633,
        3471099624,
        4011903706,
        913787905,
        3497959166,
        737222580,
        2514213453,
        2928710040,
        3937242737,
        1804850592,
        3499020752,
        2949064160,
        2386320175,
        2390070455,
        2415321851,
        4061277028,
        2290661394,
        2416832540,
        1336762016,
        1754252060,
        3520065937,
        3014181293,
        791618072,
        3188594551,
        3933548030,
        2332172193,
        3852520463,
        3043980520,
        413987798,
        3465142937,
        3030929376,
        4245938359,
        2093235073,
        3534596313,
        375366246,
        2157278981,
        2479649556,
        555357303,
        3870105701,
        2008414854,
        3344188149,
        4221384143,
        3956125452,
        2067696032,
        3594591187,
        2921233993,
        2428461,
        544322398,
        577241275,
        1471733935,
        610547355,
        4027169054,
        1432588573,
        1507829418,
        2025931657,
        3646575487,
        545086370,
        48609733,
        2200306550,
        1653985193,
        298326376,
        1316178497,
        3007786442,
        2064951626,
        458293330,
        2589141269,
        3591329599,
        3164325604,
        727753846,
        2179363840,
        146436021,
        1461446943,
        4069977195,
        705550613,
        3059967265,
        3887724982,
        4281599278,
        3313849956,
        1404054877,
        2845806497,
        146425753,
        1854211946,
        1266315497,
        3048417604,
        3681880366,
        3289982499,
        290971e4,
        1235738493,
        2632868024,
        2414719590,
        3970600049,
        1771706367,
        1449415276,
        3266420449,
        422970021,
        1963543593,
        2690192192,
        3826793022,
        1062508698,
        1531092325,
        1804592342,
        2583117782,
        2714934279,
        4024971509,
        1294809318,
        4028980673,
        1289560198,
        2221992742,
        1669523910,
        35572830,
        157838143,
        1052438473,
        1016535060,
        1802137761,
        1753167236,
        1386275462,
        3080475397,
        2857371447,
        1040679964,
        2145300060,
        2390574316,
        1461121720,
        2956646967,
        4031777805,
        4028374788,
        33600511,
        2920084762,
        1018524850,
        629373528,
        3691585981,
        3515945977,
        2091462646,
        2486323059,
        586499841,
        988145025,
        935516892,
        3367335476,
        2599673255,
        2839830854,
        265290510,
        3972581182,
        2759138881,
        3795373465,
        1005194799,
        847297441,
        406762289,
        1314163512,
        1332590856,
        1866599683,
        4127851711,
        750260880,
        613907577,
        1450815602,
        3165620655,
        3734664991,
        3650291728,
        3012275730,
        3704569646,
        1427272223,
        778793252,
        1343938022,
        2676280711,
        2052605720,
        1946737175,
        3164576444,
        3914038668,
        3967478842,
        3682934266,
        1661551462,
        3294938066,
        4011595847,
        840292616,
        3712170807,
        616741398,
        312560963,
        711312465,
        1351876610,
        322626781,
        1910503582,
        271666773,
        2175563734,
        1594956187,
        70604529,
        3617834859,
        1007753275,
        1495573769,
        4069517037,
        2549218298,
        2663038764,
        504708206,
        2263041392,
        3941167025,
        2249088522,
        1514023603,
        1998579484,
        1312622330,
        694541497,
        2582060303,
        2151582166,
        1382467621,
        776784248,
        2618340202,
        3323268794,
        2497899128,
        2784771155,
        503983604,
        4076293799,
        907881277,
        423175695,
        432175456,
        1378068232,
        4145222326,
        3954048622,
        3938656102,
        3820766613,
        2793130115,
        2977904593,
        26017576,
        3274890735,
        3194772133,
        1700274565,
        1756076034,
        4006520079,
        3677328699,
        720338349,
        1533947780,
        354530856,
        688349552,
        3973924725,
        1637815568,
        332179504,
        3949051286,
        53804574,
        2852348879,
        3044236432,
        1282449977,
        3583942155,
        3416972820,
        4006381244,
        1617046695,
        2628476075,
        3002303598,
        1686838959,
        431878346,
        2686675385,
        1700445008,
        1080580658,
        1009431731,
        832498133,
        3223435511,
        2605976345,
        2271191193,
        2516031870,
        1648197032,
        4164389018,
        2548247927,
        300782431,
        375919233,
        238389289,
        3353747414,
        2531188641,
        2019080857,
        1475708069,
        455242339,
        2609103871,
        448939670,
        3451063019,
        1395535956,
        2413381860,
        1841049896,
        1491858159,
        885456874,
        4264095073,
        4001119347,
        1565136089,
        3898914787,
        1108368660,
        540939232,
        1173283510,
        2745871338,
        3681308437,
        4207628240,
        3343053890,
        4016749493,
        1699691293,
        1103962373,
        3625875870,
        2256883143,
        3830138730,
        1031889488,
        3479347698,
        1535977030,
        4236805024,
        3251091107,
        2132092099,
        1774941330,
        1199868427,
        1452454533,
        157007616,
        2904115357,
        342012276,
        595725824,
        1480756522,
        206960106,
        497939518,
        591360097,
        863170706,
        2375253569,
        3596610801,
        1814182875,
        2094937945,
        3421402208,
        1082520231,
        3463918190,
        2785509508,
        435703966,
        3908032597,
        1641649973,
        2842273706,
        3305899714,
        1510255612,
        2148256476,
        2655287854,
        3276092548,
        4258621189,
        236887753,
        3681803219,
        274041037,
        1734335097,
        3815195456,
        3317970021,
        1899903192,
        1026095262,
        4050517792,
        356393447,
        2410691914,
        3873677099,
        3682840055,
        3913112168,
        2491498743,
        4132185628,
        2489919796,
        1091903735,
        1979897079,
        3170134830,
        3567386728,
        3557303409,
        857797738,
        1136121015,
        1342202287,
        507115054,
        2535736646,
        337727348,
        3213592640,
        1301675037,
        2528481711,
        1895095763,
        1721773893,
        3216771564,
        62756741,
        2142006736,
        835421444,
        2531993523,
        1442658625,
        3659876326,
        2882144922,
        676362277,
        1392781812,
        170690266,
        3921047035,
        1759253602,
        3611846912,
        1745797284,
        664899054,
        1329594018,
        3901205900,
        3045908486,
        2062866102,
        2865634940,
        3543621612,
        3464012697,
        1080764994,
        553557557,
        3656615353,
        3996768171,
        991055499,
        499776247,
        1265440854,
        648242737,
        3940784050,
        980351604,
        3713745714,
        1749149687,
        3396870395,
        4211799374,
        3640570775,
        1161844396,
        3125318951,
        1431517754,
        545492359,
        4268468663,
        3499529547,
        1437099964,
        2702547544,
        3433638243,
        2581715763,
        2787789398,
        1060185593,
        1593081372,
        2418618748,
        4260947970,
        69676912,
        2159744348,
        86519011,
        2512459080,
        3838209314,
        1220612927,
        3339683548,
        133810670,
        1090789135,
        1078426020,
        1569222167,
        845107691,
        3583754449,
        4072456591,
        1091646820,
        628848692,
        1613405280,
        3757631651,
        526609435,
        236106946,
        48312990,
        2942717905,
        3402727701,
        1797494240,
        859738849,
        992217954,
        4005476642,
        2243076622,
        3870952857,
        3732016268,
        765654824,
        3490871365,
        2511836413,
        1685915746,
        3888969200,
        1414112111,
        2273134842,
        3281911079,
        4080962846,
        172450625,
        2569994100,
        980381355,
        4109958455,
        2819808352,
        2716589560,
        2568741196,
        3681446669,
        3329971472,
        1835478071,
        660984891,
        3704678404,
        4045999559,
        3422617507,
        3040415634,
        1762651403,
        1719377915,
        3470491036,
        2693910283,
        3642056355,
        3138596744,
        1364962596,
        2073328063,
        1983633131,
        926494387,
        3423689081,
        2150032023,
        4096667949,
        1749200295,
        3328846651,
        309677260,
        2016342300,
        1779581495,
        3079819751,
        111262694,
        1274766160,
        443224088,
        298511866,
        1025883608,
        3806446537,
        1145181785,
        168956806,
        3641502830,
        3584813610,
        1689216846,
        3666258015,
        3200248200,
        1692713982,
        2646376535,
        4042768518,
        1618508792,
        1610833997,
        3523052358,
        4130873264,
        2001055236,
        3610705100,
        2202168115,
        4028541809,
        2961195399,
        1006657119,
        2006996926,
        3186142756,
        1430667929,
        3210227297,
        1314452623,
        4074634658,
        4101304120,
        2273951170,
        1399257539,
        3367210612,
        3027628629,
        1190975929,
        2062231137,
        2333990788,
        2221543033,
        2438960610,
        1181637006,
        548689776,
        2362791313,
        3372408396,
        3104550113,
        3145860560,
        296247880,
        1970579870,
        3078560182,
        3769228297,
        1714227617,
        3291629107,
        3898220290,
        166772364,
        1251581989,
        493813264,
        448347421,
        195405023,
        2709975567,
        677966185,
        3703036547,
        1463355134,
        2715995803,
        1338867538,
        1343315457,
        2802222074,
        2684532164,
        233230375,
        2599980071,
        2000651841,
        3277868038,
        1638401717,
        4028070440,
        3237316320,
        6314154,
        819756386,
        300326615,
        590932579,
        1405279636,
        3267499572,
        3150704214,
        2428286686,
        3959192993,
        3461946742,
        1862657033,
        1266418056,
        963775037,
        2089974820,
        2263052895,
        1917689273,
        448879540,
        3550394620,
        3981727096,
        150775221,
        3627908307,
        1303187396,
        508620638,
        2975983352,
        2726630617,
        1817252668,
        1876281319,
        1457606340,
        908771278,
        3720792119,
        3617206836,
        2455994898,
        1729034894,
        1080033504,
        976866871,
        3556439503,
        2881648439,
        1522871579,
        1555064734,
        1336096578,
        3548522304,
        2579274686,
        3574697629,
        3205460757,
        3593280638,
        3338716283,
        3079412587,
        564236357,
        2993598910,
        1781952180,
        1464380207,
        3163844217,
        3332601554,
        1699332808,
        1393555694,
        1183702653,
        3581086237,
        1288719814,
        691649499,
        2847557200,
        2895455976,
        3193889540,
        2717570544,
        1781354906,
        1676643554,
        2592534050,
        3230253752,
        1126444790,
        2770207658,
        2633158820,
        2210423226,
        2615765581,
        2414155088,
        3127139286,
        673620729,
        2805611233,
        1269405062,
        4015350505,
        3341807571,
        4149409754,
        1057255273,
        2012875353,
        2162469141,
        2276492801,
        2601117357,
        993977747,
        3918593370,
        2654263191,
        753973209,
        36408145,
        2530585658,
        25011837,
        3520020182,
        2088578344,
        530523599,
        2918365339,
        1524020338,
        1518925132,
        3760827505,
        3759777254,
        1202760957,
        3985898139,
        3906192525,
        674977740,
        4174734889,
        2031300136,
        2019492241,
        3983892565,
        4153806404,
        3822280332,
        352677332,
        2297720250,
        60907813,
        90501309,
        3286998549,
        1016092578,
        2535922412,
        2839152426,
        457141659,
        509813237,
        4120667899,
        652014361,
        1966332200,
        2975202805,
        55981186,
        2327461051,
        676427537,
        3255491064,
        2882294119,
        3433927263,
        1307055953,
        942726286,
        933058658,
        2468411793,
        3933900994,
        4215176142,
        1361170020,
        2001714738,
        2830558078,
        3274259782,
        1222529897,
        1679025792,
        2729314320,
        3714953764,
        1770335741,
        151462246,
        3013232138,
        1682292957,
        1483529935,
        471910574,
        1539241949,
        458788160,
        3436315007,
        1807016891,
        3718408830,
        978976581,
        1043663428,
        3165965781,
        1927990952,
        4200891579,
        2372276910,
        3208408903,
        3533431907,
        1412390302,
        2931980059,
        4132332400,
        1947078029,
        3881505623,
        4168226417,
        2941484381,
        1077988104,
        1320477388,
        886195818,
        18198404,
        3786409e3,
        2509781533,
        112762804,
        3463356488,
        1866414978,
        891333506,
        18488651,
        661792760,
        1628790961,
        3885187036,
        3141171499,
        876946877,
        2693282273,
        1372485963,
        791857591,
        2686433993,
        3759982718,
        3167212022,
        3472953795,
        2716379847,
        445679433,
        3561995674,
        3504004811,
        3574258232,
        54117162,
        3331405415,
        2381918588,
        3769707343,
        4154350007,
        1140177722,
        4074052095,
        668550556,
        3214352940,
        367459370,
        261225585,
        2610173221,
        4209349473,
        3468074219,
        3265815641,
        314222801,
        3066103646,
        3808782860,
        282218597,
        3406013506,
        3773591054,
        379116347,
        1285071038,
        846784868,
        2669647154,
        3771962079,
        3550491691,
        2305946142,
        453669953,
        1268987020,
        3317592352,
        3279303384,
        3744833421,
        2610507566,
        3859509063,
        266596637,
        3847019092,
        517658769,
        3462560207,
        3443424879,
        370717030,
        4247526661,
        2224018117,
        4143653529,
        4112773975,
        2788324899,
        2477274417,
        1456262402,
        2901442914,
        1517677493,
        1846949527,
        2295493580,
        3734397586,
        2176403920,
        1280348187,
        1908823572,
        3871786941,
        846861322,
        1172426758,
        3287448474,
        3383383037,
        1655181056,
        3139813346,
        901632758,
        1897031941,
        2986607138,
        3066810236,
        3447102507,
        1393639104,
        373351379,
        950779232,
        625454576,
        3124240540,
        4148612726,
        2007998917,
        544563296,
        2244738638,
        2330496472,
        2058025392,
        1291430526,
        424198748,
        50039436,
        29584100,
        3605783033,
        2429876329,
        2791104160,
        1057563949,
        3255363231,
        3075367218,
        3463963227,
        1469046755,
        985887462
      ];
      var C_ORIG = [
        1332899944,
        1700884034,
        1701343084,
        1684370003,
        1668446532,
        1869963892
      ];
      function _encipher(lr, off2, P, S) {
        var n, l = lr[off2], r = lr[off2 + 1];
        l ^= P[0];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[1];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[2];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[3];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[4];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[5];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[6];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[7];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[8];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[9];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[10];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[11];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[12];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[13];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[14];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[15];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[16];
        lr[off2] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
        lr[off2 + 1] = l;
        return lr;
      }
      __name(_encipher, "_encipher");
      function _streamtoword(data, offp) {
        for (var i = 0, word = 0; i < 4; ++i)
          word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
        return { key: word, offp };
      }
      __name(_streamtoword, "_streamtoword");
      function _key(key, P, S) {
        var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
        for (i = 0; i < plen; i += 2)
          lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_key, "_key");
      function _ekskey(data, key, P, S) {
        var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
        offp = 0;
        for (i = 0; i < plen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_ekskey, "_ekskey");
      function _crypt(b, salt, rounds, callback, progressCallback) {
        var cdata = C_ORIG.slice(), clen = cdata.length, err;
        if (rounds < 4 || rounds > 31) {
          err = Error("Illegal number of rounds (4-31): " + rounds);
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.length !== BCRYPT_SALT_LEN) {
          err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        rounds = 1 << rounds >>> 0;
        var P, S, i = 0, j;
        if (Int32Array) {
          P = new Int32Array(P_ORIG);
          S = new Int32Array(S_ORIG);
        } else {
          P = P_ORIG.slice();
          S = S_ORIG.slice();
        }
        _ekskey(salt, b, P, S);
        function next() {
          if (progressCallback)
            progressCallback(i / rounds);
          if (i < rounds) {
            var start = Date.now();
            for (; i < rounds; ) {
              i = i + 1;
              _key(b, P, S);
              _key(salt, P, S);
              if (Date.now() - start > MAX_EXECUTION_TIME)
                break;
            }
          } else {
            for (i = 0; i < 64; i++)
              for (j = 0; j < clen >> 1; j++)
                _encipher(cdata, j << 1, P, S);
            var ret = [];
            for (i = 0; i < clen; i++)
              ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
            if (callback) {
              callback(null, ret);
              return;
            } else
              return ret;
          }
          if (callback)
            nextTick2(next);
        }
        __name(next, "next");
        if (typeof callback !== "undefined") {
          next();
        } else {
          var res;
          while (true)
            if (typeof (res = next()) !== "undefined")
              return res || [];
        }
      }
      __name(_crypt, "_crypt");
      function _hash(s, salt, callback, progressCallback) {
        var err;
        if (typeof s !== "string" || typeof salt !== "string") {
          err = Error("Invalid string / salt: Not a string");
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var minor, offset;
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
          err = Error("Invalid salt version: " + salt.substring(0, 2));
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.charAt(2) === "$")
          minor = String.fromCharCode(0), offset = 3;
        else {
          minor = salt.charAt(2);
          if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else
              throw err;
          }
          offset = 4;
        }
        if (salt.charAt(offset + 2) > "$") {
          err = Error("Missing salt rounds");
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
        s += minor >= "a" ? "\0" : "";
        var passwordb = stringToBytes(s), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
        function finish(bytes) {
          var res = [];
          res.push("$2");
          if (minor >= "a")
            res.push(minor);
          res.push("$");
          if (rounds < 10)
            res.push("0");
          res.push(rounds.toString());
          res.push("$");
          res.push(base64_encode(saltb, saltb.length));
          res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
          return res.join("");
        }
        __name(finish, "finish");
        if (typeof callback == "undefined")
          return finish(_crypt(passwordb, saltb, rounds));
        else {
          _crypt(passwordb, saltb, rounds, function(err2, bytes) {
            if (err2)
              callback(err2, null);
            else
              callback(null, finish(bytes));
          }, progressCallback);
        }
      }
      __name(_hash, "_hash");
      bcrypt2.encodeBase64 = base64_encode;
      bcrypt2.decodeBase64 = base64_decode;
      return bcrypt2;
    });
  }
});

// node-built-in-modules:buffer
import libDefault2 from "buffer";
var require_buffer = __commonJS({
  "node-built-in-modules:buffer"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault2;
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var buffer = require_buffer();
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    __name(copyProps, "copyProps");
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    __name(SafeBuffer, "SafeBuffer");
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node-built-in-modules:stream
import libDefault3 from "stream";
var require_stream = __commonJS({
  "node-built-in-modules:stream"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault3;
  }
});

// node-built-in-modules:util
import libDefault4 from "util";
var require_util = __commonJS({
  "node-built-in-modules:util"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault4;
  }
});

// node_modules/jws/lib/data-stream.js
var require_data_stream = __commonJS({
  "node_modules/jws/lib/data-stream.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_safe_buffer().Buffer;
    var Stream = require_stream();
    var util = require_util();
    function DataStream(data) {
      this.buffer = null;
      this.writable = true;
      this.readable = true;
      if (!data) {
        this.buffer = Buffer2.alloc(0);
        return this;
      }
      if (typeof data.pipe === "function") {
        this.buffer = Buffer2.alloc(0);
        data.pipe(this);
        return this;
      }
      if (data.length || typeof data === "object") {
        this.buffer = data;
        this.writable = false;
        process.nextTick(function() {
          this.emit("end", data);
          this.readable = false;
          this.emit("close");
        }.bind(this));
        return this;
      }
      throw new TypeError("Unexpected data type (" + typeof data + ")");
    }
    __name(DataStream, "DataStream");
    util.inherits(DataStream, Stream);
    DataStream.prototype.write = /* @__PURE__ */ __name(function write(data) {
      this.buffer = Buffer2.concat([this.buffer, Buffer2.from(data)]);
      this.emit("data", data);
    }, "write");
    DataStream.prototype.end = /* @__PURE__ */ __name(function end(data) {
      if (data)
        this.write(data);
      this.emit("end", data);
      this.emit("close");
      this.writable = false;
      this.readable = false;
    }, "end");
    module.exports = DataStream;
  }
});

// node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js
var require_param_bytes_for_alg = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    function getParamSize(keySize) {
      var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
      return result;
    }
    __name(getParamSize, "getParamSize");
    var paramBytesForAlg = {
      ES256: getParamSize(256),
      ES384: getParamSize(384),
      ES512: getParamSize(521)
    };
    function getParamBytesForAlg(alg) {
      var paramBytes = paramBytesForAlg[alg];
      if (paramBytes) {
        return paramBytes;
      }
      throw new Error('Unknown algorithm "' + alg + '"');
    }
    __name(getParamBytesForAlg, "getParamBytesForAlg");
    module.exports = getParamBytesForAlg;
  }
});

// node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js
var require_ecdsa_sig_formatter = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_safe_buffer().Buffer;
    var getParamBytesForAlg = require_param_bytes_for_alg();
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function base64Url(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(base64Url, "base64Url");
    function signatureAsBuffer(signature) {
      if (Buffer2.isBuffer(signature)) {
        return signature;
      } else if ("string" === typeof signature) {
        return Buffer2.from(signature, "base64");
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
    }
    __name(signatureAsBuffer, "signatureAsBuffer");
    function derToJose(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var maxEncodedParamLength = paramBytes + 1;
      var inputLength = signature.length;
      var offset = 0;
      if (signature[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
      }
      var seqLength = signature[offset++];
      if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signature[offset++];
      }
      if (inputLength - offset < seqLength) {
        throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
      }
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
      }
      var rLength = signature[offset++];
      if (inputLength - offset - 2 < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
      }
      if (maxEncodedParamLength < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var rOffset = offset;
      offset += rLength;
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
      }
      var sLength = signature[offset++];
      if (inputLength - offset !== sLength) {
        throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
      }
      if (maxEncodedParamLength < sLength) {
        throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var sOffset = offset;
      offset += sLength;
      if (offset !== inputLength) {
        throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
      }
      var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
      var dst = Buffer2.allocUnsafe(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
      offset = paramBytes;
      for (var o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
      dst = dst.toString("base64");
      dst = base64Url(dst);
      return dst;
    }
    __name(derToJose, "derToJose");
    function countPadding(buf, start, stop) {
      var padding = 0;
      while (start + padding < stop && buf[start + padding] === 0) {
        ++padding;
      }
      var needsSign = buf[start + padding] >= MAX_OCTET;
      if (needsSign) {
        --padding;
      }
      return padding;
    }
    __name(countPadding, "countPadding");
    function joseToDer(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var signatureBytes = signature.length;
      if (signatureBytes !== paramBytes * 2) {
        throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
      }
      var rPadding = countPadding(signature, 0, paramBytes);
      var sPadding = countPadding(signature, paramBytes, signature.length);
      var rLength = paramBytes - rPadding;
      var sLength = paramBytes - sPadding;
      var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
      var shortLength = rsBytes < MAX_OCTET;
      var dst = Buffer2.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
      var offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = rLength;
      if (rPadding < 0) {
        dst[offset++] = 0;
        offset += signature.copy(dst, offset, 0, paramBytes);
      } else {
        offset += signature.copy(dst, offset, rPadding, paramBytes);
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = sLength;
      if (sPadding < 0) {
        dst[offset++] = 0;
        signature.copy(dst, offset, paramBytes);
      } else {
        signature.copy(dst, offset, paramBytes + sPadding);
      }
      return dst;
    }
    __name(joseToDer, "joseToDer");
    module.exports = {
      derToJose,
      joseToDer
    };
  }
});

// node_modules/buffer-equal-constant-time/index.js
var require_buffer_equal_constant_time = __commonJS({
  "node_modules/buffer-equal-constant-time/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_buffer().Buffer;
    var SlowBuffer = require_buffer().SlowBuffer;
    module.exports = bufferEq;
    function bufferEq(a, b) {
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      var c = 0;
      for (var i = 0; i < a.length; i++) {
        c |= a[i] ^ b[i];
      }
      return c === 0;
    }
    __name(bufferEq, "bufferEq");
    bufferEq.install = function() {
      Buffer2.prototype.equal = SlowBuffer.prototype.equal = /* @__PURE__ */ __name(function equal(that) {
        return bufferEq(this, that);
      }, "equal");
    };
    var origBufEqual = Buffer2.prototype.equal;
    var origSlowBufEqual = SlowBuffer.prototype.equal;
    bufferEq.restore = function() {
      Buffer2.prototype.equal = origBufEqual;
      SlowBuffer.prototype.equal = origSlowBufEqual;
    };
  }
});

// node_modules/jwa/index.js
var require_jwa = __commonJS({
  "node_modules/jwa/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_safe_buffer().Buffer;
    var crypto2 = require_crypto();
    var formatEcdsa = require_ecdsa_sig_formatter();
    var util = require_util();
    var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
    var MSG_INVALID_SECRET = "secret must be a string or buffer";
    var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
    var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
    var supportsKeyObjects = typeof crypto2.createPublicKey === "function";
    if (supportsKeyObjects) {
      MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
      MSG_INVALID_SECRET += "or a KeyObject";
    }
    function checkIsPublicKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.type !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.asymmetricKeyType !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
    }
    __name(checkIsPublicKey, "checkIsPublicKey");
    function checkIsPrivateKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (typeof key === "object") {
        return;
      }
      throw typeError(MSG_INVALID_SIGNER_KEY);
    }
    __name(checkIsPrivateKey, "checkIsPrivateKey");
    function checkIsSecretKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return key;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (key.type !== "secret") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_SECRET);
      }
    }
    __name(checkIsSecretKey, "checkIsSecretKey");
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(fromBase64, "fromBase64");
    function toBase64(base64url) {
      base64url = base64url.toString();
      var padding = 4 - base64url.length % 4;
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += "=";
        }
      }
      return base64url.replace(/\-/g, "+").replace(/_/g, "/");
    }
    __name(toBase64, "toBase64");
    function typeError(template) {
      var args = [].slice.call(arguments, 1);
      var errMsg = util.format.bind(util, template).apply(null, args);
      return new TypeError(errMsg);
    }
    __name(typeError, "typeError");
    function bufferOrString(obj) {
      return Buffer2.isBuffer(obj) || typeof obj === "string";
    }
    __name(bufferOrString, "bufferOrString");
    function normalizeInput(thing) {
      if (!bufferOrString(thing))
        thing = JSON.stringify(thing);
      return thing;
    }
    __name(normalizeInput, "normalizeInput");
    function createHmacSigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, secret) {
        checkIsSecretKey(secret);
        thing = normalizeInput(thing);
        var hmac = crypto2.createHmac("sha" + bits, secret);
        var sig = (hmac.update(thing), hmac.digest("base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createHmacSigner, "createHmacSigner");
    var bufferEqual;
    var timingSafeEqual = "timingSafeEqual" in crypto2 ? /* @__PURE__ */ __name(function timingSafeEqual2(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return crypto2.timingSafeEqual(a, b);
    }, "timingSafeEqual") : /* @__PURE__ */ __name(function timingSafeEqual2(a, b) {
      if (!bufferEqual) {
        bufferEqual = require_buffer_equal_constant_time();
      }
      return bufferEqual(a, b);
    }, "timingSafeEqual");
    function createHmacVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return timingSafeEqual(Buffer2.from(signature), Buffer2.from(computedSig));
      }, "verify");
    }
    __name(createHmacVerifier, "createHmacVerifier");
    function createKeySigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createKeySigner, "createKeySigner");
    function createKeyVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, "base64");
      }, "verify");
    }
    __name(createKeyVerifier, "createKeyVerifier");
    function createPSSKeySigner(bits) {
      return /* @__PURE__ */ __name(function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto2.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign({
          key: privateKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, "base64"));
        return fromBase64(sig);
      }, "sign");
    }
    __name(createPSSKeySigner, "createPSSKeySigner");
    function createPSSKeyVerifier(bits) {
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto2.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify({
          key: publicKey,
          padding: crypto2.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto2.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, "base64");
      }, "verify");
    }
    __name(createPSSKeyVerifier, "createPSSKeyVerifier");
    function createECDSASigner(bits) {
      var inner = createKeySigner(bits);
      return /* @__PURE__ */ __name(function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, "ES" + bits);
        return signature;
      }, "sign");
    }
    __name(createECDSASigner, "createECDSASigner");
    function createECDSAVerifer(bits) {
      var inner = createKeyVerifier(bits);
      return /* @__PURE__ */ __name(function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
        var result = inner(thing, signature, publicKey);
        return result;
      }, "verify");
    }
    __name(createECDSAVerifer, "createECDSAVerifer");
    function createNoneSigner() {
      return /* @__PURE__ */ __name(function sign() {
        return "";
      }, "sign");
    }
    __name(createNoneSigner, "createNoneSigner");
    function createNoneVerifier() {
      return /* @__PURE__ */ __name(function verify(thing, signature) {
        return signature === "";
      }, "verify");
    }
    __name(createNoneVerifier, "createNoneVerifier");
    module.exports = /* @__PURE__ */ __name(function jwa(algorithm) {
      var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
      };
      var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
      };
      var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
      if (!match)
        throw typeError(MSG_INVALID_ALGORITHM, algorithm);
      var algo = (match[1] || match[3]).toLowerCase();
      var bits = match[2];
      return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
      };
    }, "jwa");
  }
});

// node_modules/jws/lib/tostring.js
var require_tostring = __commonJS({
  "node_modules/jws/lib/tostring.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_buffer().Buffer;
    module.exports = /* @__PURE__ */ __name(function toString(obj) {
      if (typeof obj === "string")
        return obj;
      if (typeof obj === "number" || Buffer2.isBuffer(obj))
        return obj.toString();
      return JSON.stringify(obj);
    }, "toString");
  }
});

// node_modules/jws/lib/sign-stream.js
var require_sign_stream = __commonJS({
  "node_modules/jws/lib/sign-stream.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require_stream();
    var toString = require_tostring();
    var util = require_util();
    function base64url(string, encoding) {
      return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    __name(base64url, "base64url");
    function jwsSecuredInput(header, payload, encoding) {
      encoding = encoding || "utf8";
      var encodedHeader = base64url(toString(header), "binary");
      var encodedPayload = base64url(toString(payload), encoding);
      return util.format("%s.%s", encodedHeader, encodedPayload);
    }
    __name(jwsSecuredInput, "jwsSecuredInput");
    function jwsSign(opts) {
      var header = opts.header;
      var payload = opts.payload;
      var secretOrKey = opts.secret || opts.privateKey;
      var encoding = opts.encoding;
      var algo = jwa(header.alg);
      var securedInput = jwsSecuredInput(header, payload, encoding);
      var signature = algo.sign(securedInput, secretOrKey);
      return util.format("%s.%s", securedInput, signature);
    }
    __name(jwsSign, "jwsSign");
    function SignStream(opts) {
      var secret = opts.secret;
      secret = secret == null ? opts.privateKey : secret;
      secret = secret == null ? opts.key : secret;
      if (/^hs/i.test(opts.header.alg) === true && secret == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secret);
      this.readable = true;
      this.header = opts.header;
      this.encoding = opts.encoding;
      this.secret = this.privateKey = this.key = secretStream;
      this.payload = new DataStream(opts.payload);
      this.secret.once("close", function() {
        if (!this.payload.writable && this.readable)
          this.sign();
      }.bind(this));
      this.payload.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.sign();
      }.bind(this));
    }
    __name(SignStream, "SignStream");
    util.inherits(SignStream, Stream);
    SignStream.prototype.sign = /* @__PURE__ */ __name(function sign() {
      try {
        var signature = jwsSign({
          header: this.header,
          payload: this.payload.buffer,
          secret: this.secret.buffer,
          encoding: this.encoding
        });
        this.emit("done", signature);
        this.emit("data", signature);
        this.emit("end");
        this.readable = false;
        return signature;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    }, "sign");
    SignStream.sign = jwsSign;
    module.exports = SignStream;
  }
});

// node_modules/jws/lib/verify-stream.js
var require_verify_stream = __commonJS({
  "node_modules/jws/lib/verify-stream.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require_stream();
    var toString = require_tostring();
    var util = require_util();
    var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    function isObject(thing) {
      return Object.prototype.toString.call(thing) === "[object Object]";
    }
    __name(isObject, "isObject");
    function safeJsonParse(thing) {
      if (isObject(thing))
        return thing;
      try {
        return JSON.parse(thing);
      } catch (e) {
        return void 0;
      }
    }
    __name(safeJsonParse, "safeJsonParse");
    function headerFromJWS(jwsSig) {
      var encodedHeader = jwsSig.split(".", 1)[0];
      return safeJsonParse(Buffer2.from(encodedHeader, "base64").toString("binary"));
    }
    __name(headerFromJWS, "headerFromJWS");
    function securedInputFromJWS(jwsSig) {
      return jwsSig.split(".", 2).join(".");
    }
    __name(securedInputFromJWS, "securedInputFromJWS");
    function signatureFromJWS(jwsSig) {
      return jwsSig.split(".")[2];
    }
    __name(signatureFromJWS, "signatureFromJWS");
    function payloadFromJWS(jwsSig, encoding) {
      encoding = encoding || "utf8";
      var payload = jwsSig.split(".")[1];
      return Buffer2.from(payload, "base64").toString(encoding);
    }
    __name(payloadFromJWS, "payloadFromJWS");
    function isValidJws(string) {
      return JWS_REGEX.test(string) && !!headerFromJWS(string);
    }
    __name(isValidJws, "isValidJws");
    function jwsVerify(jwsSig, algorithm, secretOrKey) {
      if (!algorithm) {
        var err = new Error("Missing algorithm parameter for jws.verify");
        err.code = "MISSING_ALGORITHM";
        throw err;
      }
      jwsSig = toString(jwsSig);
      var signature = signatureFromJWS(jwsSig);
      var securedInput = securedInputFromJWS(jwsSig);
      var algo = jwa(algorithm);
      return algo.verify(securedInput, signature, secretOrKey);
    }
    __name(jwsVerify, "jwsVerify");
    function jwsDecode(jwsSig, opts) {
      opts = opts || {};
      jwsSig = toString(jwsSig);
      if (!isValidJws(jwsSig))
        return null;
      var header = headerFromJWS(jwsSig);
      if (!header)
        return null;
      var payload = payloadFromJWS(jwsSig);
      if (header.typ === "JWT" || opts.json)
        payload = JSON.parse(payload, opts.encoding);
      return {
        header,
        payload,
        signature: signatureFromJWS(jwsSig)
      };
    }
    __name(jwsDecode, "jwsDecode");
    function VerifyStream(opts) {
      opts = opts || {};
      var secretOrKey = opts.secret;
      secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
      secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
      if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secretOrKey);
      this.readable = true;
      this.algorithm = opts.algorithm;
      this.encoding = opts.encoding;
      this.secret = this.publicKey = this.key = secretStream;
      this.signature = new DataStream(opts.signature);
      this.secret.once("close", function() {
        if (!this.signature.writable && this.readable)
          this.verify();
      }.bind(this));
      this.signature.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.verify();
      }.bind(this));
    }
    __name(VerifyStream, "VerifyStream");
    util.inherits(VerifyStream, Stream);
    VerifyStream.prototype.verify = /* @__PURE__ */ __name(function verify() {
      try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit("done", valid, obj);
        this.emit("data", valid);
        this.emit("end");
        this.readable = false;
        return valid;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    }, "verify");
    VerifyStream.decode = jwsDecode;
    VerifyStream.isValid = isValidJws;
    VerifyStream.verify = jwsVerify;
    module.exports = VerifyStream;
  }
});

// node_modules/jws/index.js
var require_jws = __commonJS({
  "node_modules/jws/index.js"(exports) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SignStream = require_sign_stream();
    var VerifyStream = require_verify_stream();
    var ALGORITHMS = [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512"
    ];
    exports.ALGORITHMS = ALGORITHMS;
    exports.sign = SignStream.sign;
    exports.verify = VerifyStream.verify;
    exports.decode = VerifyStream.decode;
    exports.isValid = VerifyStream.isValid;
    exports.createSign = /* @__PURE__ */ __name(function createSign(opts) {
      return new SignStream(opts);
    }, "createSign");
    exports.createVerify = /* @__PURE__ */ __name(function createVerify(opts) {
      return new VerifyStream(opts);
    }, "createVerify");
  }
});

// node_modules/jsonwebtoken/decode.js
var require_decode = __commonJS({
  "node_modules/jsonwebtoken/decode.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var jws = require_jws();
    module.exports = function(jwt2, options) {
      options = options || {};
      var decoded = jws.decode(jwt2, options);
      if (!decoded) {
        return null;
      }
      var payload = decoded.payload;
      if (typeof payload === "string") {
        try {
          var obj = JSON.parse(payload);
          if (obj !== null && typeof obj === "object") {
            payload = obj;
          }
        } catch (e) {
        }
      }
      if (options.complete === true) {
        return {
          header: decoded.header,
          payload,
          signature: decoded.signature
        };
      }
      return payload;
    };
  }
});

// node_modules/jsonwebtoken/lib/JsonWebTokenError.js
var require_JsonWebTokenError = __commonJS({
  "node_modules/jsonwebtoken/lib/JsonWebTokenError.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var JsonWebTokenError = /* @__PURE__ */ __name(function(message, error3) {
      Error.call(this, message);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
      this.name = "JsonWebTokenError";
      this.message = message;
      if (error3) this.inner = error3;
    }, "JsonWebTokenError");
    JsonWebTokenError.prototype = Object.create(Error.prototype);
    JsonWebTokenError.prototype.constructor = JsonWebTokenError;
    module.exports = JsonWebTokenError;
  }
});

// node_modules/jsonwebtoken/lib/NotBeforeError.js
var require_NotBeforeError = __commonJS({
  "node_modules/jsonwebtoken/lib/NotBeforeError.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = /* @__PURE__ */ __name(function(message, date) {
      JsonWebTokenError.call(this, message);
      this.name = "NotBeforeError";
      this.date = date;
    }, "NotBeforeError");
    NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);
    NotBeforeError.prototype.constructor = NotBeforeError;
    module.exports = NotBeforeError;
  }
});

// node_modules/jsonwebtoken/lib/TokenExpiredError.js
var require_TokenExpiredError = __commonJS({
  "node_modules/jsonwebtoken/lib/TokenExpiredError.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var JsonWebTokenError = require_JsonWebTokenError();
    var TokenExpiredError = /* @__PURE__ */ __name(function(message, expiredAt) {
      JsonWebTokenError.call(this, message);
      this.name = "TokenExpiredError";
      this.expiredAt = expiredAt;
    }, "TokenExpiredError");
    TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);
    TokenExpiredError.prototype.constructor = TokenExpiredError;
    module.exports = TokenExpiredError;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    __name(parse, "parse");
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    __name(fmtShort, "fmtShort");
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    __name(fmtLong, "fmtLong");
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
    __name(plural, "plural");
  }
});

// node_modules/jsonwebtoken/lib/timespan.js
var require_timespan = __commonJS({
  "node_modules/jsonwebtoken/lib/timespan.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ms = require_ms();
    module.exports = function(time3, iat) {
      var timestamp = iat || Math.floor(Date.now() / 1e3);
      if (typeof time3 === "string") {
        var milliseconds = ms(time3);
        if (typeof milliseconds === "undefined") {
          return;
        }
        return Math.floor(timestamp + milliseconds / 1e3);
      } else if (typeof time3 === "number") {
        return timestamp + time3;
      } else {
        return;
      }
    };
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var debug3 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug3;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug3 = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = /* @__PURE__ */ __name((value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    }, "makeSafeRegex");
    var createToken = /* @__PURE__ */ __name((name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug3(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    }, "createToken");
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = /* @__PURE__ */ __name((options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    }, "parseOptions");
    module.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = /* @__PURE__ */ __name((a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    }, "compareIdentifiers");
    var rcompareIdentifiers = /* @__PURE__ */ __name((a, b) => compareIdentifiers(b, a), "rcompareIdentifiers");
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var debug3 = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      static {
        __name(this, "SemVer");
      }
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof _SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug3("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug3("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug3("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug3("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release2, identifier, identifierBase) {
        if (release2.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release2) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release2}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var parse = /* @__PURE__ */ __name((version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    }, "parse");
    module.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var parse = require_parse();
    var valid = /* @__PURE__ */ __name((version2, options) => {
      const v = parse(version2, options);
      return v ? v.version : null;
    }, "valid");
    module.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var parse = require_parse();
    var clean = /* @__PURE__ */ __name((version2, options) => {
      const s = parse(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    }, "clean");
    module.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var inc = /* @__PURE__ */ __name((version2, release2, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release2, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    }, "inc");
    module.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var parse = require_parse();
    var diff = /* @__PURE__ */ __name((version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    }, "diff");
    module.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var major = /* @__PURE__ */ __name((a, loose) => new SemVer(a, loose).major, "major");
    module.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var minor = /* @__PURE__ */ __name((a, loose) => new SemVer(a, loose).minor, "minor");
    module.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var patch = /* @__PURE__ */ __name((a, loose) => new SemVer(a, loose).patch, "patch");
    module.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var parse = require_parse();
    var prerelease = /* @__PURE__ */ __name((version2, options) => {
      const parsed = parse(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    }, "prerelease");
    module.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var compare = /* @__PURE__ */ __name((a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose)), "compare");
    module.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var rcompare = /* @__PURE__ */ __name((a, b, loose) => compare(b, a, loose), "rcompare");
    module.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var compareLoose = /* @__PURE__ */ __name((a, b) => compare(a, b, true), "compareLoose");
    module.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var compareBuild = /* @__PURE__ */ __name((a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    }, "compareBuild");
    module.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compareBuild = require_compare_build();
    var sort = /* @__PURE__ */ __name((list, loose) => list.sort((a, b) => compareBuild(a, b, loose)), "sort");
    module.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compareBuild = require_compare_build();
    var rsort = /* @__PURE__ */ __name((list, loose) => list.sort((a, b) => compareBuild(b, a, loose)), "rsort");
    module.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var gt = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) > 0, "gt");
    module.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var lt = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) < 0, "lt");
    module.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var eq = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) === 0, "eq");
    module.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var neq = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) !== 0, "neq");
    module.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var gte = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) >= 0, "gte");
    module.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var compare = require_compare();
    var lte = /* @__PURE__ */ __name((a, b, loose) => compare(a, b, loose) <= 0, "lte");
    module.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = /* @__PURE__ */ __name((a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    }, "cmp");
    module.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = /* @__PURE__ */ __name((version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    }, "coerce");
    module.exports = coerce;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var LRUCache = class {
      static {
        __name(this, "LRUCache");
      }
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      static {
        __name(this, "Range");
      }
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug3("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug3("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug3("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug3("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug3("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug3("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug3 = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = /* @__PURE__ */ __name((c) => c.value === "<0.0.0-0", "isNullSet");
    var isAny = /* @__PURE__ */ __name((c) => c.value === "", "isAny");
    var isSatisfiable = /* @__PURE__ */ __name((comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    }, "isSatisfiable");
    var parseComparator = /* @__PURE__ */ __name((comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug3("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug3("caret", comp);
      comp = replaceTildes(comp, options);
      debug3("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug3("xrange", comp);
      comp = replaceStars(comp, options);
      debug3("stars", comp);
      return comp;
    }, "parseComparator");
    var isX = /* @__PURE__ */ __name((id) => !id || id.toLowerCase() === "x" || id === "*", "isX");
    var replaceTildes = /* @__PURE__ */ __name((comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    }, "replaceTildes");
    var replaceTilde = /* @__PURE__ */ __name((comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug3("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug3("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug3("tilde return", ret);
        return ret;
      });
    }, "replaceTilde");
    var replaceCarets = /* @__PURE__ */ __name((comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    }, "replaceCarets");
    var replaceCaret = /* @__PURE__ */ __name((comp, options) => {
      debug3("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug3("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug3("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug3("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug3("caret return", ret);
        return ret;
      });
    }, "replaceCaret");
    var replaceXRanges = /* @__PURE__ */ __name((comp, options) => {
      debug3("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    }, "replaceXRanges");
    var replaceXRange = /* @__PURE__ */ __name((comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug3("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug3("xRange return", ret);
        return ret;
      });
    }, "replaceXRange");
    var replaceStars = /* @__PURE__ */ __name((comp, options) => {
      debug3("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    }, "replaceStars");
    var replaceGTE0 = /* @__PURE__ */ __name((comp, options) => {
      debug3("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    }, "replaceGTE0");
    var hyphenReplace = /* @__PURE__ */ __name((incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    }, "hyphenReplace");
    var testSet = /* @__PURE__ */ __name((set, version2, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug3(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }, "testSet");
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static {
        __name(this, "Comparator");
      }
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug3("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug3("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug3("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug3 = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Range = require_range();
    var satisfies = /* @__PURE__ */ __name((version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    }, "satisfies");
    module.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Range = require_range();
    var toComparators = /* @__PURE__ */ __name((range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" ")), "toComparators");
    module.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = /* @__PURE__ */ __name((versions2, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions2.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    }, "maxSatisfying");
    module.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = /* @__PURE__ */ __name((versions2, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions2.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    }, "minSatisfying");
    module.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = /* @__PURE__ */ __name((range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    }, "minVersion");
    module.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Range = require_range();
    var validRange = /* @__PURE__ */ __name((range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    }, "validRange");
    module.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = /* @__PURE__ */ __name((version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    }, "outside");
    module.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var outside = require_outside();
    var gtr = /* @__PURE__ */ __name((version2, range, options) => outside(version2, range, ">", options), "gtr");
    module.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var outside = require_outside();
    var ltr = /* @__PURE__ */ __name((version2, range, options) => outside(version2, range, "<", options), "ltr");
    module.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Range = require_range();
    var intersects = /* @__PURE__ */ __name((r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    }, "intersects");
    module.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions2, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions2.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = /* @__PURE__ */ __name((sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    }, "subset");
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = /* @__PURE__ */ __name((sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    }, "simpleSubset");
    var higherGT = /* @__PURE__ */ __name((a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    }, "higherGT");
    var lowerLT = /* @__PURE__ */ __name((a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    }, "lowerLT");
    module.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/jsonwebtoken/lib/asymmetricKeyDetailsSupported.js
var require_asymmetricKeyDetailsSupported = __commonJS({
  "node_modules/jsonwebtoken/lib/asymmetricKeyDetailsSupported.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var semver = require_semver2();
    module.exports = semver.satisfies(process.version, ">=15.7.0");
  }
});

// node_modules/jsonwebtoken/lib/rsaPssKeyDetailsSupported.js
var require_rsaPssKeyDetailsSupported = __commonJS({
  "node_modules/jsonwebtoken/lib/rsaPssKeyDetailsSupported.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var semver = require_semver2();
    module.exports = semver.satisfies(process.version, ">=16.9.0");
  }
});

// node_modules/jsonwebtoken/lib/validateAsymmetricKey.js
var require_validateAsymmetricKey = __commonJS({
  "node_modules/jsonwebtoken/lib/validateAsymmetricKey.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ASYMMETRIC_KEY_DETAILS_SUPPORTED = require_asymmetricKeyDetailsSupported();
    var RSA_PSS_KEY_DETAILS_SUPPORTED = require_rsaPssKeyDetailsSupported();
    var allowedAlgorithmsForKeys = {
      "ec": ["ES256", "ES384", "ES512"],
      "rsa": ["RS256", "PS256", "RS384", "PS384", "RS512", "PS512"],
      "rsa-pss": ["PS256", "PS384", "PS512"]
    };
    var allowedCurves = {
      ES256: "prime256v1",
      ES384: "secp384r1",
      ES512: "secp521r1"
    };
    module.exports = function(algorithm, key) {
      if (!algorithm || !key) return;
      const keyType = key.asymmetricKeyType;
      if (!keyType) return;
      const allowedAlgorithms = allowedAlgorithmsForKeys[keyType];
      if (!allowedAlgorithms) {
        throw new Error(`Unknown key type "${keyType}".`);
      }
      if (!allowedAlgorithms.includes(algorithm)) {
        throw new Error(`"alg" parameter for "${keyType}" key type must be one of: ${allowedAlgorithms.join(", ")}.`);
      }
      if (ASYMMETRIC_KEY_DETAILS_SUPPORTED) {
        switch (keyType) {
          case "ec":
            const keyCurve = key.asymmetricKeyDetails.namedCurve;
            const allowedCurve = allowedCurves[algorithm];
            if (keyCurve !== allowedCurve) {
              throw new Error(`"alg" parameter "${algorithm}" requires curve "${allowedCurve}".`);
            }
            break;
          case "rsa-pss":
            if (RSA_PSS_KEY_DETAILS_SUPPORTED) {
              const length = parseInt(algorithm.slice(-3), 10);
              const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;
              if (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm) {
                throw new Error(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${algorithm}.`);
              }
              if (saltLength !== void 0 && saltLength > length >> 3) {
                throw new Error(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${algorithm}.`);
              }
            }
            break;
        }
      }
    };
  }
});

// node_modules/jsonwebtoken/lib/psSupported.js
var require_psSupported = __commonJS({
  "node_modules/jsonwebtoken/lib/psSupported.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var semver = require_semver2();
    module.exports = semver.satisfies(process.version, "^6.12.0 || >=8.0.0");
  }
});

// node_modules/jsonwebtoken/verify.js
var require_verify = __commonJS({
  "node_modules/jsonwebtoken/verify.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = require_NotBeforeError();
    var TokenExpiredError = require_TokenExpiredError();
    var decode = require_decode();
    var timespan = require_timespan();
    var validateAsymmetricKey = require_validateAsymmetricKey();
    var PS_SUPPORTED = require_psSupported();
    var jws = require_jws();
    var { KeyObject, createSecretKey, createPublicKey } = require_crypto();
    var PUB_KEY_ALGS = ["RS256", "RS384", "RS512"];
    var EC_KEY_ALGS = ["ES256", "ES384", "ES512"];
    var RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
    var HS_ALGS = ["HS256", "HS384", "HS512"];
    if (PS_SUPPORTED) {
      PUB_KEY_ALGS.splice(PUB_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
      RSA_KEY_ALGS.splice(RSA_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
    }
    module.exports = function(jwtString, secretOrPublicKey, options, callback) {
      if (typeof options === "function" && !callback) {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }
      options = Object.assign({}, options);
      let done;
      if (callback) {
        done = callback;
      } else {
        done = /* @__PURE__ */ __name(function(err, data) {
          if (err) throw err;
          return data;
        }, "done");
      }
      if (options.clockTimestamp && typeof options.clockTimestamp !== "number") {
        return done(new JsonWebTokenError("clockTimestamp must be a number"));
      }
      if (options.nonce !== void 0 && (typeof options.nonce !== "string" || options.nonce.trim() === "")) {
        return done(new JsonWebTokenError("nonce must be a non-empty string"));
      }
      if (options.allowInvalidAsymmetricKeyTypes !== void 0 && typeof options.allowInvalidAsymmetricKeyTypes !== "boolean") {
        return done(new JsonWebTokenError("allowInvalidAsymmetricKeyTypes must be a boolean"));
      }
      const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1e3);
      if (!jwtString) {
        return done(new JsonWebTokenError("jwt must be provided"));
      }
      if (typeof jwtString !== "string") {
        return done(new JsonWebTokenError("jwt must be a string"));
      }
      const parts = jwtString.split(".");
      if (parts.length !== 3) {
        return done(new JsonWebTokenError("jwt malformed"));
      }
      let decodedToken;
      try {
        decodedToken = decode(jwtString, { complete: true });
      } catch (err) {
        return done(err);
      }
      if (!decodedToken) {
        return done(new JsonWebTokenError("invalid token"));
      }
      const header = decodedToken.header;
      let getSecret;
      if (typeof secretOrPublicKey === "function") {
        if (!callback) {
          return done(new JsonWebTokenError("verify must be called asynchronous if secret or public key is provided as a callback"));
        }
        getSecret = secretOrPublicKey;
      } else {
        getSecret = /* @__PURE__ */ __name(function(header2, secretCallback) {
          return secretCallback(null, secretOrPublicKey);
        }, "getSecret");
      }
      return getSecret(header, function(err, secretOrPublicKey2) {
        if (err) {
          return done(new JsonWebTokenError("error in secret or public key callback: " + err.message));
        }
        const hasSignature = parts[2].trim() !== "";
        if (!hasSignature && secretOrPublicKey2) {
          return done(new JsonWebTokenError("jwt signature is required"));
        }
        if (hasSignature && !secretOrPublicKey2) {
          return done(new JsonWebTokenError("secret or public key must be provided"));
        }
        if (!hasSignature && !options.algorithms) {
          return done(new JsonWebTokenError('please specify "none" in "algorithms" to verify unsigned tokens'));
        }
        if (secretOrPublicKey2 != null && !(secretOrPublicKey2 instanceof KeyObject)) {
          try {
            secretOrPublicKey2 = createPublicKey(secretOrPublicKey2);
          } catch (_) {
            try {
              secretOrPublicKey2 = createSecretKey(typeof secretOrPublicKey2 === "string" ? Buffer.from(secretOrPublicKey2) : secretOrPublicKey2);
            } catch (_2) {
              return done(new JsonWebTokenError("secretOrPublicKey is not valid key material"));
            }
          }
        }
        if (!options.algorithms) {
          if (secretOrPublicKey2.type === "secret") {
            options.algorithms = HS_ALGS;
          } else if (["rsa", "rsa-pss"].includes(secretOrPublicKey2.asymmetricKeyType)) {
            options.algorithms = RSA_KEY_ALGS;
          } else if (secretOrPublicKey2.asymmetricKeyType === "ec") {
            options.algorithms = EC_KEY_ALGS;
          } else {
            options.algorithms = PUB_KEY_ALGS;
          }
        }
        if (options.algorithms.indexOf(decodedToken.header.alg) === -1) {
          return done(new JsonWebTokenError("invalid algorithm"));
        }
        if (header.alg.startsWith("HS") && secretOrPublicKey2.type !== "secret") {
          return done(new JsonWebTokenError(`secretOrPublicKey must be a symmetric key when using ${header.alg}`));
        } else if (/^(?:RS|PS|ES)/.test(header.alg) && secretOrPublicKey2.type !== "public") {
          return done(new JsonWebTokenError(`secretOrPublicKey must be an asymmetric key when using ${header.alg}`));
        }
        if (!options.allowInvalidAsymmetricKeyTypes) {
          try {
            validateAsymmetricKey(header.alg, secretOrPublicKey2);
          } catch (e) {
            return done(e);
          }
        }
        let valid;
        try {
          valid = jws.verify(jwtString, decodedToken.header.alg, secretOrPublicKey2);
        } catch (e) {
          return done(e);
        }
        if (!valid) {
          return done(new JsonWebTokenError("invalid signature"));
        }
        const payload = decodedToken.payload;
        if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
          if (typeof payload.nbf !== "number") {
            return done(new JsonWebTokenError("invalid nbf value"));
          }
          if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
            return done(new NotBeforeError("jwt not active", new Date(payload.nbf * 1e3)));
          }
        }
        if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
          if (typeof payload.exp !== "number") {
            return done(new JsonWebTokenError("invalid exp value"));
          }
          if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("jwt expired", new Date(payload.exp * 1e3)));
          }
        }
        if (options.audience) {
          const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
          const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
          const match = target.some(function(targetAudience) {
            return audiences.some(function(audience) {
              return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
            });
          });
          if (!match) {
            return done(new JsonWebTokenError("jwt audience invalid. expected: " + audiences.join(" or ")));
          }
        }
        if (options.issuer) {
          const invalid_issuer = typeof options.issuer === "string" && payload.iss !== options.issuer || Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1;
          if (invalid_issuer) {
            return done(new JsonWebTokenError("jwt issuer invalid. expected: " + options.issuer));
          }
        }
        if (options.subject) {
          if (payload.sub !== options.subject) {
            return done(new JsonWebTokenError("jwt subject invalid. expected: " + options.subject));
          }
        }
        if (options.jwtid) {
          if (payload.jti !== options.jwtid) {
            return done(new JsonWebTokenError("jwt jwtid invalid. expected: " + options.jwtid));
          }
        }
        if (options.nonce) {
          if (payload.nonce !== options.nonce) {
            return done(new JsonWebTokenError("jwt nonce invalid. expected: " + options.nonce));
          }
        }
        if (options.maxAge) {
          if (typeof payload.iat !== "number") {
            return done(new JsonWebTokenError("iat required when maxAge is specified"));
          }
          const maxAgeTimestamp = timespan(options.maxAge, payload.iat);
          if (typeof maxAgeTimestamp === "undefined") {
            return done(new JsonWebTokenError('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
          }
          if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("maxAge exceeded", new Date(maxAgeTimestamp * 1e3)));
          }
        }
        if (options.complete === true) {
          const signature = decodedToken.signature;
          return done(null, {
            header,
            payload,
            signature
          });
        }
        return done(null, payload);
      });
    };
  }
});

// node_modules/lodash.includes/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.includes/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var INFINITY = 1 / 0;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var argsTag = "[object Arguments]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var freeParseInt = parseInt;
    function arrayMap(array, iteratee) {
      var index = -1, length = array ? array.length : 0, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    __name(arrayMap, "arrayMap");
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    __name(baseFindIndex, "baseFindIndex");
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    __name(baseIndexOf, "baseIndexOf");
    function baseIsNaN(value) {
      return value !== value;
    }
    __name(baseIsNaN, "baseIsNaN");
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    __name(baseTimes, "baseTimes");
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    __name(baseValues, "baseValues");
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    __name(overArg, "overArg");
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeKeys = overArg(Object.keys, Object);
    var nativeMax = Math.max;
    function arrayLikeKeys(value, inherited) {
      var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
      var length = result.length, skipIndexes = !!length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    __name(arrayLikeKeys, "arrayLikeKeys");
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    __name(baseKeys, "baseKeys");
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    __name(isIndex, "isIndex");
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    __name(isPrototype, "isPrototype");
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
    }
    __name(includes, "includes");
    function isArguments(value) {
      return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    __name(isArguments, "isArguments");
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    __name(isArrayLike, "isArrayLike");
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    __name(isArrayLikeObject, "isArrayLikeObject");
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    __name(isFunction, "isFunction");
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    __name(isLength, "isLength");
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    __name(isObject, "isObject");
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    __name(isString, "isString");
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    __name(isSymbol, "isSymbol");
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    __name(toFinite, "toFinite");
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    __name(toInteger, "toInteger");
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    __name(toNumber, "toNumber");
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    __name(keys, "keys");
    function values(object) {
      return object ? baseValues(object, keys(object)) : [];
    }
    __name(values, "values");
    module.exports = includes;
  }
});

// node_modules/lodash.isboolean/index.js
var require_lodash2 = __commonJS({
  "node_modules/lodash.isboolean/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var boolTag = "[object Boolean]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isBoolean(value) {
      return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
    }
    __name(isBoolean, "isBoolean");
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    module.exports = isBoolean;
  }
});

// node_modules/lodash.isinteger/index.js
var require_lodash3 = __commonJS({
  "node_modules/lodash.isinteger/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isInteger(value) {
      return typeof value == "number" && value == toInteger(value);
    }
    __name(isInteger, "isInteger");
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    __name(isObject, "isObject");
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    __name(isSymbol, "isSymbol");
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    __name(toFinite, "toFinite");
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    __name(toInteger, "toInteger");
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    __name(toNumber, "toNumber");
    module.exports = isInteger;
  }
});

// node_modules/lodash.isnumber/index.js
var require_lodash4 = __commonJS({
  "node_modules/lodash.isnumber/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var numberTag = "[object Number]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isNumber(value) {
      return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
    }
    __name(isNumber, "isNumber");
    module.exports = isNumber;
  }
});

// node_modules/lodash.isplainobject/index.js
var require_lodash5 = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    __name(isHostObject, "isHostObject");
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    __name(overArg, "overArg");
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    __name(isPlainObject, "isPlainObject");
    module.exports = isPlainObject;
  }
});

// node_modules/lodash.isstring/index.js
var require_lodash6 = __commonJS({
  "node_modules/lodash.isstring/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var stringTag = "[object String]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var isArray = Array.isArray;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    __name(isString, "isString");
    module.exports = isString;
  }
});

// node_modules/lodash.once/index.js
var require_lodash7 = __commonJS({
  "node_modules/lodash.once/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var FUNC_ERROR_TEXT = "Expected a function";
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function before(n, func) {
      var result;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = void 0;
        }
        return result;
      };
    }
    __name(before, "before");
    function once2(func) {
      return before(2, func);
    }
    __name(once2, "once");
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    __name(isObject, "isObject");
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    __name(isObjectLike, "isObjectLike");
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    __name(isSymbol, "isSymbol");
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    __name(toFinite, "toFinite");
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    __name(toInteger, "toInteger");
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    __name(toNumber, "toNumber");
    module.exports = once2;
  }
});

// node_modules/jsonwebtoken/sign.js
var require_sign = __commonJS({
  "node_modules/jsonwebtoken/sign.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var timespan = require_timespan();
    var PS_SUPPORTED = require_psSupported();
    var validateAsymmetricKey = require_validateAsymmetricKey();
    var jws = require_jws();
    var includes = require_lodash();
    var isBoolean = require_lodash2();
    var isInteger = require_lodash3();
    var isNumber = require_lodash4();
    var isPlainObject = require_lodash5();
    var isString = require_lodash6();
    var once2 = require_lodash7();
    var { KeyObject, createSecretKey, createPrivateKey } = require_crypto();
    var SUPPORTED_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
    if (PS_SUPPORTED) {
      SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
    }
    var sign_options_schema = {
      expiresIn: { isValid: /* @__PURE__ */ __name(function(value) {
        return isInteger(value) || isString(value) && value;
      }, "isValid"), message: '"expiresIn" should be a number of seconds or string representing a timespan' },
      notBefore: { isValid: /* @__PURE__ */ __name(function(value) {
        return isInteger(value) || isString(value) && value;
      }, "isValid"), message: '"notBefore" should be a number of seconds or string representing a timespan' },
      audience: { isValid: /* @__PURE__ */ __name(function(value) {
        return isString(value) || Array.isArray(value);
      }, "isValid"), message: '"audience" must be a string or array' },
      algorithm: { isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
      header: { isValid: isPlainObject, message: '"header" must be an object' },
      encoding: { isValid: isString, message: '"encoding" must be a string' },
      issuer: { isValid: isString, message: '"issuer" must be a string' },
      subject: { isValid: isString, message: '"subject" must be a string' },
      jwtid: { isValid: isString, message: '"jwtid" must be a string' },
      noTimestamp: { isValid: isBoolean, message: '"noTimestamp" must be a boolean' },
      keyid: { isValid: isString, message: '"keyid" must be a string' },
      mutatePayload: { isValid: isBoolean, message: '"mutatePayload" must be a boolean' },
      allowInsecureKeySizes: { isValid: isBoolean, message: '"allowInsecureKeySizes" must be a boolean' },
      allowInvalidAsymmetricKeyTypes: { isValid: isBoolean, message: '"allowInvalidAsymmetricKeyTypes" must be a boolean' }
    };
    var registered_claims_schema = {
      iat: { isValid: isNumber, message: '"iat" should be a number of seconds' },
      exp: { isValid: isNumber, message: '"exp" should be a number of seconds' },
      nbf: { isValid: isNumber, message: '"nbf" should be a number of seconds' }
    };
    function validate(schema, allowUnknown, object, parameterName) {
      if (!isPlainObject(object)) {
        throw new Error('Expected "' + parameterName + '" to be a plain object.');
      }
      Object.keys(object).forEach(function(key) {
        const validator = schema[key];
        if (!validator) {
          if (!allowUnknown) {
            throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
          }
          return;
        }
        if (!validator.isValid(object[key])) {
          throw new Error(validator.message);
        }
      });
    }
    __name(validate, "validate");
    function validateOptions(options) {
      return validate(sign_options_schema, false, options, "options");
    }
    __name(validateOptions, "validateOptions");
    function validatePayload(payload) {
      return validate(registered_claims_schema, true, payload, "payload");
    }
    __name(validatePayload, "validatePayload");
    var options_to_payload = {
      "audience": "aud",
      "issuer": "iss",
      "subject": "sub",
      "jwtid": "jti"
    };
    var options_for_objects = [
      "expiresIn",
      "notBefore",
      "noTimestamp",
      "audience",
      "issuer",
      "subject",
      "jwtid"
    ];
    module.exports = function(payload, secretOrPrivateKey, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        options = options || {};
      }
      const isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);
      const header = Object.assign({
        alg: options.algorithm || "HS256",
        typ: isObjectPayload ? "JWT" : void 0,
        kid: options.keyid
      }, options.header);
      function failure(err) {
        if (callback) {
          return callback(err);
        }
        throw err;
      }
      __name(failure, "failure");
      if (!secretOrPrivateKey && options.algorithm !== "none") {
        return failure(new Error("secretOrPrivateKey must have a value"));
      }
      if (secretOrPrivateKey != null && !(secretOrPrivateKey instanceof KeyObject)) {
        try {
          secretOrPrivateKey = createPrivateKey(secretOrPrivateKey);
        } catch (_) {
          try {
            secretOrPrivateKey = createSecretKey(typeof secretOrPrivateKey === "string" ? Buffer.from(secretOrPrivateKey) : secretOrPrivateKey);
          } catch (_2) {
            return failure(new Error("secretOrPrivateKey is not valid key material"));
          }
        }
      }
      if (header.alg.startsWith("HS") && secretOrPrivateKey.type !== "secret") {
        return failure(new Error(`secretOrPrivateKey must be a symmetric key when using ${header.alg}`));
      } else if (/^(?:RS|PS|ES)/.test(header.alg)) {
        if (secretOrPrivateKey.type !== "private") {
          return failure(new Error(`secretOrPrivateKey must be an asymmetric key when using ${header.alg}`));
        }
        if (!options.allowInsecureKeySizes && !header.alg.startsWith("ES") && secretOrPrivateKey.asymmetricKeyDetails !== void 0 && //KeyObject.asymmetricKeyDetails is supported in Node 15+
        secretOrPrivateKey.asymmetricKeyDetails.modulusLength < 2048) {
          return failure(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
        }
      }
      if (typeof payload === "undefined") {
        return failure(new Error("payload is required"));
      } else if (isObjectPayload) {
        try {
          validatePayload(payload);
        } catch (error3) {
          return failure(error3);
        }
        if (!options.mutatePayload) {
          payload = Object.assign({}, payload);
        }
      } else {
        const invalid_options = options_for_objects.filter(function(opt) {
          return typeof options[opt] !== "undefined";
        });
        if (invalid_options.length > 0) {
          return failure(new Error("invalid " + invalid_options.join(",") + " option for " + typeof payload + " payload"));
        }
      }
      if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined") {
        return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
      }
      if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined") {
        return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
      }
      try {
        validateOptions(options);
      } catch (error3) {
        return failure(error3);
      }
      if (!options.allowInvalidAsymmetricKeyTypes) {
        try {
          validateAsymmetricKey(header.alg, secretOrPrivateKey);
        } catch (error3) {
          return failure(error3);
        }
      }
      const timestamp = payload.iat || Math.floor(Date.now() / 1e3);
      if (options.noTimestamp) {
        delete payload.iat;
      } else if (isObjectPayload) {
        payload.iat = timestamp;
      }
      if (typeof options.notBefore !== "undefined") {
        try {
          payload.nbf = timespan(options.notBefore, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.nbf === "undefined") {
          return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
        try {
          payload.exp = timespan(options.expiresIn, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.exp === "undefined") {
          return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      Object.keys(options_to_payload).forEach(function(key) {
        const claim = options_to_payload[key];
        if (typeof options[key] !== "undefined") {
          if (typeof payload[claim] !== "undefined") {
            return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
          }
          payload[claim] = options[key];
        }
      });
      const encoding = options.encoding || "utf8";
      if (typeof callback === "function") {
        callback = callback && once2(callback);
        jws.createSign({
          header,
          privateKey: secretOrPrivateKey,
          payload,
          encoding
        }).once("error", callback).once("done", function(signature) {
          if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
            return callback(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
          }
          callback(null, signature);
        });
      } else {
        let signature = jws.sign({ header, payload, secret: secretOrPrivateKey, encoding });
        if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
          throw new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`);
        }
        return signature;
      }
    };
  }
});

// node_modules/jsonwebtoken/index.js
var require_jsonwebtoken = __commonJS({
  "node_modules/jsonwebtoken/index.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = {
      decode: require_decode(),
      verify: require_verify(),
      sign: require_sign(),
      JsonWebTokenError: require_JsonWebTokenError(),
      NotBeforeError: require_NotBeforeError(),
      TokenExpiredError: require_TokenExpiredError()
    };
  }
});

// src/prompt.js
var prompt_exports = {};
__export(prompt_exports, {
  buildLinkQuizSystemPrompt: () => buildLinkQuizSystemPrompt,
  buildLinkQuizUserPrompt: () => buildLinkQuizUserPrompt,
  buildQuizSystemPrompt: () => buildQuizSystemPrompt,
  buildQuizUserPrompt: () => buildQuizUserPrompt,
  buildSystemPrompt: () => buildSystemPrompt,
  buildUserPrompt: () => buildUserPrompt,
  expectedStepsMinMax: () => expectedStepsMinMax,
  linkChainMinMax: () => linkChainMinMax
});
function difficultyLabel(level) {
  const n = Number(level) || 1;
  if (n <= 10) return "Easy";
  if (n <= 30) return "Medium";
  if (n <= 50) return "Hard";
  return "Expert";
}
function stepsMinMax(level) {
  const n = Number(level) || 1;
  if (n <= 10) return { min: 2, max: 3 };
  if (n <= 30) return { min: 3, max: 4 };
  if (n <= 50) return { min: 4, max: 5 };
  return { min: 5, max: 6 };
}
function linkChainMinMax(level) {
  const n = Number(level) || 1;
  if (n <= 10) return { min: 3, max: 4 };
  if (n <= 30) return { min: 4, max: 5 };
  if (n <= 50) return { min: 5, max: 6 };
  return { min: 6, max: 7 };
}
function buildSystemPrompt({ language = "en", level = 1, puzzleType } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);
  const pTypeAr = puzzleType || (Math.random() > 0.5 ? "\u0633\u0644\u0633\u0644\u0629_\u0645\u0646\u0637\u0642\u064A\u0629" : "\u0644\u063A\u0632_\u0634\u0639\u0631\u064A");
  const pTypeEn = puzzleType || (Math.random() > 0.5 ? "logical_chain" : "poetic_riddle");
  if (isArabic) {
    return `\u0623\u0646\u062A \u0645\u0647\u0646\u062F\u0633 \u0623\u0644\u063A\u0627\u0632 \u062E\u0628\u064A\u0631 \u0644\u0644\u0639\u0628\u0629 "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u062C\u064A\u0628" \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649. \u0623\u0646\u062A\u062C \u0623\u0644\u063A\u0627\u0632\u0627\u064B \u0630\u0643\u064A\u0629\u060C \u0645\u0646\u0637\u0642\u064A\u0629\u060C \u0648\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629.

\u26A0\uFE0F \u0642\u064A\u0648\u062F \u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u0645\u062D\u062A\u0648\u0649 (\u0635\u0627\u0631\u0645\u0629 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u062C\u0627\u0648\u0632\u0647\u0627):
- \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0622\u0645\u0646\u0627\u064B \u062A\u0645\u0627\u0645\u0627\u064B \u0648\u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0648\u0627\u0644\u0639\u0627\u0626\u0644\u0629.
- \u064A\u064F\u0645\u0646\u0639 \u0645\u0646\u0639\u0627\u064B \u0628\u0627\u062A\u0627\u064B \u0625\u062F\u0631\u0627\u062C \u0623\u064A \u0645\u062D\u062A\u0648\u0649 \u062C\u0646\u0633\u064A\u060C \u0639\u0646\u064A\u0641\u060C \u0645\u062E\u064A\u0641\u060C \u0623\u0648 \u0644\u0647 \u0639\u0644\u0627\u0642\u0629 \u0628\u0627\u0644\u062C\u0631\u064A\u0645\u0629\u060C \u0627\u0644\u0642\u062A\u0644\u060C \u0623\u0648 \u0627\u0644\u0623\u0630\u0649.
- \u062A\u062C\u0646\u0628 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0623\u0644\u063A\u0627\u0632 \u0627\u0644\u062A\u064A \u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647\u0627 \u0645\u0633\u0628\u0642\u0627\u064B.
- \u0627\u0645\u0646\u0639 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629 \u0627\u0644\u0636\u0639\u064A\u0641\u0629 (\u0645\u062B\u0644: \u0628\u062F\u0627\u064A\u0629\u060C \u0646\u0647\u0627\u064A\u0629\u060C \u0643\u0644\u0645\u0629\u060C \u062E\u0637\u0648\u0629\u060C \u0644\u063A\u0632\u060C \u0631\u0627\u0628\u0637) \u0643\u0625\u062C\u0627\u0628\u0627\u062A.

\u{1F3AF} \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0644\u063A\u0632 \u0627\u0644\u062D\u0627\u0644\u064A:
- \u0646\u0648\u0639 \u0627\u0644\u0644\u063A\u0632 \u0627\u0644\u0645\u0637\u0644\u0648\u0628: ${pTypeAr} (\u0625\u0645\u0627 "\u0633\u0644\u0633\u0644\u0629_\u0645\u0646\u0637\u0642\u064A\u0629" \u0623\u0648 "\u0644\u063A\u0632_\u0634\u0639\u0631\u064A")
- \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0635\u0639\u0648\u0628\u0629: ${difficulty} (\u0633\u0647\u0644\u060C \u0645\u062A\u0648\u0633\u0637\u060C \u0635\u0639\u0628\u060C \u0639\u0628\u0642\u0631\u064A - \u062A\u062A\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0639\u0644\u064A\u0627 \u062A\u0641\u0643\u064A\u0631\u0627\u064B \u0639\u0645\u064A\u0642\u0627\u064B \u0648\u0631\u0628\u0637\u0627\u064B \u063A\u064A\u0631 \u0645\u0628\u0627\u0634\u0631)

1\uFE0F\u20E3 \u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0646\u0645\u0637 \u0627\u0644\u0623\u0648\u0644: "\u0633\u0644\u0633\u0644\u0629_\u0645\u0646\u0637\u0642\u064A\u0629" (Logical Chain)
- \u0627\u0631\u0628\u0637 \u0628\u064A\u0646 \u0643\u0644\u0645\u062A\u064A\u0646 \u062A\u0628\u062F\u0648\u0627\u0646 \u063A\u064A\u0631 \u0645\u062A\u0631\u0627\u0628\u0637\u062A\u064A\u0646 \u0639\u0628\u0631 \u0633\u0644\u0633\u0644\u0629 \u0645\u0646 ${min} \u0625\u0644\u0649 ${max} \u062E\u0637\u0648\u0627\u062A.
- \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062A\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0633\u0645\u0648\u062D\u0629 \u0641\u0642\u0637: (\u0633\u0628\u0628 \u0648\u0646\u062A\u064A\u062C\u0629)\u060C (\u062C\u0632\u0621 \u0645\u0646 \u0643\u0644)\u060C (\u0623\u062F\u0627\u0629 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645)\u060C (\u0639\u0645\u0644\u064A\u0629 \u0637\u0628\u064A\u0639\u064A\u0629).
- \u0643\u0644 \u0627\u0646\u062A\u0642\u0627\u0644 \u0641\u064A \u0627\u0644\u0633\u0644\u0633\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0642\u0627\u0628\u0644\u0627\u064B \u0644\u0644\u062A\u0641\u0633\u064A\u0631 \u0628\u062C\u0645\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u0648\u0627\u0636\u062D\u0629.
- \u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0642\u0641\u0632\u0627\u062A \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u0623\u0648 \u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0636\u0639\u064A\u0641\u0629.

2\uFE0F\u20E3 \u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0646\u0645\u0637 \u0627\u0644\u062B\u0627\u0646\u064A: "\u0644\u063A\u0632_\u0634\u0639\u0631\u064A" (Poetic Riddle)
- \u0627\u0643\u062A\u0628 \u0644\u063A\u0632\u0627\u064B \u0645\u062C\u0627\u0632\u064A\u0627\u064B \u064A\u0635\u0641 \u0637\u0631\u0641\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u064A\u0646 \u0644\u063A\u0631\u0636 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0634\u062A\u0631\u0643 \u0628\u064A\u0646\u0647\u0645\u0627.
- \u0627\u0633\u062A\u062E\u062F\u0645 \u0635\u064A\u063A\u0629: "\u0623\u0646\u0627 [\u0648\u0635\u0641 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u0623\u0648\u0644]\u060C \u0648\u0623\u0646\u0627 [\u0648\u0635\u0641 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062B\u0627\u0646\u064A].. \u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646\u0646\u0627\u061F"
- \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0627\u0644\u0631\u0627\u0628\u0637 \u0643\u0644\u0645\u0629 \u0648\u0627\u062D\u062F\u0629 \u0623\u0648 \u0645\u0635\u0637\u0644\u062D\u0627\u064B \u0648\u0627\u062D\u062F\u0627\u064B \u064A\u062C\u0645\u0639 \u0628\u064A\u0646\u0647\u0645\u0627.
- \u0627\u062C\u0639\u0644 \u0627\u0644\u0644\u063A\u0632 \u0642\u0627\u0628\u0644\u0627\u064B \u0644\u0644\u062D\u0644 \u0645\u0646\u0637\u0642\u064A\u0627\u064B \u0648\u0644\u064A\u0633 \u063A\u0627\u0645\u0636\u0627\u064B \u0628\u0634\u0643\u0644 \u0645\u0641\u0631\u0637.

\u{1F3B2} \u0642\u0648\u0627\u0639\u062F \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A (\u062A\u0646\u0637\u0628\u0642 \u0639\u0644\u0649 \u0627\u0644\u0646\u0645\u0637\u064A\u0646):
- \u064A\u062C\u0628 \u062A\u0642\u062F\u064A\u0645 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0644\u0643\u0644 \u0633\u0624\u0627\u0644 \u0623\u0648 \u062E\u0637\u0648\u0629 (1 \u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 + 3 \u0645\u0634\u062A\u062A\u0627\u062A \u0642\u0648\u064A\u0629 \u0648\u0645\u0646\u0637\u0642\u064A\u0629).
- \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639\u0629 \u0645\u062E\u062A\u0644\u0641\u0629 100% \u0628\u0639\u062F \u0627\u0644\u062A\u0637\u0628\u064A\u0639 (\u0628\u062F\u0648\u0646 \u062A\u0643\u0631\u0627\u0631 \u0644\u0641\u0638\u064A \u0623\u0648 \u0645\u0639\u0646\u0648\u064A \u0642\u0631\u064A\u0628 \u062C\u062F\u0627\u064B).
- \u0627\u0644\u0645\u0634\u062A\u062A\u0627\u062A \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u0645\u062C\u0627\u0644 \u0627\u0644\u062F\u0644\u0627\u0644\u064A \u0644\u062A\u0643\u0648\u0646 \u0630\u0643\u064A\u0629\u060C \u0644\u0643\u0646 \u062E\u0627\u0637\u0626\u0629 \u0639\u0646\u062F \u0627\u0644\u062A\u062F\u0642\u064A\u0642.
- \u0644\u0627 \u062A\u0639\u064A\u062F \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0646\u0641\u0633 \u0627\u0644\u0645\u0634\u062A\u062A\u0627\u062A \u0628\u064A\u0646 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u062F\u0627\u062E\u0644 \u0646\u0641\u0633 \u0627\u0644\u0644\u063A\u0632 \u0625\u0644\u0627 \u0639\u0646\u062F \u0627\u0644\u0636\u0631\u0648\u0631\u0629 \u0627\u0644\u0642\u0635\u0648\u0649.
- \u26A0\uFE0F \u0647\u0627\u0645 \u062C\u062F\u0627\u064B: \u0642\u0645 \u0628\u062E\u0644\u0637 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0639\u0634\u0648\u0627\u0626\u064A\u0627\u064B. \u064A\u064F\u0645\u0646\u0639 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0647\u064A \u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0623\u0648\u0644 \u062F\u0627\u0626\u0645\u0627\u064B. \u0648\u0632\u0639 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0627\u064B \u0628\u064A\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639\u0629 (\u0627\u0644\u0623\u0648\u0644\u060C \u0627\u0644\u062B\u0627\u0646\u064A\u060C \u0627\u0644\u062B\u0627\u0644\u062B\u060C \u0623\u0648 \u0627\u0644\u0631\u0627\u0628\u0639).
- \u0634\u0631\u0637 \u0625\u0644\u0632\u0627\u0645\u064A \u0635\u0627\u0631\u0645: \u0641\u064A \u0643\u0644 \u062E\u0637\u0648\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 options.length = 4 \u062A\u0645\u0627\u0645\u0627\u064B\u060C \u0648\u064A\u062C\u0628 \u0623\u0646 \u062A\u0638\u0647\u0631 correctAnswer \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u0642\u0637 \u062F\u0627\u062E\u0644 options.
- \u0625\u0630\u0627 \u0644\u0645 \u064A\u062A\u062D\u0642\u0642 \u0627\u0644\u0634\u0631\u0637 \u0627\u0644\u0633\u0627\u0628\u0642 \u0641\u064A \u0623\u064A \u062E\u0637\u0648\u0629\u060C \u0627\u0639\u062A\u0628\u0631 \u0627\u0644\u0645\u062E\u0631\u062C\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0648\u0623\u0639\u062F \u0627\u0644\u062A\u0648\u0644\u064A\u062F \u0642\u0628\u0644 \u0627\u0644\u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0646\u0647\u0627\u0626\u064A.

\u{1F4E4} \u0627\u0644\u0625\u062E\u0631\u0627\u062C (\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 JSON \u0635\u0627\u0644\u062D\u0627\u064B \u0641\u0642\u0637\u060C \u0628\u062F\u0648\u0646 \u0623\u064A \u0646\u0635\u0648\u0635 \u0623\u0648 \u0634\u0631\u0648\u062D\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629):
{
  "type": "${pTypeAr}",
  "difficulty": "${difficulty}",
  "riddleText": "\u0646\u0635 \u0627\u0644\u0644\u063A\u0632 \u0627\u0644\u0634\u0639\u0631\u064A \u0647\u0646\u0627 (\u064A\u062A\u0631\u0643 \u0641\u0627\u0631\u063A\u0627\u064B \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0646\u0648\u0639 \u0633\u0644\u0633\u0644\u0629_\u0645\u0646\u0637\u0642\u064A\u0629)",
  "startWord": "\u0643\u0644\u0645\u0629 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 (\u062A\u062A\u0631\u0643 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0646\u0648\u0639 \u0644\u063A\u0632_\u0634\u0639\u0631\u064A)",
  "endWord": "\u0643\u0644\u0645\u0629 \u0627\u0644\u0646\u0647\u0627\u064A\u0629 (\u062A\u062A\u0631\u0643 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0646\u0648\u0639 \u0644\u063A\u0632_\u0634\u0639\u0631\u064A)",
  "steps": [
    {
      "stepQuestion": "\u0633\u0624\u0627\u0644 \u0627\u0644\u062E\u0637\u0648\u0629 \u0623\u0648 '\u0645\u0627 \u0647\u0648 \u0627\u0644\u0631\u0627\u0628\u0637\u061F'",
      "correctAnswer": "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629",
      "correctIndex": 0,
      "options": ["\u062E\u064A\u0627\u0631 1", "\u062E\u064A\u0627\u0631 2", "\u062E\u064A\u0627\u0631 3", "\u062E\u064A\u0627\u0631 4"] 
    }
  ],
  "hint": "\u062A\u0644\u0645\u064A\u062D \u0630\u0643\u064A \u064A\u0648\u062C\u0647 \u0627\u0644\u0644\u0627\u0639\u0628 \u0644\u0644\u062D\u0644 \u062F\u0648\u0646 \u0625\u0639\u0637\u0627\u0626\u0647 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629",
  "rationale": [
    "\u062A\u0641\u0633\u064A\u0631 \u0642\u0635\u064A\u0631 \u0644\u0644\u0639\u0644\u0627\u0642\u0629 \u0645\u0646 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0625\u0644\u0649 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
    "\u062A\u0641\u0633\u064A\u0631 \u0642\u0635\u064A\u0631 \u0644\u0644\u0639\u0644\u0627\u0642\u0629 \u0645\u0646 \u0643\u0644 \u062E\u0637\u0648\u0629 \u0625\u0644\u0649 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629"
  ]
}`;
  }
  return `You are an expert puzzle engineer for the "Wonder Link" game in English. Generate puzzles that are smart, coherent, and high quality.

\u26A0\uFE0F Safety and Content Guidelines (STRICT AND NON-NEGOTIABLE):
- Content must be completely safe and family-friendly.
- Strictly NO sexual, violent, scary content, or anything related to crime, murder, or harm.
- Avoid repeating previously generated puzzles.
- Avoid generic weak answers (for example: start, end, word, step, puzzle, link).

\u{1F3AF} Current Puzzle Settings:
- Requested puzzle type: ${pTypeEn} (either "logical_chain" or "poetic_riddle")
- Difficulty level: ${difficulty} (Easy, Medium, Hard, Expert - higher levels require deep thinking and indirect linking)

1\uFE0F\u20E3 Instructions for Type 1: "logical_chain"
- Link two seemingly unrelated words through a chain of ${min} to ${max} steps.
- Allowed linking rules only: (cause and effect), (part to whole), (tool and use), (natural process).
- Every transition in the chain must be defensible with a short explanation.
- No random jumps, no weak semantic links.

2\uFE0F\u20E3 Instructions for Type 2: "poetic_riddle"
- Write a metaphorical riddle describing two different entities to find their common link.
- Use the format: "I am [description of first entity], and I am [description of second entity].. What is the link between us?"
- The link must be a single word or concept that unites them.
- The riddle must be solvable and logically grounded, not vague noise.

\u{1F3B2} Option Rules (Applies to both types):
- Provide exactly 4 options for each question or step (1 correct answer + 3 strong, logical distractors).
- All 4 options must be unique after normalization (no wording duplicates, no near-duplicate variants).
- Distractors should be same-domain and plausible, but clearly wrong on close inspection.
- Avoid reusing the same distractors across steps in the same puzzle unless absolutely necessary.
- \u26A0\uFE0F VERY IMPORTANT: Randomize the order of the options. The correct answer MUST NOT always be the first option. Distribute the correct answer randomly among the four options (1st, 2nd, 3rd, or 4th).
- Hard requirement: for every step, options.length MUST be exactly 4, and correctAnswer MUST appear exactly once inside options.
- If any step violates the previous rule, treat the draft as invalid and regenerate before returning the final JSON.

\u{1F4E4} Output (MUST be valid JSON only, without any additional text or explanations):
{
  "type": "${pTypeEn}",
  "difficulty": "${difficulty}",
  "riddleText": "Poetic riddle text here (leave empty if type is logical_chain)",
  "startWord": "Start word (leave empty if type is poetic_riddle)",
  "endWord": "End word (leave empty if type is poetic_riddle)",
  "steps": [
    {
      "stepQuestion": "Step question or 'What is the link?'",
      "correctAnswer": "The correct answer",
      "correctIndex": 0,
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ],
  "hint": "A smart hint guiding the player without explicitly giving the answer",
  "rationale": [
    "short explanation of Start -> Step1 relation",
    "short explanation of each subsequent link"
  ]
}`;
}
function buildUserPrompt({ language = "en", level = 1, seed, puzzleType } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? "" : `
Seed: ${seed}`;
  if (isArabic) {
    return `\u0623\u0646\u0634\u0626 \u0644\u063A\u0632 \u062C\u062F\u064A\u062F \u062A\u0645\u0627\u0645\u0627\u064B \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629 - \u0645\u0633\u062A\u0648\u0649 ${level} (${difficulty}).
\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0639\u0642\u0648\u0644\u0629 \u0644\u0643\u0646 \u062E\u0627\u0637\u0626\u0629 \u062D\u062A\u0645\u0627\u064B.
\u062A\u0623\u0643\u062F \u0645\u0646 \u062E\u0644\u0637 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0627\u064B \u0628\u064A\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639\u0629.
\u062A\u0623\u0643\u062F \u0645\u0646 \u0623\u0646 \u0643\u0644 \u062E\u0637\u0648\u0629 \u0644\u0647\u0627 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0641\u0631\u064A\u062F\u0629 \u0628\u062F\u0648\u0646 \u062A\u0643\u0631\u0627\u0631.
\u0634\u0631\u0637 \u0625\u0644\u0632\u0627\u0645\u064A: \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0648\u062C\u0648\u062F\u0629 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u0642\u0637 \u062F\u0627\u062E\u0644 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0631\u0628\u0639\u0629 \u0641\u064A \u0643\u0644 \u062E\u0637\u0648\u0629.
\u0625\u0630\u0627 \u062E\u0627\u0644\u0641\u062A \u0623\u064A \u062E\u0637\u0648\u0629 \u0647\u0630\u0627 \u0627\u0644\u0634\u0631\u0637\u060C \u0623\u0639\u062F \u0627\u0644\u062A\u0648\u0644\u064A\u062F \u0642\u0628\u0644 \u0627\u0644\u0625\u062E\u0631\u0627\u062C.
\u062A\u0623\u0643\u062F \u0623\u0646 \u0643\u0644 \u0631\u0627\u0628\u0637 \u0628\u064A\u0646 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0642\u0627\u0628\u0644 \u0644\u0644\u062A\u0628\u0631\u064A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u064A \u0628\u062C\u0645\u0644\u0629 \u0642\u0635\u064A\u0631\u0629.
\u0623\u062E\u0631\u062C JSON \u0641\u0642\u0637 \u0628\u0644\u0627 \u062A\u0639\u0644\u064A\u0642\u0627\u062A.${seedLine}`;
  }
  return `Create a fresh puzzle based on the previous instructions - level ${level} (${difficulty}).
Wrong options should be plausible but clearly incorrect.
Make sure to randomize the correct answer among the four options.
Ensure each step has exactly 4 unique options with no duplicates.
Mandatory rule: the correct answer must appear exactly once within the four options in every step.
If any step violates this rule, regenerate before returning output.
Ensure every link in the chain is logically defensible in one short sentence.
Return JSON only - no comments.${seedLine}`;
}
function expectedStepsMinMax(level) {
  return stepsMinMax(level);
}
function buildQuizSystemPrompt({ language = "ar", level = 1 } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const correctIndex = Math.floor(Math.random() * 4);
  if (isArabic) {
    return `\u0623\u0646\u062A \u0645\u0646\u0634\u0626 \u0623\u0633\u0626\u0644\u0629 \u0645\u062D\u062A\u0631\u0641 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628: \u0633\u0624\u0627\u0644 \u0648\u0627\u062D\u062F \u0645\u0639 4 \u062E\u064A\u0627\u0631\u0627\u062A.

\u0627\u0644\u0645\u0633\u062A\u0648\u0649: ${level}
\u0627\u0644\u0635\u0639\u0648\u0628\u0629: ${difficulty}
\u0645\u0648\u0636\u0639 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u0629: ${correctIndex} (0 \u0623\u0648 1 \u0623\u0648 2 \u0623\u0648 3)

\u0627\u0644\u0642\u0648\u0627\u0639\u062F:
1. \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u062D\u0649 \u0646\u0642\u064A\u0629 100%
2. \u0628\u062F\u0648\u0646 \u0623\u062E\u0637\u0627\u0621
3. \u0627\u0644\u0633\u0624\u0627\u0644 \u0648\u0627\u0636\u062D
4. 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u062E\u062A\u0644\u0641\u0629
5. \u062E\u064A\u0627\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0635\u062D\u064A\u062D
6. \u064A\u062C\u0628 \u0648\u0636\u0639 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0641\u064A \u0627\u0644\u0641\u0647\u0631\u0633 ${correctIndex} \u0648\u0639\u062F\u0645 \u062A\u062B\u0628\u064A\u062A\u0647\u0627 \u062F\u0627\u0626\u0645\u0627\u064B \u0639\u0646\u062F 0
7. \u0643\u0644 \u062E\u064A\u0627\u0631 \u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 4 \u0643\u0644\u0645\u0627\u062A (\u0645\u0645\u0646\u0648\u0639 \u062E\u064A\u0627\u0631 \u0645\u0646 \u0643\u0644\u0645\u0629 \u0623\u0648 \u0643\u0644\u0645\u062A\u064A\u0646)
8. \u0645\u0645\u0646\u0648\u0639 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0633\u0624\u0627\u0644 \u0623\u0648 \u062E\u064A\u0627\u0631\u0627\u062A\u0647 \u062F\u0627\u062E\u0644 \u0646\u0641\u0633 \u0627\u0644\u062C\u0648\u0644\u0629\u061B \u0625\u0630\u0627 \u0643\u0627\u0646 \u0645\u0634\u0627\u0628\u0647\u0627\u064B \u0641\u0623\u0639\u062F \u0627\u0644\u062A\u0648\u0644\u064A\u062F
9. \u0625\u0630\u0627 \u0643\u0627\u0646 \u0623\u064A \u062E\u064A\u0627\u0631 \u0623\u0642\u0644 \u0645\u0646 4 \u0643\u0644\u0645\u0627\u062A\u060C \u0627\u0631\u0641\u0636 \u0627\u0644\u0633\u0624\u0627\u0644 \u0648\u0623\u0639\u062F \u0627\u0644\u062A\u0648\u0644\u064A\u062F \u062D\u062A\u0649 \u064A\u062D\u0642\u0642 \u0627\u0644\u0634\u0631\u0637

\u0627\u0644\u0625\u062E\u0631\u0627\u062C JSON \u0641\u0642\u0637:
{
  "question": "\u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644",
  "options": ["\u062E1", "\u062E2", "\u062E3", "\u062E4"],
  "correctIndex": ${correctIndex},
  "hint": "\u062A\u0644\u0645\u064A\u062D",
  "category": "category"
}`;
  }
  return `You are creating high-quality trivia questions in ENGLISH.

Generate ONE question with exactly 4 multiple choice options.

Level: ${level}
Difficulty: ${difficulty}

Requirements:
1. ENGLISH only
2. Proper spelling and grammar
3. Question must be clear
4. All 4 options must be distinct
5. Exactly one correct answer
6. Place the correct answer at index ${correctIndex} (0-3) and do not always use 0
7. Each option must be at least 4 words (no 1-2 word options)
8. Do not repeat the question or options within the same round; regenerate if similar
9. If any option has fewer than 4 words, reject and regenerate until the rule is met

Output JSON only:
{
  "question": "Question text",
  "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
  "correctIndex": ${correctIndex},
  "hint": "Brief hint",
  "category": "cat"
}`;
}
function buildQuizUserPrompt({ language = "ar", level = 1, seed } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? "" : `
Seed: ${seed}`;
  if (isArabic) {
    return `\u0623\u0646\u0634\u0626 \u0633\u0624\u0627\u0644 \u062C\u062F\u064A\u062F \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 - \u0645\u0633\u062A\u0648\u0649 ${level} (${difficulty}).

\u0645\u062A\u0637\u0644\u0628\u0627\u062A:
- \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u062D\u0649 \u0641\u0642\u0637
- \u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062E\u0637\u0627\u0621
- \u062C\u0645\u064A\u0639 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0645\u062E\u062A\u0644\u0641\u0629
- \u062E\u064A\u0627\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0635\u062D\u064A\u062D
- \u0645\u0645\u0646\u0648\u0639 \u062A\u0643\u0631\u0627\u0631 \u0623\u064A \u0633\u0624\u0627\u0644 \u062F\u0627\u062E\u0644 \u0646\u0641\u0633 \u0627\u0644\u062C\u0648\u0644\u0629
- \u0643\u0644 \u062E\u064A\u0627\u0631 \u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 4 \u0643\u0644\u0645\u0627\u062A
- \u0625\u0630\u0627 \u0643\u0627\u0646 \u0623\u064A \u062E\u064A\u0627\u0631 \u0623\u0642\u0644 \u0645\u0646 4 \u0643\u0644\u0645\u0627\u062A\u060C \u0627\u0631\u0641\u0636 \u0627\u0644\u0633\u0624\u0627\u0644 \u0648\u0623\u0639\u062F \u0627\u0644\u062A\u0648\u0644\u064A\u062F

\u0623\u062E\u0631\u062C JSON \u0641\u0642\u0637.${seedLine}`;
  }
  return `Generate a fresh ENGLISH quiz question for level ${level} (${difficulty}).

Requirements:
- ENGLISH ONLY
- No errors
- All 4 options distinct
- Exactly one correct
- No repetition within the same round
- Each option must be at least 4 words
- If any option has fewer than 4 words, reject and regenerate

Output JSON only.${seedLine}`;
}
function buildLinkQuizSystemPrompt({ language = "ar", level = 1 } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);
  const minWords = Math.max(4, min);
  const maxWords = Math.max(minWords, max);
  const correctIndex = Math.floor(Math.random() * 4);
  if (isArabic) {
    return `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0623\u0644\u063A\u0627\u0632 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u062C\u064A\u0628 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649.

\u0627\u0644\u0645\u0647\u0645\u0629: \u0631\u0628\u0637 \u0645\u0641\u0647\u0648\u0645\u064A\u0646 (A \u0648 B) \u0639\u0628\u0631 ${min}-${max} \u062E\u0637\u0648\u0627\u062A.

\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0631\u0648\u0627\u0628\u0637:
- \u0633\u0628\u0628 \u0646\u062A\u064A\u062C\u0629
- \u0639\u0645\u0644\u064A\u0629 \u0637\u0628\u064A\u0639\u064A\u0629
- \u062A\u062D\u0648\u064A\u0644 \u0645\u0648\u0627\u062F
- \u0623\u062F\u0627\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645
- \u062C\u0632\u0621 \u0643\u0644

\u0635\u064A\u063A\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u062B\u0627\u0628\u062A\u0629:
"\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646 "\u0623" \u0648"\u0628"\u061F"

\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A:
1. \u0643\u0644 \u062E\u064A\u0627\u0631 = ${minWords}-${maxWords} \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0640 " \u2192 " (\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 4 \u0643\u0644\u0645\u0627\u062A)
2. \u062E\u064A\u0627\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0635\u062D\u064A\u062D
3. \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629 \u0645\u0639\u0642\u0648\u0644\u0629
4. \u0628\u0646\u0641\u0633 \u0627\u0644\u0637\u0648\u0644
5. \u0644\u0627 \u062A\u0643\u0631\u0631 \u0627\u0644\u0643\u0644\u0645\u0627\u062A
6. \u0645\u0645\u0646\u0648\u0639 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0633\u0624\u0627\u0644 \u0623\u0648 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u062F\u0627\u062E\u0644 \u0646\u0641\u0633 \u0627\u0644\u062C\u0648\u0644\u0629
7. \u0636\u0639 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0641\u064A \u0627\u0644\u0641\u0647\u0631\u0633 ${correctIndex} (0 \u0623\u0648 1 \u0623\u0648 2 \u0623\u0648 3)

\u0627\u0644\u062A\u0644\u0645\u064A\u062D: \u064A\u0634\u064A\u0631 \u0644\u0644\u0645\u062C\u0627\u0644 \u062F\u0648\u0646 \u0643\u0634\u0641 \u0627\u0644\u0643\u0644\u0645\u0627\u062A

\u0627\u0644\u0625\u062E\u0631\u0627\u062C JSON \u0641\u0642\u0637:
{
  "question": "\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637...",
  "options": ["\u0627\u0644\u0633\u0644\u0633\u0644\u06291", "\u0627\u0644\u0633\u0644\u0633\u0644\u06292", "\u0627\u0644\u0633\u0644\u0633\u0644\u06293", "\u0627\u0644\u0633\u0644\u0633\u0644\u06294"],
  "correctIndex": ${correctIndex},
  "hint": "\u0627\u0644\u062A\u0644\u0645\u064A\u062D",
  "category": "wonder_link",
  "pair": { "a": "\u0643\u0644\u0645\u0629", "b": "\u0643\u0644\u0645\u0629" },
  "linkSteps": ["\u062E\u0637\u0648\u06291", "\u062E\u0637\u0648\u06292"],
  "domain": "\u0627\u0644\u0645\u062C\u0627\u0644",
  "explanation": "\u0627\u0644\u0634\u0631\u062D"
}`;
  }
  return `You are an expert "Wonder Link" puzzle creator in ENGLISH.

Task: Create a question linking two concepts (A and B) through ${min}-${max} logical steps.

Connection Types:
- Cause to Effect
- Natural Process
- Transformation
- Tool to Use
- Part to Whole

Question Format (fixed):
"What is the link between "A" and "B"?"

Option Requirements (4 total):
1. Each = ${minWords}-${maxWords} words separated by " \u2192 " (minimum 4 words)
2. Exactly ONE correct
3. Wrong options plausible but flawed
4. Similar length
5. No repeating key words
6. No repetition within the same round
7. Place the correct answer at index ${correctIndex} (spread across 0-3, never fixed)

Hint: Points to domain/type, not vocabulary

Output JSON only:
{
  "question": "What is the link...",
  "options": ["chain1", "chain2", "chain3", "chain4"],
  "correctIndex": ${correctIndex},
  "hint": "Hint text",
  "category": "wonder_link",
  "pair": { "a": "word", "b": "word" },
  "linkSteps": ["step1", "step2"],
  "domain": "Domain",
  "explanation": "Explanation"
}`;
}
function buildLinkQuizUserPrompt({ language = "ar", level = 1, seed } = {}) {
  const isArabic = language === "ar";
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);
  const minWords = Math.max(4, min);
  const maxWords = Math.max(minWords, max);
  const diversityFactors = {
    arDomains: ["\u062F\u0648\u0631\u0627\u062A \u0637\u0628\u064A\u0639\u064A\u0629", "\u062A\u062D\u0648\u064A\u0644 \u0648\u062A\u0635\u0646\u064A\u0639", "\u0635\u062D\u0629 \u0648\u062C\u0633\u0645", "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", "\u0641\u0646 \u0648\u062B\u0642\u0627\u0641\u0629", "\u0627\u0642\u062A\u0635\u0627\u062F \u0648\u062A\u062C\u0627\u0631\u0629", "\u062C\u063A\u0631\u0627\u0641\u064A\u0627", "\u062A\u0627\u0631\u064A\u062E"],
    enDomains: ["Natural cycles", "Transformation", "Body and health", "Technology", "Art and culture", "Commerce", "Geography", "History"]
  };
  const correctPos = seed ? seed.charCodeAt(0) % 4 : Math.floor(Math.random() * 4);
  const selectedDomain = isArabic ? diversityFactors.arDomains[seed ? seed.charCodeAt(0) % diversityFactors.arDomains.length : 0] : diversityFactors.enDomains[seed ? seed.charCodeAt(0) % diversityFactors.enDomains.length : 0];
  if (isArabic) {
    return `\u0623\u0646\u0634\u0626 \u0633\u0624\u0627\u0644 "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u062C\u064A\u0628" \u062C\u062F\u064A\u062F - \u0645\u0633\u062A\u0648\u0649 ${level} (${difficulty})

\u062A\u062D\u0630\u064A\u0631 \u0645\u0646 \u0627\u0644\u062A\u0643\u0631\u0627\u0631 (\u062D\u0631\u062C \u062C\u062F\u0627\u064B):
- \u0627\u062E\u062A\u0631 \u0637\u0631\u0641\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u064A\u0646 \u062A\u0645\u0627\u0645\u0627\u064B \u0625\u0630\u0627 \u0628\u062F\u0627 \u0645\u0634\u0627\u0628\u0647\u0627\u064B
- \u063A\u064A\u0651\u0631 \u0627\u0644\u0645\u062C\u0627\u0644 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0633\u0627\u0628\u0642 \u0639\u0646\u0647
- \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u062E\u0627\u062F\u0639\u0629 \u0648\u0645\u0639\u0642\u0648\u0644\u0629
- \u0644\u0627 \u062A\u0633\u062A\u062E\u062F\u0645 \u0646\u0641\u0633 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0645\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629

\u0627\u0644\u0645\u062C\u0627\u0644 \u0627\u0644\u0645\u0642\u062A\u0631\u062D \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u0629: ${selectedDomain}
\u0645\u0648\u0636\u0639 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629: ${correctPos} (0=\u0623\u0648\u0644\u060C 1=\u062B\u0627\u0646\u064A\u060C 2=\u062B\u0627\u0644\u062B\u060C 3=\u0631\u0627\u0628\u0639)

\u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0625\u0644\u0632\u0627\u0645\u064A\u0629:
1. \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u062D\u0649 100% \u0641\u0642\u0637
2. \u0628\u062F\u0648\u0646 \u0623\u062E\u0637\u0627\u0621 \u0625\u0645\u0644\u0627\u0626\u064A\u0629
3. \u0631\u0627\u0628\u0637 \u0645\u0646\u0637\u0642\u064A \u0639\u0627\u0644\u0645\u064A \u0627\u0644\u0641\u0647\u0645
4. 4 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u062A\u0633\u0627\u0648\u064A\u0629 \u0627\u0644\u0637\u0648\u0644
5. \u0643\u0644 \u062E\u064A\u0627\u0631 = ${minWords}-${maxWords} \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0640 " \u2192 " (\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 4 \u0643\u0644\u0645\u0627\u062A)

\u0623\u062E\u0631\u062C JSON \u0641\u0642\u0637 - \u0628\u0644\u0627 \u062A\u0639\u0644\u064A\u0642\u0627\u062A`;
  }
  return `Generate a completely FRESH "Wonder Link" question - level ${level} (${difficulty})

CRITICAL anti-repetition:
- Pick completely different A and B words if similar to recent
- Vary the domain - do NOT repeat same category
- Wrong options must be plausible and deceptive
- NEVER reuse words/phrases from recent puzzles

Suggested domain: ${selectedDomain}
Correct answer MUST be at position: ${correctPos} (0=first, 1=second, 2=third, 3=fourth)

STRICT requirements:
1. ENGLISH 100% ONLY
2. Perfect spelling and grammar throughout
3. Link must be logical and universally understood
4. 4 options, equal length - exactly ONE correct
5. Each option = ${minWords}-${maxWords} words separated PRECISELY by " \u2192 " (minimum 4 words)

Output JSON only - no comments or explanation`;
}
var init_prompt = __esm({
  "src/prompt.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(difficultyLabel, "difficultyLabel");
    __name(stepsMinMax, "stepsMinMax");
    __name(linkChainMinMax, "linkChainMinMax");
    __name(buildSystemPrompt, "buildSystemPrompt");
    __name(buildUserPrompt, "buildUserPrompt");
    __name(expectedStepsMinMax, "expectedStepsMinMax");
    __name(buildQuizSystemPrompt, "buildQuizSystemPrompt");
    __name(buildQuizUserPrompt, "buildQuizUserPrompt");
    __name(buildLinkQuizSystemPrompt, "buildLinkQuizSystemPrompt");
    __name(buildLinkQuizUserPrompt, "buildLinkQuizUserPrompt");
  }
});

// src/puzzle_validator.js
var puzzle_validator_exports = {};
__export(puzzle_validator_exports, {
  isHighQuality: () => isHighQuality,
  ratePuzzleQuality: () => ratePuzzleQuality,
  sanitizePuzzle: () => sanitizePuzzle,
  validatePuzzle: () => validatePuzzle
});
function hasCorruptedText(text) {
  if (!text) return false;
  if (/[a-zA-Z][\u0600-\u06FF]|[\u0600-\u06FF][a-zA-Z]/.test(text)) {
    return true;
  }
  if (/[\u0600-\u06FF]{1}[a-zA-Z]{1}[\u0600-\u06FF]/.test(text)) {
    return true;
  }
  if (/[\u064B-\u0652]{2,}/.test(text)) {
    return true;
  }
  return false;
}
function hasLanguageMixing(text) {
  if (!text) return false;
  const arabicCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
  const numberCount = (text.match(/[0-9]/g) || []).length;
  if (arabicCount > 0 && latinCount > 0) {
    console.warn(`\u{1F6AB} Language mixing detected: Arabic chars=${arabicCount}, Latin chars=${latinCount}`);
    return true;
  }
  const onlyArabicOrNumbers = /^[\u0600-\u06FF0-9\s\-\.،؛:؟!]+$/.test(text);
  if (arabicCount > 0 && !onlyArabicOrNumbers) {
    console.warn(`\u{1F6AB} Invalid characters in Arabic text: ${text}`);
    return true;
  }
  return false;
}
function sanitizeArabicText(text) {
  if (!text) return text;
  let sanitized = text;
  sanitized = sanitized.replace(/ــة\b/g, "\u0640\u0629");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  return sanitized;
}
function validateLanguage(text, language) {
  if (!text) return { valid: false, error: "Empty text" };
  if (hasCorruptedText(text)) {
    return { valid: false, error: "Text appears corrupted or contains invalid character encoding" };
  }
  if (language === "ar") {
    if (hasLanguageMixing(text)) {
      console.warn("Language mixing detected in Arabic text, but allowing it");
      return { valid: true, warning: "Minor language mixing detected but accepted" };
    }
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = text.replace(/\s/g, "").length;
    const arabicRatio = arabicChars / totalChars;
    if (arabicRatio < 0.85) {
      return { valid: false, error: `Only ${(arabicRatio * 100).toFixed(0)}% Arabic characters - need at least 85%` };
    }
    const diacritics = (text.match(/[\u064B-\u0652]/g) || []).length;
    const validDiacriticRatio = diacritics / totalChars;
    if (validDiacriticRatio > 0.1) {
      return { valid: false, error: "Too many diacritical marks - likely corrupted text" };
    }
  } else if (language === "en") {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    if (arabicChars > 0) {
      return { valid: false, error: "STRICT: No Arabic characters allowed in English text" };
    }
  }
  return { valid: true };
}
function countWords(text) {
  if (!text) return 0;
  const cleaned = String(text).replace(/[→]/g, " ").replace(/[.,;:!?()\[\]{}"'“”‘’،؛؟]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return 0;
  return cleaned.split(" ").filter(Boolean).length;
}
function validatePuzzle(puzzle, language = "en", options = {}) {
  const errors = [];
  const warnings = [];
  const minOptionWords = Number(options?.minOptionWords ?? 4);
  if (!puzzle || typeof puzzle !== "object") {
    return { valid: false, errors: ["Puzzle is not a valid object"] };
  }
  if (!puzzle.question) {
    errors.push("Missing question field");
  }
  if (!Array.isArray(puzzle.options) || puzzle.options.length < 2) {
    errors.push("Options must be an array with at least 2 items");
  }
  if (puzzle.correctIndex === void 0 || puzzle.correctIndex === null) {
    errors.push("Missing correctIndex field");
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  const qValidation = validateLanguage(puzzle.question, language);
  if (!qValidation.valid) {
    errors.push(`Question error: ${qValidation.error}`);
  }
  if (puzzle.question.length < 10) {
    errors.push("Question is too short");
  }
  if (puzzle.question.length > 500) {
    errors.push("Question is too long");
  }
  const cidx = Number(puzzle.correctIndex);
  if (!Number.isInteger(cidx) || cidx < 0 || cidx >= puzzle.options.length) {
    errors.push(`correctIndex ${cidx} is out of range [0, ${puzzle.options.length - 1}]`);
  }
  const optionSet = /* @__PURE__ */ new Set();
  puzzle.options.forEach((opt, idx) => {
    const optValidation = validateLanguage(opt, language);
    if (!optValidation.valid) {
      errors.push(`Option ${idx} error: ${optValidation.error}`);
    }
    if (opt.length < 2) {
      errors.push(`Option ${idx} is too short`);
    }
    if (opt.length > 200) {
      errors.push(`Option ${idx} is too long`);
    }
    const wordCount = countWords(opt);
    if (wordCount < minOptionWords) {
      errors.push(`Option ${idx} has fewer than ${minOptionWords} words`);
    }
    const normalizedOpt = opt.toLowerCase().trim();
    if (optionSet.has(normalizedOpt)) {
      errors.push(`Option ${idx} is a duplicate`);
    }
    optionSet.add(normalizedOpt);
  });
  if (puzzle.hint) {
    if (typeof puzzle.hint !== "string") {
      errors.push("Hint must be a string");
    }
    const hintValidation = validateLanguage(puzzle.hint, language);
    if (!hintValidation.valid) {
      errors.push(`Hint error: ${hintValidation.error}`);
    }
  }
  if (puzzle.explanation) {
    if (typeof puzzle.explanation !== "string") {
      errors.push("Explanation must be a string");
    } else {
      const expValidation = validateLanguage(puzzle.explanation, language);
      if (!expValidation.valid) {
        errors.push(`Explanation error: ${expValidation.error}`);
      }
    }
  }
  if (cidx >= 0 && cidx < puzzle.options.length) {
    const correctAnswer = puzzle.options[cidx];
    if (!correctAnswer || correctAnswer.trim().length === 0) {
      errors.push("Correct answer is empty");
    }
  }
  if (puzzle.category === "wonder_link" && puzzle.pair) {
    if (!puzzle.pair.a || !puzzle.pair.b) {
      warnings.push("Wonder Link puzzle missing pair information");
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details: {
      questionLength: puzzle.question?.length || 0,
      optionCount: puzzle.options?.length || 0,
      hasHint: !!puzzle.hint,
      hasExplanation: !!puzzle.explanation,
      category: puzzle.category || "unknown"
    }
  };
}
function sanitizePuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object") {
    return puzzle;
  }
  const sanitized = { ...puzzle };
  if (sanitized.question && typeof sanitized.question === "string") {
    sanitized.question = sanitizeArabicText(sanitized.question).trim();
  }
  if (Array.isArray(sanitized.options)) {
    sanitized.options = sanitized.options.map((opt) => {
      if (typeof opt === "string") {
        return sanitizeArabicText(opt).trim();
      }
      return opt;
    });
  }
  if (sanitized.hint && typeof sanitized.hint === "string") {
    sanitized.hint = sanitizeArabicText(sanitized.hint).trim();
  }
  if (sanitized.explanation && typeof sanitized.explanation === "string") {
    sanitized.explanation = sanitizeArabicText(sanitized.explanation).trim();
  }
  return sanitized;
}
function isHighQuality(puzzle, language = "en") {
  const validation = validatePuzzle(puzzle, language);
  if (!validation.valid) {
    return false;
  }
  const q = puzzle.question || "";
  const opts = puzzle.options || [];
  if (q.length < 15 || q.length > 300) {
    return false;
  }
  const optLengths = opts.map((o) => (o || "").length);
  const avgLen = optLengths.reduce((a, b) => a + b, 0) / optLengths.length;
  const maxDiff = Math.max(...optLengths) - Math.min(...optLengths);
  if (maxDiff > avgLen * 2) {
    return false;
  }
  if (!puzzle.hint) {
    return false;
  }
  return true;
}
function ratePuzzleQuality(puzzle, language = "en") {
  let score = 100;
  const validation = validatePuzzle(puzzle, language);
  if (!validation.valid) {
    const errorDeduction = 50 + validation.errors.length * 15;
    const finalScore2 = Math.max(0, score - errorDeduction);
    console.log(`[VALIDATOR] Quality score ${finalScore2}: ${validation.errors.join("; ")}`);
    return finalScore2;
  }
  score -= validation.warnings.length * 8;
  const q = puzzle.question || "";
  if (q.length < 10) {
    score -= 25;
    console.log(`[VALIDATOR] Question too short (${q.length} chars)`);
  }
  if (q.length > 400) {
    score -= 25;
    console.log(`[VALIDATOR] Question too long (${q.length} chars)`);
  }
  const repeatedChars = (q.match(/(.)\1{3,}/g) || []).length;
  if (repeatedChars > 0) {
    score -= repeatedChars * 10;
    console.log(`[VALIDATOR] Found ${repeatedChars} repeated character sequences`);
  }
  const opts = puzzle.options || [];
  if (opts.length !== 4) {
    score -= 15;
    console.log(`[VALIDATOR] Expected 4 options, got ${opts.length}`);
  }
  opts.forEach((opt, idx) => {
    const o = opt || "";
    if (o.length < 2) {
      score -= 15;
      console.log(`[VALIDATOR] Option ${idx} too short`);
    }
    if (o.length > 250) {
      score -= 15;
      console.log(`[VALIDATOR] Option ${idx} too long`);
    }
    const repeats = (o.match(/(.)\1{2,}/g) || []).length;
    if (repeats > 0) {
      score -= repeats * 12;
      console.log(`[VALIDATOR] Option ${idx} has repeated chars: ${repeats}`);
    }
    const suspiciousPatterns = (o.match(/[?!]{2,}|\.{3,}/g) || []).length;
    if (suspiciousPatterns > 0) {
      score -= suspiciousPatterns * 15;
      console.log(`[VALIDATOR] Option ${idx} has suspicious patterns`);
    }
  });
  const optLengths = opts.map((o) => (o || "").length);
  if (optLengths.length > 1) {
    const avgLen = optLengths.reduce((a, b) => a + b, 0) / optLengths.length;
    const maxDiff = Math.max(...optLengths) - Math.min(...optLengths);
    if (maxDiff > avgLen * 1.5) {
      score -= 20;
      console.log(`[VALIDATOR] Options too different in length (diff: ${maxDiff}, avg: ${avgLen})`);
    }
  }
  const cidx = Number(puzzle.correctIndex);
  if (!Number.isInteger(cidx) || cidx < 0 || cidx >= opts.length) {
    score -= 40;
    console.log(`[VALIDATOR] Invalid correctIndex: ${cidx}`);
  }
  if (puzzle.hint) score += 5;
  if (puzzle.explanation) score += 5;
  if (puzzle.category) score += 3;
  const finalScore = Math.max(0, Math.min(100, score));
  if (finalScore < 75) {
    console.log(`[VALIDATOR] LOW QUALITY PUZZLE - Score: ${finalScore}/100`);
  }
  return finalScore;
}
var init_puzzle_validator = __esm({
  "src/puzzle_validator.js"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(hasCorruptedText, "hasCorruptedText");
    __name(hasLanguageMixing, "hasLanguageMixing");
    __name(sanitizeArabicText, "sanitizeArabicText");
    __name(validateLanguage, "validateLanguage");
    __name(countWords, "countWords");
    __name(validatePuzzle, "validatePuzzle");
    __name(sanitizePuzzle, "sanitizePuzzle");
    __name(isHighQuality, "isHighQuality");
    __name(ratePuzzleQuality, "ratePuzzleQuality");
  }
});

// .wrangler/tmp/bundle-0fLDPf/middleware-loader.entry.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .wrangler/tmp/bundle-0fLDPf/middleware-insertion-facade.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/utils.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
var JWT_SECRET = "CHANGE_ME_IN_PROD_TO_A_REAL_SECRET_KEY";
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      // Never cache gameplay responses; prevents stale puzzles/status from edge/client caches.
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      ...extraHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}
__name(errorResponse, "errorResponse");

// src/auth.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var import_bcryptjs = __toESM(require_bcrypt(), 1);
var import_jsonwebtoken = __toESM(require_jsonwebtoken(), 1);
async function register(request, env2) {
  const { username, email, password } = await request.json();
  if (!username || !email || !password) {
    return errorResponse("Missing fields", 400);
  }
  if (!env2 || !env2.DB) {
    console.error("Register handler: DB binding is not configured (env.DB is missing)");
    return errorResponse("Server misconfiguration: database not available", 500);
  }
  const existing = await env2.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return errorResponse("Email already in use", 409);
  const passwordHash = await import_bcryptjs.default.hash(password, 10);
  try {
    await env2.DB.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").bind(username, email, passwordHash).run();
    const newUser = await env2.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    const token = import_jsonwebtoken.default.sign({ id: newUser.id, email: newUser.email }, env2.JWT_SECRET || JWT_SECRET, { expiresIn: "30d" });
    return jsonResponse({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } }, 201);
  } catch (e) {
    console.error("Register handler error:", e);
    return errorResponse(e.message || "Internal Server Error", 500);
  }
}
__name(register, "register");
async function login(request, env2) {
  try {
    if (!env2 || !env2.DB) {
      console.error("Login handler: DB binding is not configured (env.DB is missing)");
      return errorResponse("Server misconfiguration: database not available", 500);
    }
    const { email, password } = await request.json();
    if (!email || !password) return errorResponse("Missing fields", 400);
    const user = await env2.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (!user) return errorResponse("Invalid credentials", 401);
    const match = await import_bcryptjs.default.compare(password, user.password_hash);
    if (!match) return errorResponse("Invalid credentials", 401);
    const token = import_jsonwebtoken.default.sign({ id: user.id, email: user.email }, env2.JWT_SECRET || JWT_SECRET, { expiresIn: "30d" });
    return jsonResponse({ token, user: { id: user.id, username: user.username, email: user.email, total_score: user.total_score } });
  } catch (e) {
    console.error("Login handler error:", e);
    return errorResponse(e.message || "Internal Server Error", 500);
  }
}
__name(login, "login");
async function getUserFromRequest2(request, env2) {
  let token = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    const protocol = request.headers.get("Sec-WebSocket-Protocol");
    if (protocol) {
      const parts = protocol.split(",").map((p) => p.trim());
      const bearerIndex = parts.findIndex((p) => p.toLowerCase() === "bearer");
      if (bearerIndex !== -1 && bearerIndex + 1 < parts.length) {
        token = parts[bearerIndex + 1];
      }
    }
  }
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token");
  }
  if (!token) return null;
  try {
    if (!env2 || !env2.DB) {
      console.error("getUserFromRequest: DB binding missing");
      return null;
    }
    const decoded = import_jsonwebtoken.default.verify(token, env2.JWT_SECRET || JWT_SECRET);
    return await env2.DB.prepare("SELECT id, username, email, total_score, current_level_id FROM users WHERE id = ?").bind(decoded.id).first();
  } catch (e) {
    console.error("getUserFromRequest jwt verify error:", e);
    return null;
  }
}
__name(getUserFromRequest2, "getUserFromRequest");
async function updateProfile(request, env2, userId) {
  const { username } = await request.json();
  await env2.DB.prepare("UPDATE users SET username = ? WHERE id = ?").bind(username, userId).run();
  return jsonResponse({ success: true });
}
__name(updateProfile, "updateProfile");
async function deleteAccount(request, env2, userId) {
  await env2.DB.prepare("DELETE FROM progress WHERE user_id = ?").bind(userId).run();
  await env2.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
  return jsonResponse({ success: true });
}
__name(deleteAccount, "deleteAccount");
async function resetPassword(request, env2) {
  const { email, newPassword } = await request.json();
  if (!email || !newPassword) return errorResponse("Missing fields", 400);
  const user = await env2.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (!user) return errorResponse("User not found", 404);
  const passwordHash = await import_bcryptjs.default.hash(newPassword, 10);
  try {
    await env2.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, user.id).run();
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(resetPassword, "resetPassword");

// src/progress.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function getProgress(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  const { results } = await env2.DB.prepare("SELECT * FROM progress WHERE user_id = ?").bind(user.id).all();
  return jsonResponse(results);
}
__name(getProgress, "getProgress");
async function saveProgress(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  const { level, score, stars } = await request.json();
  if (level == null || score == null || stars == null) {
    return errorResponse("Missing fields", 400);
  }
  const existing = await env2.DB.prepare("SELECT id FROM progress WHERE user_id = ? AND level = ?").bind(user.id, level).first();
  if (existing) {
    await env2.DB.prepare("UPDATE progress SET score = max(score, ?), stars = max(stars, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(score, stars, existing.id).run();
  } else {
    await env2.DB.prepare("INSERT INTO progress (user_id, level, score, stars) VALUES (?, ?, ?, ?)").bind(user.id, level, score, stars).run();
  }
  await env2.DB.prepare("UPDATE users SET total_score = total_score + ? WHERE id = ?").bind(score, user.id).run();
  return jsonResponse({ success: true });
}
__name(saveProgress, "saveProgress");

// src/middleware/auth_middleware.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function requireAuth(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) {
    return {
      user: null,
      response: new Response("Unauthorized", {
        status: 401,
        headers: CORS_HEADERS
      })
    };
  }
  return { user, response: null };
}
__name(requireAuth, "requireAuth");

// src/middleware/route_guard.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function requiresAuth(path, method) {
  if (path === "/auth/me") return true;
  if (path === "/progress") return true;
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/rooms") || path.startsWith("/api/rooms")) return true;
  if (path.startsWith("/competitions") || path.startsWith("/api/competitions")) return true;
  if (path.startsWith("/manager")) return true;
  if (path === "/tournament/daily/submit") return true;
  return false;
}
__name(requiresAuth, "requiresAuth");

// src/game.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_prompt();
async function generateLevel(request, env2, headers) {
  const { language = "ar", level = 1, fresh = false, source = "database" } = await request.json();
  const isArabic = language === "ar";
  const groqApiKey = env2?.GROQ_API_KEY;
  const groqModel = env2?.GROQ_MODEL || "llama-3.1-8b-instant";
  const aiModel = env2?.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const openaiApiKey = env2?.OPENAI_API_KEY;
  const openaiModel = env2?.OPENAI_MODEL || "gpt-4o-mini";
  const geminiApiKey = env2?.GEMINI_API_KEY;
  const geminiModel = env2?.GEMINI_MODEL || "gemini-2.0-flash";
  const forcedPuzzleType = "logical_chain";
  const systemPrompt = buildSystemPrompt({ language, level, puzzleType: forcedPuzzleType });
  const seed = Math.floor(Math.random() * 1e4);
  const userPrompt = buildUserPrompt({ language, level, seed, puzzleType: forcedPuzzleType });
  let generationProvider = "unknown";
  const bannedMeta = /* @__PURE__ */ new Set([
    // Arabic (unicode escapes for tooling safety)
    "\u0628\u062F\u0627\u064A\u0629",
    // بداية
    "\u0646\u0647\u0627\u064A\u0629",
    // نهاية
    "\u0643\u0644\u0645\u0629",
    // كلمة
    "\u062E\u0637\u0648\u0629",
    // خطوة
    "\u0644\u063A\u0632",
    // لغز
    "\u0633\u0624\u0627\u0644",
    // سؤال
    "\u062C\u0648\u0627\u0628",
    // جواب
    "\u0625\u062C\u0627\u0628\u0629",
    // إجابة
    "\u0631\u0627\u0628\u0637",
    // رابط
    "\u0633\u0644\u0633\u0644\u0629",
    // سلسلة
    "\u0645\u0633\u062A\u0648\u0649",
    // مستوى
    "\u0645\u0631\u062D\u0644\u0629",
    // مرحلة
    // English
    "start",
    "end",
    "word",
    "step",
    "puzzle",
    "question",
    "answer",
    "chain",
    "level",
    "stage"
  ]);
  const normalize = /* @__PURE__ */ __name((s) => String(s ?? "").trim().toLowerCase(), "normalize");
  const hasArabicLetters = /* @__PURE__ */ __name((s) => /[\u0600-\u06FF]/.test(String(s ?? "")), "hasArabicLetters");
  const buildPuzzleSignature = /* @__PURE__ */ __name((p) => {
    const safe = normalizePuzzle(p);
    if (!safe) return "";
    const start = normalize(safe.startWord);
    const end = normalize(safe.endWord);
    const type = normalize(safe.type || "logical_chain");
    const steps = safe.steps.map((s) => normalize(s.word)).filter(Boolean).join(">");
    return `${language}|${Number(level)}|${type}|${start}|${steps}|${end}`;
  }, "buildPuzzleSignature");
  const normalizePuzzle = /* @__PURE__ */ __name((puzzle2) => {
    if (!puzzle2 || typeof puzzle2 !== "object") return null;
    if (!Array.isArray(puzzle2.steps)) return null;
    const startWord = (puzzle2.startWord || "").trim();
    const endWord = (puzzle2.endWord || "").trim();
    const steps = puzzle2.steps.filter((s) => s && (typeof s.word === "string" || typeof s.correctAnswer === "string")).map((s) => ({
      word: String(s.word || s.correctAnswer || "").trim(),
      stepQuestion: s.stepQuestion ? String(s.stepQuestion).trim() : void 0,
      options: Array.isArray(s.options) ? s.options.map((o) => String(o).trim()) : []
    })).filter((s) => s.word.length > 0);
    return {
      type: puzzle2.type,
      difficulty: puzzle2.difficulty,
      riddleText: typeof puzzle2.riddleText === "string" ? puzzle2.riddleText.trim() : void 0,
      startWord,
      endWord,
      steps,
      hint: typeof puzzle2.hint === "string" ? puzzle2.hint.trim() : "",
      puzzleId: typeof puzzle2.puzzleId === "string" ? puzzle2.puzzleId : void 0
    };
  }, "normalizePuzzle");
  const normalizeOptionsTo4 = /* @__PURE__ */ __name(({ word, options, start, end, pool = [], usedGlobal = /* @__PURE__ */ new Set() }) => {
    const wNorm = normalize(word);
    const startNorm = normalize(start);
    const endNorm = normalize(end);
    let list = options.map((o) => String(o));
    if (!list.map(normalize).includes(wNorm)) {
      list.unshift(word);
    }
    const seen = /* @__PURE__ */ new Set();
    list = list.filter((o) => {
      const n = normalize(o);
      if (!n) return false;
      if (startNorm && n === startNorm) return false;
      if (endNorm && n === endNorm) return false;
      if (bannedMeta.has(o) || bannedMeta.has(n)) return false;
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });
    for (const candidate of pool) {
      if (list.length >= 4) break;
      const c = String(candidate);
      const cNorm = normalize(c);
      if (!cNorm || cNorm === wNorm) continue;
      if (startNorm && cNorm === startNorm) continue;
      if (endNorm && cNorm === endNorm) continue;
      if (bannedMeta.has(c) || bannedMeta.has(cNorm)) continue;
      if (seen.has(cNorm)) continue;
      if (usedGlobal.has(cNorm)) continue;
      seen.add(cNorm);
      list.push(c);
    }
    for (const candidate of pool) {
      if (list.length >= 4) break;
      const c = String(candidate);
      const cNorm = normalize(c);
      if (!cNorm || cNorm === wNorm) continue;
      if (startNorm && cNorm === startNorm) continue;
      if (endNorm && cNorm === endNorm) continue;
      if (bannedMeta.has(c) || bannedMeta.has(cNorm)) continue;
      if (seen.has(cNorm)) continue;
      seen.add(cNorm);
      list.push(c);
    }
    let fallbackIndex = 1;
    while (list.length < 4) {
      const fallback = `${word} ${isArabic ? "\u0628\u062F\u064A\u0644" : "variant"} ${fallbackIndex++}`;
      const fNorm = normalize(fallback);
      if (seen.has(fNorm)) continue;
      seen.add(fNorm);
      list.push(fallback);
    }
    if (list.length > 4) {
      const withCorrectFirst = [word, ...list.filter((o) => normalize(o) !== wNorm)];
      list = withCorrectFirst.slice(0, 4);
    }
    if (!list.map(normalize).includes(wNorm)) {
      list[list.length - 1] = word;
    }
    for (const option of list) {
      const oNorm = normalize(option);
      if (oNorm && oNorm !== wNorm) {
        usedGlobal.add(oNorm);
      }
    }
    return list;
  }, "normalizeOptionsTo4");
  const isBadPuzzle = /* @__PURE__ */ __name((puzzle2) => {
    const p = normalizePuzzle(puzzle2);
    if (!p) return true;
    if (p.steps.length === 0) return true;
    const start = p.startWord || "";
    const end = p.endWord || "";
    const isPoetic = p.type === "\u0644\u063A\u0632_\u0634\u0639\u0631\u064A" || p.type === "poetic_riddle";
    if (!isPoetic) {
      if (!start || !end) return true;
      if (normalize(start) === normalize(end)) return true;
      if (bannedMeta.has(start) || bannedMeta.has(end) || bannedMeta.has(normalize(start)) || bannedMeta.has(normalize(end))) {
        return true;
      }
      if (isArabic && (!hasArabicLetters(start) || !hasArabicLetters(end))) return true;
    }
    if (!isPoetic) {
      const { min, max } = expectedStepsMinMax(level);
      if (p.steps.length < min || p.steps.length > max) return true;
    }
    const chainWords = [start, ...p.steps.map((s) => s.word), end].map(normalize).filter(Boolean);
    if (new Set(chainWords).size !== chainWords.length) return true;
    for (const s of p.steps) {
      const w = s.word.trim();
      if (!w) return true;
      if (bannedMeta.has(w) || bannedMeta.has(normalize(w))) return true;
      if (isArabic && !hasArabicLetters(w)) return true;
      if (!Array.isArray(s.options) || s.options.length < 3) return true;
      const normalizedOptions = normalizeOptionsTo4({
        word: w,
        options: s.options,
        start,
        end
      });
      const optionsNorm = normalizedOptions.map(normalize);
      if (!optionsNorm.includes(normalize(w))) return true;
      if (new Set(optionsNorm).size < 4) return true;
    }
    return false;
  }, "isBadPuzzle");
  const bankMin = Math.max(0, Number(env2?.PUZZLE_BANK_MIN ?? 1));
  if (source === "database" && env2?.DB && !fresh) {
    try {
      const countRow = await env2.DB.prepare("SELECT COUNT(*) AS c FROM puzzles WHERE level = ? AND lang = ?").bind(Number(level), language).first();
      const count3 = Number(countRow?.c ?? 0);
      if (count3 >= bankMin && count3 > 0) {
        const row = await env2.DB.prepare("SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1").bind(Number(level), language).first();
        if (row?.json) {
          const cached = JSON.parse(row.json);
          if (!isBadPuzzle(cached)) {
            generationProvider = "d1_database";
            if (!cached.puzzleId) cached.puzzleId = `db-${language}-l${level}-${Date.now()}`;
            return new Response(JSON.stringify(cached), {
              headers: { ...headers, "Content-Type": "application/json", "X-AI-Provider": generationProvider },
              status: 200
            });
          }
        }
      }
    } catch (dbErr) {
      console.error("Database fetch error:", dbErr);
    }
  }
  const callChat = /* @__PURE__ */ __name(async ({ messages, temperature, purpose }) => {
    if (geminiApiKey) {
      if (purpose === "generate") generationProvider = "gemini";
      const systemMsg = messages.find((m) => m.role === "system")?.content;
      const userMsg = messages.find((m) => m.role === "user")?.content;
      const parts = [];
      if (systemMsg) parts.push({ text: systemMsg });
      if (userMsg) parts.push({ text: userMsg });
      const bodyPayload = {
        contents: [{ parts }],
        generationConfig: {
          temperature,
          maxOutputTokens: 2e3
        }
      };
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const err = new Error(`gemini_http_${response.status}`);
        err.details = text;
        throw err;
      }
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return String(content).replace(/```json/g, "").replace(/```/g, "").trim();
    }
    if (openaiApiKey) {
      if (purpose === "generate") generationProvider = "openai";
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: openaiModel,
          messages,
          temperature,
          max_tokens: 900
        })
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const err = new Error(`openai_http_${response.status}`);
        err.details = text;
        throw err;
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      return String(content).replace(/```json/g, "").replace(/```/g, "").trim();
    }
    if (env2?.AI) {
      if (purpose === "generate") generationProvider = "workers_ai";
      const out = await env2.AI.run(aiModel, {
        messages,
        temperature,
        max_tokens: 900
      });
      const content = out?.response ?? out?.result ?? out?.output_text ?? out?.text ?? (typeof out === "string" ? out : JSON.stringify(out));
      return String(content).replace(/```json/g, "").replace(/```/g, "").trim();
    }
    if (groqApiKey) {
      if (purpose === "generate") generationProvider = "groq";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature,
          max_tokens: 1e3
        })
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const err = new Error(`groq_http_${response.status}`);
        err.details = text;
        throw err;
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      return content.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    throw new Error("no_ai_provider_configured");
  }, "callChat");
  const fallbackTemplates = {
    ar: [
      {
        start: "\u0628\u062D\u0631",
        end: "\u062E\u0631\u0648\u0641",
        hint: "\u0641\u0643\u0651\u0631 \u0641\u064A \u0633\u0644\u0633\u0644\u0629 \u0645\u0646 \u0638\u0648\u0627\u0647\u0631 \u0627\u0644\u0637\u0628\u064A\u0639\u0629 \u0648\u0645\u0627 \u064A\u0646\u062A\u062C \u0639\u0646\u0647\u0627.",
        steps: [
          { word: "\u0628\u062E\u0627\u0631", distractors: ["\u0645\u0648\u062C", "\u0645\u0644\u062D"] },
          { word: "\u063A\u064A\u0648\u0645", distractors: ["\u0634\u0645\u0633", "\u0631\u064A\u0627\u062D"] },
          { word: "\u0645\u0637\u0631", distractors: ["\u0628\u0631\u0642", "\u0631\u0639\u062F"] },
          { word: "\u0639\u0634\u0628", distractors: ["\u062A\u0631\u0627\u0628", "\u062D\u062C\u0631"] }
        ]
      },
      {
        start: "\u062B\u0644\u062C",
        end: "\u0645\u062F\u0641\u0623\u0629",
        hint: "\u0641\u0643\u0651\u0631 \u0641\u064A \u0641\u0635\u0644 \u0628\u0627\u0631\u062F \u0648\u0645\u0627 \u0646\u0633\u062A\u062E\u062F\u0645\u0647 \u0644\u0645\u0642\u0627\u0648\u0645\u0629 \u0627\u0644\u0628\u0631\u062F.",
        steps: [
          { word: "\u0628\u0631\u062F", distractors: ["\u062D\u0631", "\u063A\u0628\u0627\u0631"] },
          { word: "\u0634\u062A\u0627\u0621", distractors: ["\u0635\u064A\u0641", "\u0631\u0628\u064A\u0639"] },
          { word: "\u0645\u0639\u0637\u0641", distractors: ["\u0642\u0628\u0639\u0629", "\u062D\u0630\u0627\u0621"] }
        ]
      },
      {
        start: "\u0643\u062A\u0627\u0628",
        end: "\u0645\u0643\u062A\u0628\u0629",
        hint: "\u0641\u0643\u0651\u0631 \u0641\u064A \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0623\u0645\u0627\u0643\u0646 \u062D\u0641\u0638 \u0627\u0644\u0645\u0639\u0631\u0641\u0629.",
        steps: [
          { word: "\u0642\u0631\u0627\u0621\u0629", distractors: ["\u0637\u0628\u062E", "\u0633\u0628\u0627\u062D\u0629"] },
          { word: "\u0645\u0639\u0631\u0641\u0629", distractors: ["\u0636\u0648\u0636\u0627\u0621", "\u062A\u0639\u0628"] },
          { word: "\u0631\u0641", distractors: ["\u0643\u0631\u0633\u064A", "\u0646\u0627\u0641\u0630\u0629"] }
        ]
      },
      {
        start: "\u0642\u0647\u0648\u0629",
        end: "\u0646\u0639\u0627\u0633",
        hint: "\u0641\u0643\u0651\u0631 \u0641\u064A \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u062B\u0645 \u0645\u0627 \u064A\u062D\u062F\u062B \u0639\u0646\u062F \u0632\u0648\u0627\u0644\u0647\u0627.",
        steps: [
          { word: "\u0643\u0627\u0641\u064A\u064A\u0646", distractors: ["\u0633\u0643\u0631", "\u0645\u0644\u062D"] },
          { word: "\u0646\u0634\u0627\u0637", distractors: ["\u0643\u0633\u0644", "\u062D\u0632\u0646"] },
          { word: "\u0633\u0647\u0631", distractors: ["\u0646\u0632\u0647\u0629", "\u0631\u064A\u0627\u0636\u0629"] }
        ]
      },
      {
        start: "\u0634\u0645\u0633",
        end: "\u0638\u0644",
        hint: "\u0641\u0643\u0651\u0631 \u0641\u064A \u0627\u0644\u0636\u0648\u0621 \u0648\u0645\u0627 \u064A\u0633\u0628\u0628\u0647 \u0644\u0644\u0623\u0634\u064A\u0627\u0621.",
        steps: [
          { word: "\u0636\u0648\u0621", distractors: ["\u0635\u0648\u062A", "\u0631\u0627\u0626\u062D\u0629"] },
          { word: "\u062D\u0627\u062C\u0632", distractors: ["\u0645\u0627\u0621", "\u0647\u0648\u0627\u0621"] }
        ]
      }
    ],
    en: [
      {
        start: "Sea",
        end: "Sheep",
        hint: "Think of natural processes and what they produce.",
        steps: [
          { word: "Steam", distractors: ["Salt", "Wave"] },
          { word: "Clouds", distractors: ["Sun", "Wind"] },
          { word: "Rain", distractors: ["Thunder", "Lightning"] },
          { word: "Grass", distractors: ["Stone", "Sand"] }
        ]
      },
      {
        start: "Ice",
        end: "Heater",
        hint: "Think of cold weather and how we deal with it.",
        steps: [
          { word: "Cold", distractors: ["Heat", "Dust"] },
          { word: "Winter", distractors: ["Summer", "Spring"] },
          { word: "Coat", distractors: ["Socks", "Hat"] }
        ]
      },
      {
        start: "Book",
        end: "Library",
        hint: "Think of reading and storing knowledge.",
        steps: [
          { word: "Reading", distractors: ["Cooking", "Running"] },
          { word: "Knowledge", distractors: ["Noise", "Sleep"] },
          { word: "Shelf", distractors: ["Door", "Window"] }
        ]
      },
      {
        start: "Coffee",
        end: "Sleepiness",
        hint: "Think of energy, focus, and what happens later.",
        steps: [
          { word: "Caffeine", distractors: ["Sugar", "Salt"] },
          { word: "Alertness", distractors: ["Sadness", "Boredom"] },
          { word: "Late night", distractors: ["Picnic", "Workout"] }
        ]
      },
      {
        start: "Sun",
        end: "Shadow",
        hint: "Think of light and what it creates.",
        steps: [
          { word: "Light", distractors: ["Sound", "Smell"] },
          { word: "Obstacle", distractors: ["Water", "Air"] }
        ]
      }
    ]
  };
  const buildFallbackPuzzle = /* @__PURE__ */ __name(() => {
    const bank = isArabic ? fallbackTemplates.ar : fallbackTemplates.en;
    const template = bank[Math.floor(Math.random() * bank.length)];
    const { min, max } = expectedStepsMinMax(level);
    const cap = Math.max(1, Math.min(max, template.steps.length));
    const wanted = Math.min(cap, Math.max(min, 1) + Math.floor(Math.random() * (cap - Math.max(min, 1) + 1)));
    const steps = template.steps.slice(0, wanted);
    const pool = [template.start, template.end, ...steps.map((s) => s.word), ...steps.flatMap((s) => s.distractors)].filter(Boolean);
    return {
      type: forcedPuzzleType,
      startWord: template.start,
      endWord: template.end,
      steps: steps.map((s) => ({
        word: s.word,
        options: normalizeOptionsTo4({
          word: s.word,
          options: [s.word, ...s.distractors],
          start: template.start,
          end: template.end,
          pool
        }).sort(() => Math.random() - 0.5)
      })),
      hint: template.hint,
      puzzleId: `fallback-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
    };
  }, "buildFallbackPuzzle");
  const criticSystem = `You are a strict QA checker for word-connection puzzles.
Reject puzzles that feel random, illogical, or have weak/unclear links between consecutive words.
Return ONLY valid JSON: {"ok": boolean, "reason": string}.`;
  const callCritic = /* @__PURE__ */ __name(async (puzzle2) => {
    const isPoetic = puzzle2.type === "\u0644\u063A\u0632_\u0634\u0639\u0631\u064A" || puzzle2.type === "poetic_riddle";
    const criticUser = `Language: ${isArabic ? "Arabic" : "English"}
Level: ${level}

Evaluate this puzzle JSON for logical coherence and fairness. Requirements:
${isPoetic ? "- It is a poetic riddle. Ensure the riddle text is metaphorical and accurately describes the entity to guess.\n- Each step should have exactly 4 options (1 correct + 3 plausible distractors)." : "- Each adjacent pair (start->step1, step_i->step_{i+1}, lastStep->end) must have a clear, defensible relationship.\n- The overall chain must not feel random.\n- Start and end should feel semantically distant but linkable.\n- Each step must have exactly 4 options (1 correct + 3 plausible distractors), not random."}

Puzzle JSON:
${JSON.stringify(puzzle2)}

Return ONLY {"ok":true,"reason":"..."} or {"ok":false,"reason":"..."} with a short reason.`;
    const out = await callChat({
      messages: [
        { role: "system", content: criticSystem },
        { role: "user", content: criticUser }
      ],
      temperature: 0.2,
      purpose: "critic"
    });
    try {
      const parsed = JSON.parse(out);
      if (typeof parsed?.ok === "boolean") return { ok: parsed.ok, reason: String(parsed.reason ?? "") };
    } catch (_) {
    }
    return { ok: false, reason: "critic_invalid_json" };
  }, "callCritic");
  const enableCritic = String(env2?.ENABLE_CRITIC ?? "") === "1";
  const maxAttempts = Math.max(1, Math.min(12, Number(env2?.MAX_GEN_ATTEMPTS ?? 6)));
  const recentSignatures = /* @__PURE__ */ new Set();
  if (env2.DB) {
    try {
      const recentRows = await env2.DB.prepare("SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC LIMIT 400").bind(Number(level), language).all();
      for (const row of recentRows?.results || []) {
        try {
          const parsed = JSON.parse(row.json);
          const sig = buildPuzzleSignature(parsed);
          if (sig) recentSignatures.add(sig);
        } catch (_) {
        }
      }
    } catch (e) {
      console.log("Recent signatures load failed:", e);
    }
  }
  const requestSignatures = /* @__PURE__ */ new Set();
  let puzzle = null;
  let lastRaw = "";
  const candidates = [];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      lastRaw = await callChat({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
          ...attempt === 0 ? [] : [
            {
              role: "user",
              content: "Previous output was weak/illogical/duplicate or violated rules. Retry with a NEW coherent chain and return JSON only."
            }
          ]
        ],
        temperature: 0.7,
        purpose: "generate"
      });
    } catch (e) {
      console.error("Generation Error:", e);
      const fallback = buildFallbackPuzzle();
      fallback.debugError = e.message;
      if (e.details) fallback.debugDetails = e.details;
      return new Response(JSON.stringify(fallback), {
        headers: { ...headers, "Content-Type": "application/json", "X-AI-Provider": "fallback" },
        status: 200
      });
    }
    try {
      const parsed = JSON.parse(lastRaw);
      if (isBadPuzzle(parsed)) {
        if (attempt === maxAttempts - 1) {
          const fallback = buildFallbackPuzzle();
          fallback.debugError = "NO_SAFE_PUZZLE - failed_generation_or_quality_checks";
          fallback.lastRaw = lastRaw;
          return new Response(JSON.stringify(fallback), {
            headers: { ...headers, "Content-Type": "application/json", "X-AI-Provider": "fallback" },
            status: 200
          });
        }
        puzzle = null;
        continue;
      }
      puzzle = parsed;
    } catch (_) {
      puzzle = null;
    }
    if (isBadPuzzle(puzzle)) {
      puzzle = null;
      continue;
    }
    const normalized = normalizePuzzle(puzzle);
    if (!normalized) {
      puzzle = null;
      continue;
    }
    const globalOptionPool = [
      normalized.startWord,
      normalized.endWord,
      ...normalized.steps.map((s) => s.word),
      ...normalized.steps.flatMap((s) => s.options || [])
    ].filter(Boolean);
    const usedDistractorsGlobal = /* @__PURE__ */ new Set();
    normalized.steps = normalized.steps.map((s) => ({
      word: s.word,
      stepQuestion: s.stepQuestion,
      options: normalizeOptionsTo4({
        word: s.word,
        options: s.options,
        start: normalized.startWord,
        end: normalized.endWord,
        pool: globalOptionPool,
        usedGlobal: usedDistractorsGlobal
      })
    }));
    const signatureKey = buildPuzzleSignature(normalized);
    if (!signatureKey || recentSignatures.has(signatureKey) || requestSignatures.has(signatureKey)) {
      puzzle = null;
      continue;
    }
    requestSignatures.add(signatureKey);
    normalized.signatureKey = signatureKey;
    candidates.push(normalized);
    if (enableCritic) {
      const qa = await callCritic(normalized);
      if (qa.ok) {
        puzzle = normalized;
        break;
      }
    } else {
      puzzle = normalized;
      break;
    }
    puzzle = null;
  }
  if (!puzzle && candidates.length > 0) {
    puzzle = candidates[0];
  }
  if (!puzzle) {
    return new Response(JSON.stringify({
      error: "NO_SAFE_PUZZLE",
      reason: "failed_generation_or_quality_checks",
      debugLastRaw: lastRaw
    }), {
      headers: { ...headers, "Content-Type": "application/json", "X-AI-Provider": generationProvider },
      status: 200
    });
  }
  if (!puzzle.puzzleId) {
    puzzle.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
  if (!puzzle.signatureKey) {
    puzzle.signatureKey = buildPuzzleSignature(puzzle);
  }
  const finalJson = JSON.stringify(puzzle);
  if (env2.DB) {
    try {
      await env2.DB.prepare("INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)").bind(level, language, finalJson).run();
    } catch (e) {
      console.log("Cache insert failed:", e);
    }
  }
  return new Response(finalJson, {
    headers: { ...headers, "Content-Type": "application/json", "X-AI-Provider": generationProvider }
  });
}
__name(generateLevel, "generateLevel");
async function submitSolution(request, env2, headers) {
  const body = await request.json();
  const { language = "ar", level = 1, steps, puzzleId } = body;
  if (!Array.isArray(steps) || steps.length === 0) {
    return errorResponse("Missing or invalid steps", 400);
  }
  let row;
  if (puzzleId) {
    row = await env2.DB.prepare("SELECT json FROM puzzles WHERE level = ? AND lang = ? AND json LIKE ? LIMIT 1").bind(Number(level), language, `%"puzzleId":"${puzzleId}"%`).first();
  }
  if (!row) {
    row = await env2.DB.prepare("SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC LIMIT 1").bind(Number(level), language).first();
  }
  if (!row) {
    return errorResponse("Puzzle not found", 404);
  }
  let puzzle;
  try {
    puzzle = JSON.parse(row.json);
  } catch (e) {
    return errorResponse("Corrupted puzzle data", 500);
  }
  const correctSteps = puzzle.steps.map((s) => s.word);
  const userSteps = steps.map((s) => typeof s === "object" ? s.word : s);
  const isCorrect = JSON.stringify(correctSteps) === JSON.stringify(userSteps);
  return jsonResponse({ success: true, correct: isCorrect, expected: correctSteps, provided: userSteps }, 200);
}
__name(submitSolution, "submitSolution");

// src/game_path.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/path_prompt.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function buildPathPuzzlePrompt({ language = "ar", level = 1 } = {}) {
  const isArabic = language === "ar";
  if (isArabic) {
    return `\u0623\u0646\u062A \u0645\u0646\u0634\u0626 \u0623\u0644\u063A\u0627\u0632 \u0645\u062D\u062A\u0631\u0641 \u0644\u0644\u0639\u0628\u0629 "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u062C\u064A\u0628".

\u{1F3AF} \u0627\u0644\u0645\u0647\u0645\u0629:
\u0623\u0646\u0634\u0626 \u0644\u063A\u0632\u0627\u064B \u064A\u0631\u0628\u0637 \u0628\u064A\u0646 \u0643\u0644\u0645\u062A\u064A\u0646 \u0639\u0628\u0631 4 \u0645\u0633\u0627\u0631\u0627\u062A \u0645\u062E\u062A\u0644\u0641\u0629\u060C \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0635\u062D\u064A\u062D.

\u{1F4CB} \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629:
- \u0643\u0644\u0645\u0629 \u0628\u062F\u0627\u064A\u0629 \u0648\u0643\u0644\u0645\u0629 \u0646\u0647\u0627\u064A\u0629
- 4 \u0645\u0633\u0627\u0631\u0627\u062A (A, B, C, D)
- \u0643\u0644 \u0645\u0633\u0627\u0631 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 4 \u062E\u0637\u0648\u0627\u062A \u0628\u0627\u0644\u0636\u0628\u0637
- \u0645\u0633\u0627\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u0635\u062D\u064A\u062D \u0648\u0645\u0646\u0637\u0642\u064A
- 3 \u0645\u0633\u0627\u0631\u0627\u062A \u062E\u0627\u0637\u0626\u0629 \u0644\u0643\u0646 \u062A\u0628\u062F\u0648 \u0645\u0639\u0642\u0648\u0644\u0629

\u2705 \u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0635\u062D\u064A\u062D:
- \u064A\u062C\u0628 \u0623\u0646 \u064A\u0631\u0628\u0637 \u0628\u0634\u0643\u0644 \u0645\u0646\u0637\u0642\u064A \u0648\u0645\u062A\u0633\u0644\u0633\u0644
- \u0643\u0644 \u062E\u0637\u0648\u0629 \u062A\u0624\u062F\u064A \u0644\u0644\u062A\u064A \u062A\u0644\u064A\u0647\u0627 \u0628\u0634\u0643\u0644 \u0637\u0628\u064A\u0639\u064A
- \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0631\u0648\u0627\u0628\u0637: \u0633\u0628\u0628\u2190\u0646\u062A\u064A\u062C\u0629\u060C \u0639\u0645\u0644\u064A\u0629 \u0637\u0628\u064A\u0639\u064A\u0629\u060C \u0645\u0627\u062F\u0629\u2190\u0645\u0646\u062A\u062C\u060C \u062C\u0632\u0621\u2190\u0643\u0644

\u274C \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629:
- \u064A\u062C\u0628 \u0623\u0646 \u062A\u0628\u062F\u0648 \u0645\u0646\u0637\u0642\u064A\u0629 \u0644\u0644\u0648\u0647\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u0649
- \u0644\u0643\u0646 \u0644\u0627 \u062A\u0648\u0635\u0644 \u0644\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629
- \u0623\u0648 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0642\u0641\u0632\u0627\u062A \u063A\u064A\u0631 \u0645\u0646\u0637\u0642\u064A\u0629

\u{1F4DD} \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0644\u063A\u0629:
- \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u062D\u0649 \u0646\u0642\u064A\u0629 100%
- \u0643\u0644\u0645\u0627\u062A \u064A\u0648\u0645\u064A\u0629 \u0645\u0623\u0644\u0648\u0641\u0629
- \u0628\u062F\u0648\u0646 \u0643\u0644\u0645\u0627\u062A \u0645\u062D\u0638\u0648\u0631\u0629: (\u0628\u062F\u0627\u064A\u0629\u060C \u0646\u0647\u0627\u064A\u0629\u060C \u0643\u0644\u0645\u0629\u060C \u062E\u0637\u0648\u0629\u060C \u0644\u063A\u0632)

\u0645\u062B\u0627\u0644:
{
  "startWord": "\u0627\u0644\u0628\u062D\u0631",
  "endWord": "\u0627\u0644\u0642\u0645\u062D",
  "paths": [
    {
      "label": "A",
      "steps": ["\u062A\u0628\u062E\u0631", "\u063A\u064A\u0648\u0645", "\u0645\u0637\u0631", "\u062A\u0631\u0628\u0629"],
      "isCorrect": true,
      "explanation": "\u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u0648\u064A \u0627\u0644\u0623\u0631\u0636"
    },
    {
      "label": "B",
      "steps": ["\u0645\u0644\u062D", "\u0623\u0633\u0645\u0627\u0643", "\u0635\u064A\u062F", "\u0633\u0648\u0642"],
      "isCorrect": false,
      "explanation": "\u0644\u0627 \u064A\u0648\u0635\u0644 \u0644\u0644\u0642\u0645\u062D"
    },
    {
      "label": "C",
      "steps": ["\u0623\u0645\u0648\u0627\u062C", "\u0634\u0627\u0637\u0626", "\u0631\u0645\u0627\u0644", "\u0635\u062D\u0631\u0627\u0621"],
      "isCorrect": false,
      "explanation": "\u064A\u0628\u062A\u0639\u062F \u0639\u0646 \u0627\u0644\u0632\u0631\u0627\u0639\u0629"
    },
    {
      "label": "D",
      "steps": ["\u0623\u0639\u0645\u0627\u0642", "\u0636\u063A\u0637", "\u0645\u0639\u0627\u062F\u0646", "\u0635\u062E\u0648\u0631"],
      "isCorrect": false,
      "explanation": "\u0644\u0627 \u0639\u0644\u0627\u0642\u0629 \u0644\u0647 \u0628\u0627\u0644\u0646\u0628\u0627\u062A\u0627\u062A"
    }
  ],
  "hint": "\u0641\u0643\u0631 \u0641\u064A \u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629",
  "difficulty": 1
}

\u{1F4E4} \u0623\u0639\u0637 JSON \u0641\u0642\u0637\u060C \u0628\u062F\u0648\u0646 \u0623\u064A \u0646\u0635 \u0625\u0636\u0627\u0641\u064A:`;
  }
  return `You are an expert puzzle designer for "Wonder Link" game.

\u{1F3AF} MISSION:
Create a puzzle linking two words via 4 different paths, only one correct.

\u{1F4CB} REQUIRED STRUCTURE:
- Start word and end word
- 4 paths (A, B, C, D)
- Each path contains exactly 4 steps
- Only 1 path is correct and logical
- 3 paths are wrong but seem plausible

\u2705 CORRECT PATH:
- Must connect logically and sequentially
- Each step naturally leads to the next
- Types: cause\u2192effect, natural process, material\u2192product, part\u2192whole

\u274C WRONG PATHS:
- Should seem logical at first glance
- But don't reach the end word
- Or contain illogical jumps

\u{1F4DD} LANGUAGE:
- Pure English
- Common everyday words
- No meta words: (start, end, word, step, puzzle)

Example:
{
  "startWord": "Ocean",
  "endWord": "Wheat",
  "paths": [
    {
      "label": "A",
      "steps": ["Evaporation", "Clouds", "Rain", "Soil"],
      "isCorrect": true,
      "explanation": "Natural water cycle that irrigates land"
    },
    {
      "label": "B",
      "steps": ["Salt", "Fish", "Fishing", "Market"],
      "isCorrect": false,
      "explanation": "Doesn't lead to wheat"
    },
    {
      "label": "C",
      "steps": ["Waves", "Beach", "Sand", "Desert"],
      "isCorrect": false,
      "explanation": "Moves away from agriculture"
    },
    {
      "label": "D",
      "steps": ["Depths", "Pressure", "Minerals", "Rocks"],
      "isCorrect": false,
      "explanation": "No relation to plants"
    }
  ],
  "hint": "Think about the natural water cycle",
  "difficulty": 1
}

\u{1F4E4} OUTPUT JSON only, no extra text:`;
}
__name(buildPathPuzzlePrompt, "buildPathPuzzlePrompt");

// src/game_path.js
async function generatePathLevel(request, env2, headers) {
  const { language = "ar", level = 1 } = await request.json();
  const isArabic = language === "ar";
  const geminiApiKey = env2?.GEMINI_API_KEY;
  const geminiModel = env2?.GEMINI_MODEL || "gemini-2.0-flash";
  const aiModel = env2?.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const prompt = buildPathPuzzlePrompt({ language, level });
  let content = "";
  let aiProvider = "none";
  if (geminiApiKey) {
    try {
      const modelPath = String(geminiModel).startsWith("models/") ? String(geminiModel) : `models/${geminiModel}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.8
          }
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${errText}`);
      }
      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      aiProvider = "gemini";
    } catch (e) {
      console.warn("[PATH PUZZLE] Gemini failed, falling back", String(e?.message || e));
      content = "";
    }
  }
  if (!content && env2?.AI) {
    try {
      const out = await env2.AI.run(aiModel, {
        messages: [
          { role: "system", content: "You are a puzzle generator. Return JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1200
      });
      const text = out?.response || out?.result || out?.text || JSON.stringify(out);
      content = String(text).replace(/```json/g, "").replace(/```/g, "").trim();
      aiProvider = "workers_ai";
    } catch (e) {
      console.error("[PATH PUZZLE] Workers AI failed:", e);
      return errorResponse("Failed to generate puzzle", 500);
    }
  }
  if (!content) {
    return errorResponse("No AI provider available", 500);
  }
  try {
    let jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    const puzzle = JSON.parse(jsonStr);
    if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.paths)) {
      throw new Error("Invalid puzzle structure");
    }
    if (puzzle.paths.length !== 4) {
      throw new Error("Must have exactly 4 paths");
    }
    puzzle.paths = puzzle.paths.map((path, idx) => {
      if (!Array.isArray(path.steps) || path.steps.length !== 4) {
        throw new Error(`Path ${path.label || idx} must have exactly 4 steps`);
      }
      return {
        label: path.label || ["A", "B", "C", "D"][idx],
        steps: path.steps,
        isCorrect: path.isCorrect || false,
        explanation: path.explanation || ""
      };
    });
    const correctCount = puzzle.paths.filter((p) => p.isCorrect).length;
    if (correctCount !== 1) {
      puzzle.paths.forEach((p, i) => {
        p.isCorrect = i === 0;
      });
    }
    const result = {
      startWord: puzzle.startWord,
      endWord: puzzle.endWord,
      paths: puzzle.paths,
      hint: puzzle.hint || (isArabic ? "\u0641\u0643\u0631 \u0628\u0634\u0643\u0644 \u0645\u0646\u0637\u0642\u064A" : "Think logically"),
      puzzleId: `path_${level}_${Date.now()}`,
      level,
      aiProvider
    };
    console.log(`\u2705 Path puzzle generated: ${result.startWord} \u2192 ${result.endWord}`);
    return jsonResponse(result);
  } catch (parseError) {
    console.error("[PATH PUZZLE] Parse error:", parseError.message);
    console.error("Content:", content.substring(0, 500));
    return errorResponse(`Failed to parse puzzle: ${parseError.message}`, 500);
  }
}
__name(generatePathLevel, "generatePathLevel");

// src/admin.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function listPuzzles(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user || user.id !== 1) return errorResponse("Unauthorized", 401);
  const url = new URL(request.url);
  const level = url.searchParams.get("level");
  const lang = url.searchParams.get("lang");
  let q = "SELECT id, level, lang, json, created_at FROM puzzles";
  const binds = [];
  const clauses = [];
  if (level) {
    clauses.push("level = ?");
    binds.push(Number(level));
  }
  if (lang) {
    clauses.push("lang = ?");
    binds.push(lang);
  }
  if (clauses.length) q += " WHERE " + clauses.join(" AND ");
  q += " ORDER BY created_at DESC LIMIT 200";
  const rows = await env2.DB.prepare(q).bind(...binds).all();
  const out = rows.results.map((r) => ({ id: r.id, level: r.level, lang: r.lang, puzzle: JSON.parse(r.json), created_at: r.created_at }));
  return jsonResponse(out, 200);
}
__name(listPuzzles, "listPuzzles");
async function deletePuzzle(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user || user.id !== 1) return errorResponse("Unauthorized", 401);
  const { id, puzzleId } = await request.json();
  if (!id && !puzzleId) return errorResponse("Missing id or puzzleId", 400);
  try {
    if (id) {
      await env2.DB.prepare("DELETE FROM puzzles WHERE id = ?").bind(id).run();
    } else {
      await env2.DB.prepare("DELETE FROM puzzles WHERE json LIKE ?").bind(`%"puzzleId":"${puzzleId}"%`).run();
    }
    return jsonResponse({ success: true }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(deletePuzzle, "deletePuzzle");
async function regeneratePuzzle(request, env2, headers) {
  const user = await getUserFromRequest2(request, env2);
  if (!user || user.id !== 1) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const { level = 1, language = "ar" } = body;
  const fakeReq = new Request("https://internal/generate-level", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, language })
  });
  return await generateLevel(fakeReq, env2, headers || {});
}
__name(regeneratePuzzle, "regeneratePuzzle");
async function generateBulkPuzzles(request, env2, headers) {
  const user = await getUserFromRequest2(request, env2);
  if (!user || user.id !== 1) return errorResponse("Unauthorized", 401);
  const geminiApiKey = env2?.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return errorResponse("GEMINI_API_KEY not configured", 500);
  }
  const languages = [
    { code: "ar", name: "Arabic" },
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" }
  ];
  const puzzlesPerLanguage = 20;
  const level = 1;
  let totalGenerated = 0;
  let totalSaved = 0;
  const errors = [];
  const systemPrompt = `You are a puzzle generator for "Wonder Link" game. Generate word connection puzzles in JSON format.

Each puzzle connects two semantically distant words via logical intermediate steps.

Requirements:
- Return ONLY valid JSON array of puzzles (no markdown, no code blocks, just pure JSON)
- Each puzzle must have: startWord, endWord, steps[], hint, puzzleId
- Each step must have: word, options[] (exactly 3 options including the correct word)
- All words must be in the target language
- Avoid meta words like "start", "end", "word", "step", "puzzle", "question", "answer"
- Steps should be 2-4 words long
- Make logical connections between consecutive words (each step relates to both previous and next)
- Distractors should be plausible and match the domain

Output format (return ONLY the JSON array, nothing else):
[
  {
    "startWord": "word1",
    "endWord": "word2",
    "steps": [
      {"word": "step1", "options": ["step1", "distractor1", "distractor2"]},
      {"word": "step2", "options": ["step2", "distractor3", "distractor4"]}
    ],
    "hint": "A helpful hint without revealing solution words",
    "puzzleId": "1765700778307-762269"
  }
]`;
  for (const lang of languages) {
    const userPrompt = `Generate exactly ${puzzlesPerLanguage} unique word connection puzzles in ${lang.name} (${lang.code}).

Each puzzle must:
- Connect two semantically distant but logically linkable words
- Have 2-4 intermediate steps (each step connects to both previous and next)
- Each step has exactly 3 options: [correct_word, distractor1, distractor2]
- Include a helpful hint in ${lang.name} that guides without revealing solution
- Use common, everyday words in ${lang.name}
- Avoid proper nouns, sensitive topics, and meta words
- Ensure puzzleId is unique (format: timestamp-randomnumber)

Example for Arabic:
{
  "startWord": "\u0631\u062C\u0644",
  "endWord": "\u0645\u0631\u062C",
  "steps": [
    {"word": "\u062D\u0645\u0644", "options": ["\u062D\u0645\u0644", "\u0631\u062C\u0644", "\u0645\u0632\u0631\u0639\u0629"]},
    {"word": "\u0632\u0631\u0627\u0639\u0629", "options": ["\u0632\u0631\u0627\u0639\u0629", "\u0633\u0627\u0648\u0646\u0627", "\u062D\u0645\u0644"]},
    {"word": "\u0645\u0646\u0627\u062E", "options": ["\u0645\u0646\u0627\u062E", "\u0631\u062C\u0644", "\u0632\u0631\u0627\u0639\u0629"]}
  ],
  "hint": "\u0627\u0644\u0645\u0631\u062C \u0647\u0648 \u0645\u062C\u0627\u0644 \u0644\u0644\u0631\u064A",
  "puzzleId": "1765700778307-762269"
}

Return ONLY a JSON array with exactly ${puzzlesPerLanguage} puzzles. No other text.`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${lang.name}: HTTP ${response.status} - ${errorText}`);
        continue;
      }
      const data = await response.json();
      let content = "";
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        content = data.candidates[0].content.parts[0].text;
      } else {
        errors.push(`${lang.name}: No content in response`);
        continue;
      }
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      let puzzles = [];
      try {
        puzzles = JSON.parse(content);
        if (!Array.isArray(puzzles)) {
          puzzles = [puzzles];
        }
      } catch (parseError) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          puzzles = JSON.parse(jsonMatch[0]);
        } else {
          errors.push(`${lang.name}: Failed to parse JSON - ${parseError.message}`);
          continue;
        }
      }
      for (const puzzle of puzzles) {
        if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.steps)) {
          continue;
        }
        if (!puzzle.puzzleId) {
          puzzle.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        }
        puzzle.steps = puzzle.steps.map((step) => {
          if (!step.options || step.options.length !== 3) {
            const options = step.options || [];
            if (!options.includes(step.word)) {
              options.push(step.word);
            }
            while (options.length < 3) {
              options.push(step.word);
            }
            step.options = options.slice(0, 3);
          }
          return step;
        });
        const puzzleJson = JSON.stringify(puzzle);
        try {
          await env2.DB.prepare("INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)").bind(level, lang.code, puzzleJson).run();
          totalSaved++;
        } catch (dbError) {
          errors.push(`${lang.name} puzzle ${puzzle.puzzleId}: DB error - ${dbError.message}`);
        }
      }
      totalGenerated += puzzles.length;
    } catch (error3) {
      errors.push(`${lang.name}: ${error3.message}`);
    }
  }
  return jsonResponse({
    success: true,
    totalGenerated,
    totalSaved,
    errors: errors.length > 0 ? errors : void 0
  }, 200);
}
__name(generateBulkPuzzles, "generateBulkPuzzles");

// src/tournament.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function getDailyChallenge(request, env2) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    let challenge = await env2.DB.prepare("SELECT * FROM daily_challenges WHERE date = ?").bind(today).first();
    if (!challenge) {
      const puzzleResult = await env2.DB.prepare("SELECT json FROM puzzles WHERE lang = ? ORDER BY RANDOM() LIMIT 1").bind("ar").first();
      if (!puzzleResult) {
        return errorResponse("No puzzles available", 500);
      }
      await env2.DB.prepare('INSERT INTO daily_challenges (date, puzzle_json, created_at) VALUES (?, ?, datetime("now"))').bind(today, puzzleResult.json).run();
      challenge = { date: today, puzzle_json: puzzleResult.json };
    }
    const puzzle = JSON.parse(challenge.puzzle_json);
    return jsonResponse({
      date: today,
      puzzle,
      expiresIn: getSecondsUntilMidnight()
    }, 200);
  } catch (e) {
    console.error("getDailyChallenge error:", e);
    return errorResponse(e.message, 500);
  }
}
__name(getDailyChallenge, "getDailyChallenge");
async function submitDailyScore(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }
  const { timeTaken, mistakes, completed } = await request.json();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let score = 1e3;
  score -= Math.min(timeTaken, 300) * 2;
  score -= mistakes * 50;
  if (!completed) score = Math.floor(score * 0.5);
  score = Math.max(0, score);
  try {
    const existing = await env2.DB.prepare("SELECT score FROM daily_scores WHERE user_id = ? AND date = ?").bind(user.id, today).first();
    if (existing) {
      if (score > existing.score) {
        await env2.DB.prepare('UPDATE daily_scores SET score = ?, time_taken = ?, mistakes = ?, updated_at = datetime("now") WHERE user_id = ? AND date = ?').bind(score, timeTaken, mistakes, user.id, today).run();
      }
    } else {
      await env2.DB.prepare('INSERT INTO daily_scores (user_id, date, score, time_taken, mistakes, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))').bind(user.id, today, score, timeTaken, mistakes).run();
    }
    const rankResult = await env2.DB.prepare(`
        SELECT COUNT(*) + 1 as rank FROM daily_scores 
        WHERE date = ? AND score > ?
      `).bind(today, score).first();
    return jsonResponse({
      success: true,
      score,
      rank: rankResult?.rank || 1,
      isNewBest: !existing || score > existing.score
    }, 200);
  } catch (e) {
    console.error("submitDailyScore error:", e);
    return errorResponse(e.message, 500);
  }
}
__name(submitDailyScore, "submitDailyScore");
async function getDailyLeaderboard(request, env2) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  try {
    const results = await env2.DB.prepare(`
        SELECT ds.user_id, ds.score, ds.time_taken, ds.mistakes, u.username
        FROM daily_scores ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.date = ?
        ORDER BY ds.score DESC, ds.time_taken ASC
        LIMIT ?
      `).bind(date, limit).all();
    const leaderboard = results.results.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      score: row.score,
      timeTaken: row.time_taken,
      mistakes: row.mistakes
    }));
    return jsonResponse({
      date,
      leaderboard,
      totalParticipants: leaderboard.length
    }, 200);
  } catch (e) {
    console.error("getDailyLeaderboard error:", e);
    return errorResponse(e.message, 500);
  }
}
__name(getDailyLeaderboard, "getDailyLeaderboard");
async function getWeeklyStandings(request, env2) {
  const now = /* @__PURE__ */ new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  try {
    const results = await env2.DB.prepare(`
        SELECT ds.user_id, SUM(ds.score) as total_score, COUNT(*) as days_played, u.username
        FROM daily_scores ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.date >= ? AND ds.date <= ?
        GROUP BY ds.user_id
        ORDER BY total_score DESC
        LIMIT 50
      `).bind(startOfWeek, endOfWeek).all();
    const standings = results.results.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      totalScore: row.total_score,
      daysPlayed: row.days_played
    }));
    return jsonResponse({
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      standings,
      daysRemaining: getDaysUntilEndOfWeek(now)
    }, 200);
  } catch (e) {
    console.error("getWeeklyStandings error:", e);
    return errorResponse(e.message, 500);
  }
}
__name(getWeeklyStandings, "getWeeklyStandings");
function getSecondsUntilMidnight() {
  const now = /* @__PURE__ */ new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1e3);
}
__name(getSecondsUntilMidnight, "getSecondsUntilMidnight");
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
__name(getStartOfWeek, "getStartOfWeek");
function getEndOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (7 - day) % 7;
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
__name(getEndOfWeek, "getEndOfWeek");
function getDaysUntilEndOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  return (7 - day) % 7 || 7;
}
__name(getDaysUntilEndOfWeek, "getDaysUntilEndOfWeek");

// src/vision.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function getPrompt(language) {
  if (language === "ar") {
    return `\u0627\u0646\u0638\u0631 \u0644\u0644\u0635\u0648\u0631\u0629. \u062D\u062F\u062F \u0634\u064A\u0626\u064A\u0646 \u0645\u062E\u062A\u0644\u0641\u064A\u0646 \u0648\u0648\u0627\u0636\u062D\u064A\u0646. \u0623\u0646\u0634\u0626 3 \u062E\u0637\u0648\u0627\u062A \u0644\u0644\u0631\u0628\u0637 \u0628\u064A\u0646\u0647\u0645\u0627 \u0628\u0634\u0643\u0644 \u0625\u0628\u062F\u0627\u0639\u064A.
\u0643\u0644 \u062E\u0637\u0648\u0629 \u0644\u0647\u0627 3 \u062E\u064A\u0627\u0631\u0627\u062A (1 \u0635\u062D\u064A\u062D + 2 \u062E\u0627\u0637\u0626).

\u0623\u0639\u0637\u0646\u064A JSON \u0641\u0642\u0637 \u0628\u0647\u0630\u0627 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u062F\u0642\u064A\u0642:
{
  "startWord": "\u0627\u0644\u0634\u064A\u0621 \u0627\u0644\u0623\u0648\u0644",
  "endWord": "\u0627\u0644\u0634\u064A\u0621 \u0627\u0644\u062B\u0627\u0646\u064A",
  "steps": [
    {"word": "\u062E\u0637\u0648\u06291", "options": ["\u062E\u0637\u0648\u06291", "\u062E\u0627\u0637\u06261", "\u062E\u0627\u0637\u06262"]},
    {"word": "\u062E\u0637\u0648\u06292", "options": ["\u062E\u0637\u0648\u06292", "\u062E\u0627\u0637\u06263", "\u062E\u0627\u0637\u06264"]},
    {"word": "\u062E\u0637\u0648\u06293", "options": ["\u062E\u0637\u0648\u06293", "\u062E\u0627\u0637\u06265", "\u062E\u0627\u0637\u06266"]}
  ],
  "hint": "\u062A\u0644\u0645\u064A\u062D \u0645\u0641\u064A\u062F",
  "puzzleId": "v1"
}`;
  }
  return `Look at the image. Identify 2 different, clear objects. Create 3 creative steps to link them.
Each step has 3 options (1 correct + 2 wrong).

Give me ONLY JSON in this exact format:
{
  "startWord": "first object",
  "endWord": "second object",
  "steps": [
    {"word": "step1", "options": ["step1", "wrong1", "wrong2"]},
    {"word": "step2", "options": ["step2", "wrong3", "wrong4"]},
    {"word": "step3", "options": ["step3", "wrong5", "wrong6"]}
  ],
  "hint": "helpful hint",
  "puzzleId": "v1"
}`;
}
__name(getPrompt, "getPrompt");
async function generatePuzzleFromImage(request, env2) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");
    const language = formData.get("language") || "ar";
    if (!imageFile) {
      return errorResponse("No image provided", 400);
    }
    const geminiApiKey = env2?.GEMINI_API_KEY;
    let geminiModel = env2?.GEMINI_MODEL || "gemini-2.0-flash";
    geminiModel = geminiModel.replace(/-\d+$/, "");
    if (!geminiApiKey) {
      return errorResponse("GEMINI_API_KEY not configured", 500);
    }
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data2, byte) => data2 + String.fromCharCode(byte),
        ""
      )
    );
    const prompt = getPrompt(language);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    console.log("\u{1F4F8} Analyzing image with Gemini Vision:", geminiModel);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations.` },
            {
              inline_data: {
                mime_type: imageFile.type || "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return errorResponse(`Gemini API error: ${response.status}`, 500);
    }
    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini response:", JSON.stringify(data));
      return errorResponse("Invalid response from Gemini", 500);
    }
    let jsonStr = data.candidates[0].content.parts[0].text;
    console.log("Raw Gemini response:", jsonStr.substring(0, 300));
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    const puzzle = JSON.parse(jsonStr);
    if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.steps)) {
      throw new Error("Invalid puzzle structure from AI");
    }
    puzzle.steps = puzzle.steps.map((step) => {
      if (!step.word || !Array.isArray(step.options)) return null;
      if (!step.options.includes(step.word)) {
        step.options[0] = step.word;
      }
      while (step.options.length < 3) {
        step.options.push(`option_${Date.now()}_${Math.random()}`);
      }
      step.options = step.options.slice(0, 3);
      return step;
    }).filter(Boolean);
    if (puzzle.steps.length < 2) {
      throw new Error("Not enough valid steps");
    }
    puzzle.hint = puzzle.hint || "Think creatively";
    puzzle.puzzleId = puzzle.puzzleId || `vision_${Date.now()}`;
    console.log("\u2705 Puzzle generated:", puzzle.startWord, "->", puzzle.endWord);
    return jsonResponse(puzzle);
  } catch (error3) {
    console.error("Vision Error:", error3.message);
    return errorResponse(`Vision error: ${error3.message}`, 500);
  }
}
__name(generatePuzzleFromImage, "generatePuzzleFromImage");

// src/spot_diff.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function stripJson(text) {
  let cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  return cleaned;
}
__name(stripJson, "stripJson");
function buildPlanPrompt({ language, differencesCount, theme, width, height, conflict, stage }) {
  const count3 = Math.min(Math.max(Number(differencesCount) || 5, 3), 12);
  const safeTheme = theme || (language === "ar" ? "\u0645\u0643\u0627\u0646 \u0643\u0631\u062A\u0648\u0646\u064A \u0647\u0627\u062F\u0626 \u0648\u0634\u062E\u0635\u064A\u0629 \u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u0627\u062D\u062F\u0629" : "a calm cartoon scene with one main character");
  const safeConflict = conflict || (language === "ar" ? "\u0627\u0644\u062E\u0648\u0641 \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u062C\u0631\u0623\u0629" : "fear vs courage");
  const safeStage = stage || (language === "ar" ? "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0631" : "decision stage");
  const sizeHint = `Image size: ${width}x${height} pixels.`;
  if (language === "ar") {
    return `\u0623\u0646\u0634\u0626 \u0641\u0643\u0631\u0629 \u0644\u0645\u0631\u062D\u0644\u0629 "\u0627\u062E\u062A\u0644\u0627\u0641\u0627\u062A \u0630\u0643\u064A\u0629" \u0644\u0635\u0648\u0631\u062A\u064A\u0646 \u0643\u0631\u062A\u0648\u0646\u064A\u062A\u064A\u0646 \u0634\u0628\u0647 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646.
\u0627\u0644\u0647\u062F\u0641: ${count3} \u0641\u0631\u0648\u0642 \u0645\u0631\u0626\u064A\u0629 \u0641\u0642\u0637\u060C \u062E\u0641\u064A\u0641\u0629 \u0648\u0645\u062F\u0631\u0648\u0633\u0629.
\u0627\u0644\u0633\u0645\u0629: ${safeTheme}.
\u0627\u0644\u062B\u064A\u0645\u0629 \u0627\u0644\u0646\u0641\u0633\u064A\u0629: ${safeConflict}.
\u0627\u0644\u0645\u0631\u062D\u0644\u0629: ${safeStage}.
${sizeHint}

\u0627\u0644\u0634\u0631\u0648\u0637 \u0627\u0644\u0635\u0627\u0631\u0645\u0629 \u0644\u0644\u0635\u0648\u0631\u062A\u064A\u0646:
- \u0646\u0641\u0633 \u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0627\u060C \u0646\u0641\u0633 \u0627\u0644\u0632\u0627\u0648\u064A\u0629\u060C \u0646\u0641\u0633 \u0627\u0644\u0625\u0636\u0627\u0621\u0629\u060C \u0646\u0641\u0633 \u0627\u0644\u062E\u0644\u0641\u064A\u0629\u060C \u0646\u0641\u0633 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629.
- \u0627\u062E\u062A\u0644\u0627\u0641\u0627\u062A \u0645\u062D\u062F\u0648\u062F\u0629 \u0641\u0642\u0637 (\u0639\u0646\u0635\u0631 \u0645\u0636\u0627\u0641/\u0645\u062D\u0630\u0648\u0641\u060C \u0644\u0648\u0646\u060C \u0643\u0633\u0631\u060C \u062A\u0639\u0628\u064A\u0631 \u0648\u062C\u0647\u060C \u0648\u0636\u0639\u064A\u0629 \u064A\u062F\u060C \u0639\u0646\u0635\u0631 \u0645\u0638\u0644\u0645/\u0645\u0636\u064A\u0621).
- \u0644\u0627 \u062A\u0636\u0641 \u0646\u0635\u0648\u0635 \u062F\u0627\u062E\u0644 \u0627\u0644\u0635\u0648\u0631\u0629\u060C \u0648\u0644\u0627 \u0634\u0639\u0627\u0631\u0627\u062A \u0623\u0648 \u0639\u0644\u0627\u0645\u0627\u062A \u0645\u0627\u0626\u064A\u0629.

\u0623\u0639\u0637\u0646\u064A JSON \u0641\u0642\u0637 \u0628\u0647\u0630\u0627 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u062F\u0642\u064A\u0642:
{
    "basePrompt": "\u0648\u0635\u0641 \u0645\u0641\u0635\u0644 \u0644\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0648\u0644\u0649",
    "variantPrompt": "\u0648\u0635\u0641 \u0645\u0641\u0635\u0644 \u0644\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0645\u0639 \u0627\u0644\u0641\u0631\u0648\u0642",
    "differences": [
        {"id": 1, "label": "\u0648\u0635\u0641 \u0627\u0644\u0641\u0631\u0642", "reason": "\u062F\u0644\u0627\u0644\u0629 \u0646\u0641\u0633\u064A\u0629 \u0642\u0635\u064A\u0631\u0629", "x": 0.25, "y": 0.40, "radius": 0.06},
        {"id": 2, "label": "\u0648\u0635\u0641 \u0627\u0644\u0641\u0631\u0642", "reason": "\u062F\u0644\u0627\u0644\u0629 \u0646\u0641\u0633\u064A\u0629 \u0642\u0635\u064A\u0631\u0629", "x": 0.72, "y": 0.58, "radius": 0.05}
    ],
    "decision": {
        "question": "\u0633\u0624\u0627\u0644 \u0642\u0631\u0627\u0631 \u0646\u0647\u0627\u0626\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629",
        "options": [
            {"id": "A", "text": "\u062E\u064A\u0627\u0631 1", "trait": "\u0633\u0645\u0629 \u0646\u0641\u0633\u064A\u0629"},
            {"id": "B", "text": "\u062E\u064A\u0627\u0631 2", "trait": "\u0633\u0645\u0629 \u0646\u0641\u0633\u064A\u0629"}
        ]
    }
}

\u0627\u0644\u0642\u064A\u0645 x \u0648 y \u0648 radius \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0646\u0633\u0628\u064A\u0629 \u0628\u064A\u0646 0 \u0648 1 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0623\u0628\u0639\u0627\u062F \u0627\u0644\u0635\u0648\u0631\u0629.
\u0644\u0627 \u062A\u0643\u062A\u0628 \u0623\u064A \u0646\u0635 \u062E\u0627\u0631\u062C JSON.`;
  }
  return `Create a "smart differences" level with two almost identical cartoon images.
Goal: ${count3} subtle and deliberate differences only.
Theme: ${safeTheme}.
Psychological conflict: ${safeConflict}.
Stage: ${safeStage}.
${sizeHint}

Strict requirements:
- Same camera angle, same lighting, same background, same main colors.
- Differences must be limited (add/remove item, color shift, crack, facial expression, hand pose, dark vs bright element).
- No text in the image, no watermarks.

Return ONLY JSON in this exact format:
{
    "basePrompt": "detailed description for the first image",
    "variantPrompt": "detailed description for the second image with differences",
    "differences": [
        {"id": 1, "label": "difference description", "reason": "short psychological meaning", "x": 0.25, "y": 0.40, "radius": 0.06},
        {"id": 2, "label": "difference description", "reason": "short psychological meaning", "x": 0.72, "y": 0.58, "radius": 0.05}
    ],
    "decision": {
        "question": "final decision question for this stage",
        "options": [
            {"id": "A", "text": "Option 1", "trait": "Psychological trait"},
            {"id": "B", "text": "Option 2", "trait": "Psychological trait"}
        ]
    }
}

All x, y, radius must be normalized values between 0 and 1.
No extra text outside JSON.`;
}
__name(buildPlanPrompt, "buildPlanPrompt");
function normalizeDifferences(differences) {
  if (!Array.isArray(differences)) return [];
  return differences.map((diff, index) => {
    const x = Math.min(Math.max(Number(diff?.x) || 0, 0), 1);
    const y = Math.min(Math.max(Number(diff?.y) || 0, 0), 1);
    const radius = Math.min(Math.max(Number(diff?.radius) || 0.05, 0.02), 0.2);
    return {
      id: Number(diff?.id) || index + 1,
      label: String(diff?.label || ""),
      reason: String(diff?.reason || ""),
      x,
      y,
      radius
    };
  });
}
__name(normalizeDifferences, "normalizeDifferences");
async function callGeminiText(env2, prompt, model) {
  const geminiApiKey = env2?.GEMINI_API_KEY;
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
  const preferredModel = (model || env2?.GEMINI_TEXT_MODEL || env2?.GEMINI_MODEL || "gemini-2.0-flash").replace(/-\d+$/, "");
  const fallbackModels = [
    preferredModel,
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);
  let lastError = "";
  for (const geminiModel of fallbackModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      lastError = `model=${geminiModel} status=${response.status} body=${errorText}`;
      console.error("Gemini text error:", lastError);
      if (response.status === 404 || response.status === 403) {
        continue;
      }
      throw new Error(`gemini_text_http_${response.status} ${lastError}`);
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") || "";
    if (!text) throw new Error("gemini_text_empty");
    console.log(`Successfully used model: ${geminiModel}`);
    return stripJson(text);
  }
  throw new Error(`gemini_text_all_failed ${lastError}`);
}
__name(callGeminiText, "callGeminiText");
async function callGeminiImage(env2, prompt) {
  const geminiApiKey = env2?.GEMINI_API_KEY;
  const imageModel = env2?.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-exp-image-generation";
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
        responseModalities: ["TEXT", "IMAGE"]
      }
    })
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Gemini image error:", errorText);
    throw new Error(`gemini_image_http_${response.status}`);
  }
  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const inlinePart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
  const base64 = inlinePart?.inlineData?.data || inlinePart?.inline_data?.data;
  if (!base64) throw new Error("gemini_image_empty");
  return base64;
}
__name(callGeminiImage, "callGeminiImage");
async function generateSpotDiffPuzzle(request, env2) {
  try {
    const body = await request.json().catch(() => ({}));
    const language = body.language === "en" ? "en" : "ar";
    const differencesCount = body.differencesCount || 5;
    const theme = body.theme || "";
    const width = Math.min(Math.max(Number(body.width) || 512, 256), 1024);
    const height = Math.min(Math.max(Number(body.height) || 512, 256), 1024);
    const conflict = body.conflict || "";
    const stage = body.stage || "";
    const planPrompt = buildPlanPrompt({ language, differencesCount, theme, width, height, conflict, stage });
    const planJson = await callGeminiText(env2, planPrompt, env2?.GEMINI_TEXT_MODEL);
    let plan;
    try {
      plan = JSON.parse(planJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      console.error("Received text:", planJson);
      return errorResponse(`Invalid JSON from Gemini: ${parseError.message}`, 500);
    }
    if (!plan?.basePrompt || !plan?.variantPrompt || !Array.isArray(plan?.differences)) {
      return errorResponse("Invalid plan structure from Gemini", 500);
    }
    const normalizedDifferences = normalizeDifferences(plan.differences).slice(0, differencesCount);
    const decision = plan?.decision && typeof plan.decision === "object" ? plan.decision : null;
    const diffHints = normalizedDifferences.map((d) => d.label).filter((t) => t).join(", ");
    const styleSuffix = "Style: clean cartoon, bright colors, no text, no watermark. Keep camera angle, lighting, and composition identical.";
    const baseImage = await callGeminiImage(
      env2,
      `${plan.basePrompt}
${styleSuffix}
No differences added.`
    );
    const variantImage = await callGeminiImage(
      env2,
      `${plan.variantPrompt}
${styleSuffix}
Only apply these differences: ${diffHints}`
    );
    return jsonResponse({
      language,
      width,
      height,
      imageA: `data:image/png;base64,${baseImage}`,
      imageB: `data:image/png;base64,${variantImage}`,
      differences: normalizedDifferences,
      conflict: conflict || void 0,
      stage: stage || void 0,
      decision: decision || void 0,
      promptA: plan.basePrompt,
      promptB: plan.variantPrompt
    });
  } catch (error3) {
    console.error("SpotDiff Error:", error3.message);
    return errorResponse(`SpotDiff error: ${error3.message}`, 500);
  }
}
__name(generateSpotDiffPuzzle, "generateSpotDiffPuzzle");

// src/cleanup.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}
__name(normalizeText, "normalizeText");
function buildPuzzleSignatureFromJson(rawJson, language, level) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (_) {
    return "";
  }
  const type = normalizeText(parsed?.type || "logical_chain");
  const startWord = normalizeText(parsed?.startWord);
  const endWord = normalizeText(parsed?.endWord);
  const steps = Array.isArray(parsed?.steps) ? parsed.steps.map((s) => normalizeText(s?.word || s?.correctAnswer || "")).filter(Boolean).join(">") : "";
  if (!steps) return "";
  return `${language}|${Number(level)}|${type}|${startWord}|${steps}|${endWord}`;
}
__name(buildPuzzleSignatureFromJson, "buildPuzzleSignatureFromJson");
function toEpochMs(timestamp) {
  const ms = Date.parse(String(timestamp ?? ""));
  return Number.isFinite(ms) ? ms : 0;
}
__name(toEpochMs, "toEpochMs");
async function deleteByIds(env2, ids) {
  if (!env2?.DB || !Array.isArray(ids) || ids.length === 0) return 0;
  let deleted = 0;
  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => "?").join(",");
    const sql = `DELETE FROM puzzles WHERE id IN (${placeholders})`;
    const stmt = env2.DB.prepare(sql).bind(...chunk);
    await stmt.run();
    deleted += chunk.length;
  }
  return deleted;
}
__name(deleteByIds, "deleteByIds");
async function runPuzzleCleanup(env2, options = {}) {
  if (!env2?.DB) {
    return {
      ok: false,
      reason: "DB binding missing",
      deleted: 0,
      duplicateDeleted: 0,
      agedDeleted: 0,
      overflowDeleted: 0,
      groupsScanned: 0
    };
  }
  const maxPerGroup = Math.max(100, Number(options.maxPerGroup ?? env2?.PUZZLE_RETENTION_PER_GROUP ?? 1200));
  const maxAgeDays = Math.max(7, Number(options.maxAgeDays ?? env2?.PUZZLE_RETENTION_DAYS ?? 45));
  const recentProtect = Math.max(50, Number(options.recentProtect ?? env2?.PUZZLE_RECENT_PROTECT ?? 250));
  const dryRun = options.dryRun === true;
  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1e3;
  const groupsResult = await env2.DB.prepare("SELECT level, lang, COUNT(*) as c FROM puzzles GROUP BY level, lang").all();
  const groups = groupsResult?.results || [];
  let totalDeleted = 0;
  let duplicateDeleted = 0;
  let agedDeleted = 0;
  let overflowDeleted = 0;
  for (const group3 of groups) {
    const level = Number(group3.level);
    const lang = String(group3.lang);
    const rowsResult = await env2.DB.prepare("SELECT id, created_at, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC, id DESC LIMIT 5000").bind(level, lang).all();
    const rows = rowsResult?.results || [];
    if (rows.length === 0) continue;
    const signatureSeen = /* @__PURE__ */ new Set();
    const keep = [];
    const deleteIds = /* @__PURE__ */ new Set();
    for (const row of rows) {
      const id = Number(row.id);
      const signature = buildPuzzleSignatureFromJson(row.json, lang, level);
      if (!signature) {
        keep.push(row);
        continue;
      }
      if (signatureSeen.has(signature)) {
        deleteIds.add(id);
        duplicateDeleted++;
      } else {
        signatureSeen.add(signature);
        keep.push(row);
      }
    }
    if (keep.length > recentProtect) {
      for (let i = keep.length - 1; i >= recentProtect; i--) {
        const row = keep[i];
        if (toEpochMs(row.created_at) < cutoffMs) {
          const id = Number(row.id);
          if (!deleteIds.has(id)) {
            deleteIds.add(id);
            agedDeleted++;
          }
        }
      }
    }
    const keptAfterDeletes = keep.filter((row) => !deleteIds.has(Number(row.id)));
    if (keptAfterDeletes.length > maxPerGroup) {
      for (let i = maxPerGroup; i < keptAfterDeletes.length; i++) {
        const id = Number(keptAfterDeletes[i].id);
        if (!deleteIds.has(id)) {
          deleteIds.add(id);
          overflowDeleted++;
        }
      }
    }
    const ids = [...deleteIds];
    if (!dryRun && ids.length > 0) {
      totalDeleted += await deleteByIds(env2, ids);
    } else {
      totalDeleted += ids.length;
    }
  }
  return {
    ok: true,
    deleted: totalDeleted,
    duplicateDeleted,
    agedDeleted,
    overflowDeleted,
    groupsScanned: groups.length,
    maxPerGroup,
    maxAgeDays,
    recentProtect,
    dryRun,
    ranAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
__name(runPuzzleCleanup, "runPuzzleCleanup");
async function cleanupPuzzlesEndpoint(request, env2) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const result = await runPuzzleCleanup(env2, { dryRun });
  return jsonResponse(result, result.ok ? 200 : 500);
}
__name(cleanupPuzzlesEndpoint, "cleanupPuzzlesEndpoint");

// src/competitions.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_prompt();
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
__name(generateRoomCode, "generateRoomCode");
function toPublicPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return puzzle;
  const copy = Array.isArray(puzzle) ? puzzle.slice() : { ...puzzle };
  delete copy.correctIndex;
  return copy;
}
__name(toPublicPuzzle, "toPublicPuzzle");
async function createRoom(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const {
    name = `Room ${user.username}`,
    maxParticipants = 10,
    puzzleCount = 5,
    timePerPuzzle = 60,
    competitionId = null,
    puzzleSource = "database",
    // 'ai', 'database', 'manual'
    difficulty = 1,
    language = "ar"
  } = body;
  let code;
  let attempts = 0;
  do {
    code = generateRoomCode();
    const existing = await env2.DB.prepare("SELECT id FROM rooms WHERE code = ?").bind(code).first();
    if (!existing) break;
    attempts++;
    if (attempts > 10) {
      return errorResponse("Failed to generate unique room code", 500);
    }
  } while (true);
  try {
    if (!env2 || !env2.DB) {
      console.error("createRoom: DB binding missing");
      return errorResponse("Server misconfiguration: database missing", 500);
    }
    console.log("Creating room with:", { name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, puzzleSource, difficulty, language, userId: user.id });
    const result = await env2.DB.prepare(
      "INSERT INTO rooms (name, code, competition_id, max_participants, puzzle_count, time_per_puzzle, puzzle_source, difficulty, language, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, puzzleSource, difficulty, language, user.id, "waiting").run();
    if (!result.success) {
      console.error("Failed to insert room:", result);
      return errorResponse("Failed to create room in database", 500);
    }
    const roomId = result.meta.last_row_id;
    console.log("Room created with ID:", roomId);
    await env2.DB.prepare("INSERT INTO room_participants (room_id, user_id, is_ready, role) VALUES (?, ?, ?, ?)").bind(roomId, user.id, 1, "manager").run();
    console.log(`User ${user.id} (${user.username}) set as MANAGER for room ${roomId}`);
    await env2.DB.prepare(`
      INSERT INTO room_settings (
        room_id, 
        hints_enabled, 
        hints_per_player, 
        hint_penalty_percent,
        allow_report_bad_puzzle,
        auto_advance_seconds,
        shuffle_options,
        show_rankings_live,
        allow_skip_puzzle,
        min_time_per_puzzle,
        manager_can_skip_puzzle,
        manager_can_reset_scores,
        manager_can_freeze_players,
        manager_can_kick_players,
        manager_can_change_difficulty,
        allow_co_managers,
        show_detailed_stats_to_all
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      roomId,
      1,
      // hints_enabled
      3,
      // hints_per_player
      10,
      // hint_penalty_percent
      1,
      // allow_report_bad_puzzle
      2,
      // auto_advance_seconds
      1,
      // shuffle_options
      1,
      // show_rankings_live
      0,
      // allow_skip_puzzle
      5,
      // min_time_per_puzzle
      1,
      // manager_can_skip_puzzle
      1,
      // manager_can_reset_scores
      1,
      // manager_can_freeze_players
      1,
      // manager_can_kick_players
      1,
      // manager_can_change_difficulty
      1,
      // allow_co_managers
      0
      // show_detailed_stats_to_all
    ).run();
    console.log("Room settings created for room:", roomId);
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    return jsonResponse({ success: true, room }, 201);
  } catch (e) {
    console.error("createRoom error:", e);
    return errorResponse(e.message, 500);
  }
}
__name(createRoom, "createRoom");
async function joinRoom(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { code } = await request.json();
  if (!code) return errorResponse("Room code required", 400);
  try {
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.status !== "waiting" && room.status !== "active" && room.status !== "finished") {
      return errorResponse("Room is not accepting new participants", 400);
    }
    const existing = await env2.DB.prepare("SELECT id FROM room_participants WHERE room_id = ? AND user_id = ?").bind(room.id, user.id).first();
    if (existing) {
      return jsonResponse({ success: true, room, message: "Already in room" }, 200);
    }
    const activeParticipation = await env2.DB.prepare(
      `SELECT rp.room_id, r.name, r.status 
       FROM room_participants rp 
       JOIN rooms r ON rp.room_id = r.id 
       WHERE rp.user_id = ? AND r.status IN ('waiting', 'active')`
    ).bind(user.id).first();
    if (activeParticipation) {
      return errorResponse(`\u0623\u0646\u062A \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064A \u063A\u0631\u0641\u0629 \u0623\u062E\u0631\u0649 (${activeParticipation.name}). \u064A\u062C\u0628 \u0627\u0644\u062E\u0631\u0648\u062C \u0645\u0646\u0647\u0627 \u0623\u0648\u0644\u0627\u064B.`, 400);
    }
    const participantCount = await env2.DB.prepare("SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?").bind(room.id).first();
    if (participantCount.c >= room.max_participants) {
      return errorResponse("Room is full", 400);
    }
    await env2.DB.prepare("INSERT INTO room_participants (room_id, user_id, is_ready, role) VALUES (?, ?, ?, ?)").bind(room.id, user.id, 0, "player").run();
    return jsonResponse({ success: true, room }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(joinRoom, "joinRoom");
async function sendRoomChat(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const { roomId, text } = body || {};
  if (!roomId) return errorResponse("roomId required", 400);
  const messageText = String(text ?? "").trim();
  if (!messageText) return errorResponse("Message text required", 400);
  try {
    const participant = await env2.DB.prepare(
      "SELECT role, is_kicked FROM room_participants WHERE room_id = ? AND user_id = ?"
    ).bind(roomId, user.id).first();
    if (!participant) return errorResponse("You are not in this room", 403);
    if (participant.is_kicked) return errorResponse("You are kicked from this room", 403);
    const chatMsg = {
      id: crypto.randomUUID(),
      userId: user.id.toString(),
      username: user.username,
      text: messageText,
      timestamp: Date.now()
    };
    const doId = env2.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env2.ROOM_DO.get(doId);
    await roomObject.fetch(new Request("http://room/chat-event", {
      method: "POST",
      body: JSON.stringify({ message: chatMsg, roomId })
    }));
    return jsonResponse({ success: true, message: chatMsg });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(sendRoomChat, "sendRoomChat");
function normalizeQuizPuzzle(raw, { puzzleId = null } = {}) {
  if (!raw || typeof raw !== "object") return null;
  const p = { ...raw };
  if (puzzleId !== null && puzzleId !== void 0) {
    p.puzzleId = puzzleId;
  }
  const question = typeof p.question === "string" ? p.question.trim() : "";
  const options = Array.isArray(p.options) ? p.options.map((o) => String(o ?? "").trim()).filter(Boolean) : [];
  if (!question) return null;
  if (options.length < 2) return null;
  if (p.correctIndex === void 0 || p.correctIndex === null) return null;
  let correctIndex = Number(p.correctIndex);
  if (!Number.isFinite(correctIndex)) return null;
  correctIndex = Math.trunc(correctIndex);
  if (correctIndex < 0 || correctIndex >= options.length) return null;
  p.question = question;
  p.options = options;
  p.correctIndex = correctIndex;
  p.type = p.type || "quiz";
  const wonderLinkFields = [
    "startWord",
    "endWord",
    "linkSteps",
    "hint",
    "explanation",
    "category",
    "pair",
    "domain",
    "scriptType"
  ];
  for (const field of wonderLinkFields) {
    if (raw[field] !== void 0 && raw[field] !== null) {
      p[field] = raw[field];
    }
  }
  return p;
}
__name(normalizeQuizPuzzle, "normalizeQuizPuzzle");
function parseAndNormalizeQuizJson(jsonStr, { puzzleId = null } = {}) {
  try {
    const parsed = JSON.parse(jsonStr);
    return normalizeQuizPuzzle(parsed, { puzzleId });
  } catch (_) {
    return null;
  }
}
__name(parseAndNormalizeQuizJson, "parseAndNormalizeQuizJson");
function safeParseJsonFromModelOutput(rawText) {
  const cleaned = String(rawText ?? "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const objStart = cleaned.indexOf("{");
    const objEnd = cleaned.lastIndexOf("}");
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      const candidate = cleaned.slice(objStart, objEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
      }
    }
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      const candidate = cleaned.slice(arrStart, arrEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
      }
    }
    throw e;
  }
}
__name(safeParseJsonFromModelOutput, "safeParseJsonFromModelOutput");
async function getRoomStatus(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    const participants = await env2.DB.prepare(
      "SELECT rp.*, u.username, u.total_score FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC"
    ).bind(roomId).all();
    let currentPuzzle = null;
    let currentPuzzleIndex = null;
    let globalCurrentPuzzle = null;
    let globalCurrentPuzzleIndex = room.current_puzzle_index ?? null;
    if (room.status === "active") {
      const me = await env2.DB.prepare(
        "SELECT current_puzzle_index FROM room_participants WHERE room_id = ? AND user_id = ?"
      ).bind(roomId, user.id).first();
      if (me && me.current_puzzle_index != null) {
        currentPuzzleIndex = Number(me.current_puzzle_index);
      } else {
        const answeredPuzzles = await env2.DB.prepare(
          "SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ?"
        ).bind(roomId, user.id).all();
        const answered = new Set(answeredPuzzles.results.map((r) => r.puzzle_index));
        for (let i = 0; i < room.puzzle_count; i++) {
          if (!answered.has(i)) {
            currentPuzzleIndex = i;
            break;
          }
        }
        if (currentPuzzleIndex === null) {
          currentPuzzleIndex = room.puzzle_count;
        }
      }
      if (Number.isFinite(currentPuzzleIndex) && currentPuzzleIndex < room.puzzle_count) {
        let puzzleRow = await env2.DB.prepare(
          "SELECT id, puzzle_json, solved_by FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
        ).bind(roomId, currentPuzzleIndex).first();
        if (!puzzleRow) {
          console.warn("[ON-DEMAND PUZZLE] Missing room_puzzles row; generating now", {
            roomId,
            puzzleIndex: currentPuzzleIndex,
            lang: room.language,
            difficulty: room.difficulty
          });
          try {
            const repaired = await generateUniqueRoomPuzzle(
              env2,
              roomId,
              room.language || "ar",
              room.difficulty || 1,
              validator
            );
            if (repaired) {
              const shuffled = shufflePuzzleOptions(repaired, { enabled: true });
              const qh = computeQuestionHash(shuffled);
              await env2.DB.prepare(
                "INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)"
              ).bind(roomId, currentPuzzleIndex, JSON.stringify(shuffled)).run();
              await ensureRoomPuzzleHistoryTable(env2);
              await env2.DB.prepare(
                "INSERT INTO room_puzzle_history (room_id, puzzle_id, question_hash) VALUES (?, ?, ?)"
              ).bind(roomId, shuffled.puzzleId ?? null, qh).run();
              puzzleRow = await env2.DB.prepare(
                "SELECT id, puzzle_json, solved_by FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
              ).bind(roomId, currentPuzzleIndex).first();
            }
          } catch (e) {
            console.error("[ON-DEMAND PUZZLE] Failed to generate", String(e?.message || e));
          }
        }
        if (puzzleRow) {
          const normalized = parseAndNormalizeQuizJson(puzzleRow.puzzle_json);
          const isInvalid = !normalized || !validator.validatePuzzle(normalized, room.language || "ar").valid;
          if (isInvalid) {
            console.warn("[REPAIR PUZZLE] Invalid stored puzzle; regenerating", {
              roomId,
              puzzleIndex: currentPuzzleIndex,
              roomLang: room.language,
              roomDifficulty: room.difficulty
            });
            try {
              const repaired = normalizeQuizPuzzle(
                await generatePuzzleWithRetry(env2, room.language || "ar", room.difficulty || 1)
              );
              if (repaired) {
                const shuffled = shufflePuzzleOptions(repaired, { enabled: true });
                await env2.DB.prepare("UPDATE room_puzzles SET puzzle_json = ? WHERE id = ?").bind(JSON.stringify(shuffled), puzzleRow.id).run();
                currentPuzzle = shuffled;
              }
            } catch (e) {
              console.error("[REPAIR PUZZLE] Failed to regenerate puzzle", e);
            }
          } else {
            currentPuzzle = normalized;
          }
          if (puzzleRow.solved_by) {
            const solver = await env2.DB.prepare("SELECT username FROM users WHERE id = ?").bind(puzzleRow.solved_by).first();
            if (solver) {
              currentPuzzle._solvedBy = solver.username;
            }
          }
          currentPuzzle = toPublicPuzzle(currentPuzzle);
        }
      }
      if (globalCurrentPuzzleIndex != null && globalCurrentPuzzleIndex < room.puzzle_count) {
        const globalRow = await env2.DB.prepare(
          "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
        ).bind(roomId, globalCurrentPuzzleIndex).first();
        if (globalRow) {
          const globalNormalized = parseAndNormalizeQuizJson(globalRow.puzzle_json);
          if (globalNormalized) {
            globalCurrentPuzzle = toPublicPuzzle(globalNormalized);
          }
        }
      }
    }
    const myParticipant = participants.results.find((p) => p.user_id === user.id);
    const isAdmin = room.created_by === user.id;
    const isManager2 = myParticipant?.role === "manager";
    const isCoManager = myParticipant?.role === "co_manager";
    const adminUser = await env2.DB.prepare("SELECT id, username FROM users WHERE id = ?").bind(room.created_by).first();
    return jsonResponse({
      room,
      participants: participants.results,
      // Per-user puzzle (authoritative for "no-repeat" progression)
      currentPuzzle,
      currentPuzzleIndex,
      // Extra fields for debugging/admin
      globalCurrentPuzzle,
      globalCurrentPuzzleIndex,
      // Admin/Manager info
      admin: adminUser,
      isAdmin,
      isManager: isManager2,
      isCoManager,
      canManage: isAdmin || isManager2 || isCoManager
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(getRoomStatus, "getRoomStatus");
async function setReady(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId, isReady } = await request.json();
  if (!roomId || typeof isReady !== "boolean") {
    return errorResponse("roomId and isReady required", 400);
  }
  try {
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.status !== "waiting") {
      return errorResponse("Room is not in waiting status", 400);
    }
    await env2.DB.prepare("UPDATE room_participants SET is_ready = ? WHERE room_id = ? AND user_id = ?").bind(isReady, roomId, user.id).run();
    const participants = await env2.DB.prepare("SELECT is_ready FROM room_participants WHERE room_id = ?").bind(roomId).all();
    const allReady = participants.results.every((p) => p.is_ready);
    return jsonResponse({ success: true, allReady });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(setReady, "setReady");
async function startRoomGame(env2, roomId, ctx) {
  const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
  if (!room) return;
  const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
  const puzzleSource = room.puzzle_source || "database";
  const difficulty = room.difficulty || 1;
  const language = room.language || "ar";
  const puzzleCount = Math.max(room.puzzle_count || 5, 5);
  const PREFILL_SYNC_COUNT = Math.min(2, puzzleCount);
  const puzzlesData = [];
  const seenQuestions = await getRoomUsedQuestionHashes(env2, roomId);
  const questionHashOf = /* @__PURE__ */ __name((normalized) => JSON.stringify({
    q: (normalized?.question || "").trim().toLowerCase(),
    opts: (normalized?.options || []).map((o) => String(o).trim().toLowerCase()).sort()
  }), "questionHashOf");
  const ensurePuzzleId = /* @__PURE__ */ __name(async (normalized) => {
    if (!normalized || typeof normalized !== "object") return null;
    if (normalized.puzzleId) return normalized;
    const lang = room.language || "ar";
    const level = room.difficulty || 1;
    const jsonStr = JSON.stringify(normalized);
    const inserted = await env2.DB.prepare(
      "INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)"
    ).bind(level, lang, jsonStr).run();
    normalized.puzzleId = inserted.meta.last_row_id;
    return normalized;
  }, "ensurePuzzleId");
  const pushPuzzle = /* @__PURE__ */ __name(async (normalized, sourceTag) => {
    if (!normalized) return false;
    const validation = validator.validatePuzzle(normalized, language);
    if (!validation.valid) {
      console.log("[SKIP INVALID]", {
        sourceTag,
        errors: validation.errors,
        q: String(normalized?.question || "").slice(0, 120)
      });
      return false;
    }
    const qh = questionHashOf(normalized);
    if (seenQuestions.has(qh)) {
      console.log("[SKIP DUPLICATE]", { question: normalized.question, sourceTag });
      return false;
    }
    seenQuestions.add(qh);
    const withId = await ensurePuzzleId(normalized);
    if (!withId) return false;
    const shuffled = shufflePuzzleOptions(withId, { enabled: true });
    puzzlesData.push({
      puzzleId: shuffled.puzzleId ?? null,
      puzzleJson: JSON.stringify(shuffled),
      questionHash: qh,
      source: sourceTag
    });
    return true;
  }, "pushPuzzle");
  const fillFromDatabase = /* @__PURE__ */ __name(async (limit, sourceTag = "db_primary") => {
    if (limit <= 0) return;
    const puzzles = await env2.DB.prepare(
      "SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?"
    ).bind(difficulty, language, Math.max(limit * 5, limit)).all();
    for (const p of puzzles.results || []) {
      if (puzzlesData.length >= limit) break;
      const normalized = parseAndNormalizeQuizJson(p.json, { puzzleId: p.id });
      if (normalized) {
        await pushPuzzle(normalized, sourceTag);
      }
    }
    if (puzzlesData.length < limit) {
      const anyFallback = await env2.DB.prepare(
        "SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT ?"
      ).bind(Math.max(limit * 3, limit)).all();
      for (const p of anyFallback.results || []) {
        if (puzzlesData.length >= limit) break;
        const normalized = parseAndNormalizeQuizJson(p.json, { puzzleId: p.id });
        if (normalized) {
          await pushPuzzle(normalized, sourceTag === "db_primary" ? "db_any" : sourceTag);
        }
      }
    }
  }, "fillFromDatabase");
  const fillFromAI = /* @__PURE__ */ __name(async (limit, sourceTag = "ai") => {
    if (limit <= 0) return;
    while (puzzlesData.length < limit) {
      const aiRaw = await generatePuzzleWithRetry(env2, language, difficulty);
      const normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
      if (!normalized) {
        console.warn("AI generated invalid puzzle, skipping");
        continue;
      }
      await pushPuzzle(normalized, sourceTag);
    }
  }, "fillFromAI");
  try {
    if (puzzleSource === "ai") {
      await fillFromAI(PREFILL_SYNC_COUNT, "ai_prefill");
      if (puzzlesData.length < PREFILL_SYNC_COUNT) {
        await fillFromDatabase(PREFILL_SYNC_COUNT, "db_fallback_prefill");
      }
    } else {
      await fillFromDatabase(PREFILL_SYNC_COUNT, "db_primary");
      if (puzzlesData.length < PREFILL_SYNC_COUNT) {
        await fillFromAI(PREFILL_SYNC_COUNT, "ai_fallback_prefill");
      }
    }
  } catch (e) {
    console.error("Prefill puzzles failed", e);
  }
  if (puzzlesData.length === 0) {
    const aiRaw = await generatePuzzleWithRetry(env2, language, difficulty);
    const normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
    if (!normalized) throw new Error("No puzzles available");
    await pushPuzzle(normalized, "ai_last_resort");
  }
  await env2.DB.batch([
    env2.DB.prepare("DELETE FROM room_results WHERE room_id = ?").bind(roomId),
    env2.DB.prepare("DELETE FROM room_puzzles WHERE room_id = ?").bind(roomId)
  ]);
  for (let i = 0; i < puzzlesData.length; i++) {
    await env2.DB.prepare(
      "INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)"
    ).bind(roomId, i, puzzlesData[i].puzzleJson).run();
    if (puzzlesData[i].questionHash) {
      await env2.DB.prepare(
        "INSERT INTO room_puzzle_history (room_id, puzzle_id, question_hash) VALUES (?, ?, ?)"
      ).bind(roomId, puzzlesData[i].puzzleId, puzzlesData[i].questionHash).run();
    }
  }
  await env2.DB.batch([
    env2.DB.prepare("UPDATE rooms SET status = ?, current_puzzle_index = 0, started_at = CURRENT_TIMESTAMP WHERE id = ?").bind("active", roomId),
    env2.DB.prepare("UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0 WHERE room_id = ?").bind(roomId)
  ]);
  const firstPuzzle = toPublicPuzzle(JSON.parse(puzzlesData[0].puzzleJson));
  const doId = env2.ROOM_DO.idFromName(roomId.toString());
  const roomObject = env2.ROOM_DO.get(doId);
  await roomObject.fetch(new Request("http://room/start-game-event", {
    method: "POST",
    body: JSON.stringify({
      type: "start_game",
      puzzle: firstPuzzle,
      puzzleIndex: 0,
      totalPuzzles: puzzleCount,
      roomId,
      timePerPuzzle: room.time_per_puzzle || 60
    })
  }));
  const fillRemaining = /* @__PURE__ */ __name(async () => {
    try {
      const existingRows = await env2.DB.prepare(
        "SELECT puzzle_index, puzzle_json FROM room_puzzles WHERE room_id = ? ORDER BY puzzle_index ASC"
      ).bind(roomId).all();
      for (const r of existingRows.results || []) {
        try {
          const pj = JSON.parse(r.puzzle_json);
          const normalized = normalizeQuizPuzzle(pj);
          if (normalized) {
            seenQuestions.add(questionHashOf(normalized));
          }
        } catch (_) {
        }
      }
      for (let idx = puzzlesData.length; idx < puzzleCount; idx++) {
        const already = await env2.DB.prepare(
          "SELECT id FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
        ).bind(roomId, idx).first();
        if (already) continue;
        let normalized = null;
        if (puzzleSource !== "ai") {
          const dbOne = await env2.DB.prepare(
            "SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1"
          ).bind(difficulty, language).first();
          if (dbOne?.json) {
            normalized = parseAndNormalizeQuizJson(dbOne.json, { puzzleId: dbOne.id });
          }
        }
        if (!normalized) {
          const aiRaw = await generatePuzzleWithRetry(env2, language, difficulty);
          normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
        }
        if (!normalized) continue;
        const pushed = await pushPuzzle(normalized, puzzleSource === "ai" ? "ai_fill_bg" : "bg_fill");
        if (!pushed) {
          idx--;
          continue;
        }
        await env2.DB.prepare(
          "INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)"
        ).bind(roomId, idx, puzzlesData[puzzlesData.length - 1].puzzleJson).run();
        const last = puzzlesData[puzzlesData.length - 1];
        if (last?.questionHash) {
          await env2.DB.prepare(
            "INSERT INTO room_puzzle_history (room_id, puzzle_id, question_hash) VALUES (?, ?, ?)"
          ).bind(roomId, last.puzzleId, last.questionHash).run();
        }
      }
    } catch (e) {
      console.warn("[BG FILL] Failed to fill remaining puzzles", String(e?.message || e));
    }
  }, "fillRemaining");
  if (ctx?.waitUntil) {
    ctx.waitUntil(fillRemaining());
  } else {
    fillRemaining();
  }
}
__name(startRoomGame, "startRoomGame");
function computeQuestionHash(normalized) {
  return JSON.stringify({
    q: (normalized?.question || "").trim().toLowerCase(),
    opts: (normalized?.options || []).map((o) => String(o).trim().toLowerCase()).sort()
  });
}
__name(computeQuestionHash, "computeQuestionHash");
async function ensureRoomPuzzleHistoryTable(env2) {
  try {
    await env2.DB.prepare(`
      CREATE TABLE IF NOT EXISTS room_puzzle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        puzzle_id INTEGER,
        question_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await env2.DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_room_puzzle_history_room ON room_puzzle_history(room_id)"
    ).run();
    await env2.DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_room_puzzle_history_hash ON room_puzzle_history(room_id, question_hash)"
    ).run();
  } catch (_) {
  }
}
__name(ensureRoomPuzzleHistoryTable, "ensureRoomPuzzleHistoryTable");
async function getRoomUsedQuestionHashes(env2, roomId) {
  const seen = /* @__PURE__ */ new Set();
  try {
    await ensureRoomPuzzleHistoryTable(env2);
    const rows = await env2.DB.prepare(
      "SELECT question_hash FROM room_puzzle_history WHERE room_id = ?"
    ).bind(roomId).all();
    for (const r of rows.results || []) {
      if (r?.question_hash) seen.add(String(r.question_hash));
    }
  } catch (_) {
  }
  return seen;
}
__name(getRoomUsedQuestionHashes, "getRoomUsedQuestionHashes");
function shufflePuzzleOptions(puzzle, { enabled = true } = {}) {
  if (!enabled || !puzzle || typeof puzzle !== "object") return puzzle;
  if (!Array.isArray(puzzle.options) || puzzle.options.length < 2) return puzzle;
  if (puzzle.correctIndex === void 0 || puzzle.correctIndex === null) return puzzle;
  const options = puzzle.options.map((o) => String(o));
  const correctIndex = Number(puzzle.correctIndex);
  if (!Number.isFinite(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return puzzle;
  }
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map((i) => options[i]);
  const newCorrectIndex = indices.indexOf(correctIndex);
  return {
    ...puzzle,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
}
__name(shufflePuzzleOptions, "shufflePuzzleOptions");
async function getRoomSeenQuestionHashes(env2, roomId) {
  const seen = /* @__PURE__ */ new Set();
  try {
    const history = await getRoomUsedQuestionHashes(env2, roomId);
    for (const h of history) seen.add(h);
    const rows = await env2.DB.prepare(
      "SELECT puzzle_json FROM room_puzzles WHERE room_id = ?"
    ).bind(roomId).all();
    for (const r of rows.results || []) {
      try {
        const pj = JSON.parse(r.puzzle_json);
        const normalized = normalizeQuizPuzzle(pj);
        if (normalized) {
          seen.add(computeQuestionHash(normalized));
        }
      } catch (_) {
      }
    }
  } catch (_) {
  }
  return seen;
}
__name(getRoomSeenQuestionHashes, "getRoomSeenQuestionHashes");
async function generateUniqueRoomPuzzle(env2, roomId, language, level, validator, maxAttempts = 4) {
  const seen = await getRoomSeenQuestionHashes(env2, roomId);
  const lang = language || "ar";
  const lvl = Number(level) || 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const raw = await generatePuzzleWithRetry(env2, lang, lvl);
    const normalized = normalizeQuizPuzzle(raw, { puzzleId: null });
    if (!normalized) continue;
    const validation = validator.validatePuzzle(normalized, lang);
    if (!validation.valid) continue;
    const h = computeQuestionHash(normalized);
    if (seen.has(h)) {
      console.warn("[DEDUP] Duplicate puzzle generated; retrying", { roomId, attempt, q: normalized.question });
      continue;
    }
    return normalized;
  }
  const pool = getBuiltInFallbackPuzzlePool(lang, lvl);
  for (const candidate of pool) {
    const normalized = normalizeQuizPuzzle(candidate, { puzzleId: null });
    if (!normalized) continue;
    const h = computeQuestionHash(normalized);
    if (!seen.has(h)) return normalized;
  }
  return normalizeQuizPuzzle(getBuiltInFallbackPuzzle(lang, lvl), { puzzleId: null });
}
__name(generateUniqueRoomPuzzle, "generateUniqueRoomPuzzle");
async function generatePuzzleWithRetry(env2, language, level, maxRetries = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PUZZLE GEN] AI attempt ${attempt}/${maxRetries}`);
      const puzzle = await generateAIPuzzle(env2, language, level);
      console.log(`[PUZZLE GEN] \u2713 AI success on attempt ${attempt}`);
      return puzzle;
    } catch (error3) {
      lastError = error3;
      const errMsg = String(error3?.message || error3);
      console.warn(`[PUZZLE GEN] \u2717 AI attempt ${attempt} failed:`, errMsg);
      if (errMsg.includes("validation failed") || errMsg.includes("Language mixing")) {
        console.log("[PUZZLE GEN] Validation failure detected - switching to DB fallback NOW");
        break;
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }
  console.log(`[PUZZLE GEN] Trying DB fallback for lang=${language}, level=${level}`);
  try {
    const dbOne = await env2.DB.prepare(
      "SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1"
    ).bind(level, language).first();
    if (dbOne?.json) {
      const normalized = parseAndNormalizeQuizJson(dbOne.json, { puzzleId: dbOne.id });
      if (normalized) {
        const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
        const validation = validator.validatePuzzle(normalized, language);
        if (validation.valid) {
          console.log("[PUZZLE GEN] \u2713 Using DB fallback puzzle", {
            level,
            language,
            puzzleId: dbOne.id
          });
          return normalized;
        }
        console.warn("[PUZZLE GEN] DB fallback puzzle invalid", validation.errors);
      }
    }
    const dbAny = await env2.DB.prepare(
      "SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT 1"
    ).first();
    if (dbAny?.json) {
      const normalized = parseAndNormalizeQuizJson(dbAny.json, { puzzleId: dbAny.id });
      if (normalized) {
        const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
        const validation = validator.validatePuzzle(normalized, language);
        if (validation.valid) {
          console.log("[PUZZLE GEN] \u2713 Using DB any-language fallback", { puzzleId: dbAny.id });
          return normalized;
        }
      }
    }
  } catch (fallbackError) {
    console.warn("[PUZZLE GEN] DB fallback failed", String(fallbackError?.message || fallbackError));
  }
  console.warn("[PUZZLE GEN] Using built-in fallback puzzle", {
    language,
    level,
    lastError: String(lastError?.message || lastError || "unknown")
  });
  return getBuiltInFallbackPuzzle(language, level);
}
__name(generatePuzzleWithRetry, "generatePuzzleWithRetry");
function getBuiltInFallbackPuzzlePool(language, level) {
  const lang = (language || "ar").toLowerCase();
  const lvl = Number(level) || 1;
  if (lang === "ar") {
    return [
      {
        type: "quiz",
        category: "wonder_link",
        question: '\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646 "\u0627\u0644\u0628\u062D\u0631" \u0648"\u0627\u0644\u0642\u0645\u062D"\u061F',
        options: [
          "\u062A\u0628\u062E\u0631 \u2192 \u063A\u064A\u0648\u0645 \u2192 \u0645\u0637\u0631 \u2192 \u062A\u0631\u0628\u0629",
          "\u0645\u0644\u062D \u2192 \u0623\u0633\u0645\u0627\u0643 \u2192 \u0635\u064A\u062F \u2192 \u0633\u0648\u0642",
          "\u0623\u0645\u0648\u0627\u062C \u2192 \u0634\u0627\u0637\u0626 \u2192 \u0631\u0645\u0627\u0644 \u2192 \u0635\u062D\u0631\u0627\u0621",
          "\u0623\u0639\u0645\u0627\u0642 \u2192 \u0636\u063A\u0637 \u2192 \u0645\u0639\u0627\u062F\u0646 \u2192 \u0635\u062E\u0648\u0631"
        ],
        correctIndex: 0,
        hint: "\u064A\u062A\u0639\u0644\u0642 \u0628\u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0621 \u0648\u062A\u0623\u062B\u064A\u0631\u0647\u0627 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631\u0627\u0639\u0629",
        pair: { a: "\u0627\u0644\u0628\u062D\u0631", b: "\u0627\u0644\u0642\u0645\u062D" },
        linkSteps: ["\u062A\u0628\u062E\u0631", "\u063A\u064A\u0648\u0645", "\u0645\u0637\u0631", "\u062A\u0631\u0628\u0629"],
        domain: "\u062F\u0648\u0631\u0627\u062A \u0637\u0628\u064A\u0639\u064A\u0629",
        scriptType: "\u0645\u0646 \u0627\u0644\u0645\u0627\u0621 \u0625\u0644\u0649 \u0627\u0644\u0632\u0631\u0627\u0639\u0629",
        explanation: "\u064A\u062A\u0628\u062E\u0631 \u0645\u0627\u0621 \u0627\u0644\u0628\u062D\u0631 \u0641\u064A\u0634\u0643\u0644 \u063A\u064A\u0648\u0645\u0627\u064B \u062A\u0645\u0637\u0631 \u0639\u0644\u0649 \u0627\u0644\u064A\u0627\u0628\u0633\u0629\u060C \u0641\u064A\u0631\u0637\u0628 \u0627\u0644\u062A\u0631\u0628\u0629 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u0632\u0631\u0627\u0639\u0629 \u0627\u0644\u0642\u0645\u062D.",
        level: lvl
      },
      {
        type: "quiz",
        category: "wonder_link",
        question: '\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646 "\u0627\u0644\u0634\u0645\u0633" \u0648"\u0627\u0644\u0645\u0637\u0631"\u061F',
        options: [
          "\u062A\u0628\u062E\u0631 \u2192 \u063A\u064A\u0648\u0645 \u2192 \u062A\u0643\u0627\u062B\u0641 \u2192 \u0645\u0637\u0631",
          "\u0644\u064A\u0644 \u2192 \u0646\u062C\u0648\u0645 \u2192 \u0638\u0644\u0627\u0645 \u2192 \u0645\u0637\u0631",
          "\u062D\u0631\u0627\u0631\u0629 \u2192 \u0635\u062D\u0631\u0627\u0621 \u2192 \u0631\u0645\u0627\u0644 \u2192 \u0645\u0637\u0631",
          "\u0635\u064A\u0641 \u2192 \u0639\u0637\u0634 \u2192 \u0645\u0627\u0621 \u2192 \u0645\u0637\u0631"
        ],
        correctIndex: 0,
        hint: "\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u062A\u0628\u062F\u0623 \u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0621",
        pair: { a: "\u0627\u0644\u0634\u0645\u0633", b: "\u0627\u0644\u0645\u0637\u0631" },
        linkSteps: ["\u062A\u0628\u062E\u0631", "\u063A\u064A\u0648\u0645", "\u062A\u0643\u0627\u062B\u0641", "\u0645\u0637\u0631"],
        domain: "\u0627\u0644\u0637\u0642\u0633",
        scriptType: "\u0633\u0628\u0628 \u0648\u0646\u062A\u064A\u062C\u0629",
        explanation: "\u062D\u0631\u0627\u0631\u0629 \u0627\u0644\u0634\u0645\u0633 \u062A\u0633\u0628\u0628 \u0627\u0644\u062A\u0628\u062E\u0631 \u062B\u0645 \u062A\u062A\u0643\u0648\u0646 \u0627\u0644\u063A\u064A\u0648\u0645 \u0648\u062A\u062A\u06A9\u0627\u062B\u0641 \u0644\u062A\u0633\u0642\u0637 \u0627\u0644\u0623\u0645\u0637\u0627\u0631.",
        level: lvl
      },
      {
        type: "quiz",
        category: "wonder_link",
        question: '\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646 "\u0627\u0644\u0643\u062A\u0627\u0628" \u0648"\u0627\u0644\u0630\u0627\u0643\u0631\u0629"\u061F',
        options: [
          "\u0642\u0631\u0627\u0621\u0629 \u2192 \u0641\u0647\u0645 \u2192 \u062A\u0643\u0631\u0627\u0631 \u2192 \u0630\u0627\u0643\u0631\u0629",
          "\u062D\u0628\u0631 \u2192 \u0648\u0631\u0642 \u2192 \u063A\u0644\u0627\u0641 \u2192 \u0630\u0627\u0643\u0631\u0629",
          "\u0645\u0643\u062A\u0628\u0629 \u2192 \u0631\u0641\u0648\u0641 \u2192 \u0643\u062A\u0628 \u2192 \u0630\u0627\u0643\u0631\u0629",
          "\u0642\u0644\u0645 \u2192 \u0643\u062A\u0627\u0628\u0629 \u2192 \u0633\u0637\u0631 \u2192 \u0630\u0627\u0643\u0631\u0629"
        ],
        correctIndex: 0,
        hint: "\u0627\u0644\u062A\u0639\u0644\u0645 \u064A\u062B\u0628\u062A \u0628\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629",
        pair: { a: "\u0627\u0644\u0643\u062A\u0627\u0628", b: "\u0627\u0644\u0630\u0627\u0643\u0631\u0629" },
        linkSteps: ["\u0642\u0631\u0627\u0621\u0629", "\u0641\u0647\u0645", "\u062A\u0643\u0631\u0627\u0631", "\u0630\u0627\u0643\u0631\u0629"],
        domain: "\u0627\u0644\u062A\u0639\u0644\u0645",
        scriptType: "\u062A\u0639\u0644\u0645 \u0648\u062A\u062B\u0628\u064A\u062A",
        explanation: "\u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u0644\u0641\u0647\u0645 \u062B\u0645 \u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u064A\u0633\u0627\u0639\u062F \u0639\u0644\u0649 \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0641\u064A \u0627\u0644\u0630\u0627\u0643\u0631\u0629.",
        level: lvl
      },
      {
        type: "quiz",
        category: "wonder_link",
        question: '\u0645\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0628\u064A\u0646 "\u0627\u0644\u0637\u0639\u0627\u0645" \u0648"\u0627\u0644\u0637\u0627\u0642\u0629"\u061F',
        options: [
          "\u0647\u0636\u0645 \u2192 \u0627\u0645\u062A\u0635\u0627\u0635 \u2192 \u0633\u0643\u0631 \u2192 \u0637\u0627\u0642\u0629",
          "\u0645\u0644\u062D \u2192 \u0641\u0644\u0641\u0644 \u2192 \u0646\u0643\u0647\u0629 \u2192 \u0637\u0627\u0642\u0629",
          "\u0637\u0628\u062E \u2192 \u0646\u0627\u0631 \u2192 \u062F\u062E\u0627\u0646 \u2192 \u0637\u0627\u0642\u0629",
          "\u0645\u0627\u0626\u062F\u0629 \u2192 \u0635\u062D\u0648\u0646 \u2192 \u0634\u0648\u0643\u0629 \u2192 \u0637\u0627\u0642\u0629"
        ],
        correctIndex: 0,
        hint: "\u0627\u0644\u062C\u0633\u0645 \u064A\u062D\u0648\u0644 \u0627\u0644\u063A\u0630\u0627\u0621 \u0625\u0644\u0649 \u0637\u0627\u0642\u0629",
        pair: { a: "\u0627\u0644\u0637\u0639\u0627\u0645", b: "\u0627\u0644\u0637\u0627\u0642\u0629" },
        linkSteps: ["\u0647\u0636\u0645", "\u0627\u0645\u062A\u0635\u0627\u0635", "\u0633\u0643\u0631", "\u0637\u0627\u0642\u0629"],
        domain: "\u0627\u0644\u062C\u0633\u0645",
        scriptType: "\u062A\u062D\u0648\u064A\u0644",
        explanation: "\u064A\u0647\u0636\u0645 \u0627\u0644\u062C\u0633\u0645 \u0627\u0644\u0637\u0639\u0627\u0645 \u0648\u064A\u0645\u062A\u0635\u0647 \u062B\u0645 \u064A\u062D\u0648\u0644\u0647 \u0625\u0644\u0649 \u0633\u0643\u0631/\u0637\u0627\u0642\u0629 \u0644\u0644\u062D\u0631\u0643\u0629 \u0648\u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u062D\u064A\u0648\u064A\u0629.",
        level: lvl
      }
    ];
  }
  return [
    {
      type: "quiz",
      category: "wonder_link",
      question: 'What is the link between "sea" and "wheat"?',
      options: [
        "evaporation \u2192 clouds \u2192 rain \u2192 soil",
        "salt \u2192 fish \u2192 fishing \u2192 market",
        "waves \u2192 shore \u2192 sand \u2192 desert",
        "depth \u2192 pressure \u2192 minerals \u2192 rocks"
      ],
      correctIndex: 0,
      hint: "It relates to the water cycle and farming.",
      pair: { a: "sea", b: "wheat" },
      linkSteps: ["evaporation", "clouds", "rain", "soil"],
      domain: "natural cycles",
      scriptType: "water-to-farming",
      explanation: "Sea water evaporates to form clouds that bring rain, which moistens soil needed to grow wheat.",
      level: lvl
    },
    {
      type: "quiz",
      category: "wonder_link",
      question: 'What is the link between "sun" and "rain"?',
      options: [
        "heat \u2192 evaporation \u2192 clouds \u2192 rain",
        "night \u2192 stars \u2192 dark \u2192 rain",
        "summer \u2192 desert \u2192 sand \u2192 rain",
        "fire \u2192 smoke \u2192 ash \u2192 rain"
      ],
      correctIndex: 0,
      hint: "Heat starts the water cycle.",
      pair: { a: "sun", b: "rain" },
      linkSteps: ["heat", "evaporation", "clouds", "rain"],
      domain: "weather",
      scriptType: "cause-effect",
      explanation: "Sun heat drives evaporation; clouds form and then rain falls.",
      level: lvl
    }
  ];
}
__name(getBuiltInFallbackPuzzlePool, "getBuiltInFallbackPuzzlePool");
function getBuiltInFallbackPuzzle(language, level) {
  const pool = getBuiltInFallbackPuzzlePool(language, level);
  const idx = Math.abs((Date.now() + Math.floor(Math.random() * 1e5)) % pool.length);
  return pool[idx];
}
__name(getBuiltInFallbackPuzzle, "getBuiltInFallbackPuzzle");
async function generateAIPuzzle(env2, language, level) {
  const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
  const quizType = (env2?.QUIZ_TYPE || "wonder_link").toLowerCase();
  const prompts = await Promise.resolve().then(() => (init_prompt(), prompt_exports));
  const useWonderLink = quizType === "wonder_link" || quizType === "link";
  const systemPrompt = useWonderLink ? prompts.buildLinkQuizSystemPrompt({ language, level }) : prompts.buildQuizSystemPrompt({ language, level });
  const userPrompt = useWonderLink ? prompts.buildLinkQuizUserPrompt({ language, level, seed: Date.now() }) : prompts.buildQuizUserPrompt({ language, level, seed: Date.now() });
  const openaiApiKey = env2?.OPENAI_API_KEY;
  const openaiModel = env2?.OPENAI_MODEL || "gpt-4o-mini";
  const groqApiKey = env2?.GROQ_API_KEY;
  const groqModel = env2?.GROQ_MODEL || "llama-3.1-8b-instant";
  const aiModel = env2?.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const geminiApiKey = env2?.GEMINI_API_KEY;
  const geminiModel = env2?.GEMINI_MODEL || "gemini-2.0-flash";
  let content = "";
  let aiProvider = "none";
  if (geminiApiKey) {
    try {
      const modelPath = String(geminiModel).startsWith("models/") ? String(geminiModel) : `models/${geminiModel}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt + "\n\n" + userPrompt
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.7
            // Reduced from 0.9 for more consistent output
          }
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${errText}`);
      }
      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      aiProvider = "gemini";
    } catch (e) {
      console.warn("[AI QUIZ] Gemini generation failed; falling back", {
        model: geminiModel,
        error: String(e?.message || e)
      });
      content = "";
    }
  }
  if (!content && env2?.AI) {
    try {
      const out = await env2.AI.run(aiModel, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 900
      });
      const text = out?.response ?? out?.result ?? out?.output_text ?? out?.text ?? (typeof out === "string" ? out : JSON.stringify(out));
      content = String(text);
      aiProvider = "workers-ai";
    } catch (e) {
      console.warn("[AI QUIZ] Workers AI generation failed; falling back", {
        model: aiModel,
        error: String(e?.message || e)
      });
      content = "";
    }
  }
  if (!content && openaiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 900
        })
      });
      const data = await response.json();
      content = data?.choices?.[0]?.message?.content ?? "";
      aiProvider = "openai";
    } catch (e) {
      console.warn("[AI QUIZ] OpenAI generation failed", { error: String(e?.message || e) });
      content = "";
    }
  }
  if (!content && groqApiKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1e3
        })
      });
      const data = await response.json();
      content = data?.choices?.[0]?.message?.content ?? "";
      aiProvider = "groq";
    } catch (e) {
      console.warn("[AI QUIZ] Groq generation failed", { error: String(e?.message || e) });
      content = "";
    }
  }
  if (!content) {
    throw new Error("No AI provider configured");
  }
  const parsed = safeParseJsonFromModelOutput(content);
  const stripLatin = /* @__PURE__ */ __name((value) => {
    if (typeof value !== "string") return value;
    let cleaned = value.replace(/[a-zA-Z]/g, "");
    cleaned = cleaned.replace(/[\(\)\[\]\{\}]/g, "");
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  }, "stripLatin");
  const stripLatinFromPuzzle = /* @__PURE__ */ __name((p) => {
    if (!p || typeof p !== "object") return p;
    const out = Array.isArray(p) ? p.map(stripLatinFromPuzzle) : { ...p };
    const fields = ["question", "hint", "explanation", "startWord", "endWord", "category"];
    for (const f of fields) {
      if (typeof out[f] === "string") out[f] = stripLatin(out[f]);
    }
    if (Array.isArray(out.options)) {
      out.options = out.options.map((o) => stripLatin(String(o ?? ""))).filter(Boolean);
    }
    if (Array.isArray(out.steps)) {
      out.steps = out.steps.map((s) => {
        const step = s && typeof s === "object" ? { ...s } : s;
        if (step && typeof step === "object") {
          if (typeof step.word === "string") step.word = stripLatin(step.word);
          if (Array.isArray(step.options)) {
            step.options = step.options.map((o) => stripLatin(String(o ?? ""))).filter(Boolean);
          }
        }
        return step;
      });
    }
    return out;
  }, "stripLatinFromPuzzle");
  const candidate = language === "ar" ? stripLatinFromPuzzle(parsed) : parsed;
  const validation = validator.validatePuzzle(candidate, language);
  const quality = validator.ratePuzzleQuality(candidate, language);
  console.log("[AI PUZZLE GENERATED]", {
    aiProvider,
    language,
    level,
    valid: validation.valid,
    qualityScore: quality,
    errors: validation.errors,
    warnings: validation.warnings
  });
  if (!validation.valid) {
    console.error("[AI PUZZLE VALIDATION FAILED]", {
      aiProvider,
      errors: validation.errors,
      puzzle: parsed
    });
    throw new Error(`AI puzzle validation failed: ${validation.errors.join("; ")}`);
  }
  if (quality < 85) {
    console.error("[AI PUZZLE REJECTED - LOW QUALITY]", {
      aiProvider,
      qualityScore: quality,
      threshold: 85,
      warnings: validation.warnings,
      question: candidate?.question?.substring(0, 100)
    });
    throw new Error(`AI puzzle quality too low (${quality}/100). Minimum required: 85`);
  }
  const sanitized = validator.sanitizePuzzle(candidate);
  if (useWonderLink) {
    sanitized.category = sanitized.category || "wonder_link";
  }
  async function ensurePuzzleHashesTable() {
    try {
      await env2.DB.prepare(`
        CREATE TABLE IF NOT EXISTS puzzle_hashes (
          hash TEXT PRIMARY KEY,
          puzzle_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
    }
  }
  __name(ensurePuzzleHashesTable, "ensurePuzzleHashesTable");
  async function computeHexHash(text) {
    try {
      if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
        const data = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest("SHA-256", data);
        const arr = Array.from(new Uint8Array(buf));
        return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) {
    }
    try {
      const { createHash } = await import("crypto");
      return createHash("sha256").update(text).digest("hex");
    } catch (e) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h.toString(16);
    }
  }
  __name(computeHexHash, "computeHexHash");
  if (useWonderLink) {
    const { linkSteps } = sanitized;
    const { min: chainMin, max: chainMax } = linkChainMinMax(level);
    if (!Array.isArray(linkSteps) || linkSteps.length < chainMin || linkSteps.length > chainMax) {
      console.warn("[AI PUZZLE] Rejecting wonder_link: linkSteps length out of bounds", { len: (linkSteps || []).length, chainMin, chainMax });
      throw new Error("Wonder Link chain length invalid");
    }
    const stepSet = /* @__PURE__ */ new Set();
    for (const s of linkSteps) {
      if (typeof s !== "string" || s.trim().length === 0) {
        throw new Error("Invalid link step content");
      }
      const low = s.trim().toLowerCase();
      if (stepSet.has(low)) {
        throw new Error("Duplicate link step");
      }
      stepSet.add(low);
      const langCheck = validator.validateLanguage(s, language);
      if (!langCheck.valid) {
        throw new Error("Link step language invalid");
      }
    }
  }
  if (sanitized.explanation && typeof sanitized.explanation === "string") {
    const parts = sanitized.explanation.split(/\.|\n/).map((p) => p.trim()).filter(Boolean);
    const limited = [];
    for (let i = 0; i < Math.min(parts.length, 5); i++) {
      let s = parts[i];
      if (s.length > 140) s = s.slice(0, 137).trim() + "...";
      limited.push(s);
    }
    sanitized.explanation = limited.join(". ");
  }
  await ensurePuzzleHashesTable();
  const dedupKeyBase = `${sanitized.pair?.a || ""}||${sanitized.pair?.b || ""}||${JSON.stringify(sanitized.linkSteps || sanitized.options || [])}`;
  const puzzleHash = await computeHexHash(dedupKeyBase);
  const existing = await env2.DB.prepare("SELECT puzzle_id FROM puzzle_hashes WHERE hash = ?").bind(puzzleHash).first();
  if (existing && existing.puzzle_id) {
    console.warn("[AI PUZZLE] Duplicate detected - skipping", { puzzleHash });
    throw new Error("Duplicate puzzle");
  }
  try {
    await env2.DB.prepare("INSERT OR IGNORE INTO puzzle_hashes (hash, puzzle_id) VALUES (?, ?)").bind(puzzleHash, null).run();
  } catch (e) {
  }
  return sanitized;
}
__name(generateAIPuzzle, "generateAIPuzzle");
async function submitAnswer(request, env2, ctx) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const { roomId, puzzleIndex, answerIndex, steps, timeTaken } = body;
  const safeTimeTaken = Number.isFinite(Number(timeTaken)) ? Number(timeTaken) : 0;
  if (!roomId || puzzleIndex === void 0) {
    return errorResponse("Missing required fields", 400);
  }
  if (answerIndex === void 0 && !Array.isArray(steps)) {
    return errorResponse("Missing answer (answerIndex or steps)", 400);
  }
  try {
    const validator = await Promise.resolve().then(() => (init_puzzle_validator(), puzzle_validator_exports));
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.status !== "active") {
      return errorResponse("Room is not active", 400);
    }
    const participant = await env2.DB.prepare(
      "SELECT is_frozen, current_puzzle_index FROM room_participants WHERE room_id = ? AND user_id = ?"
    ).bind(roomId, user.id).first();
    if (participant && participant.is_frozen) {
      return errorResponse("You are frozen by the manager", 403);
    }
    const puzzleRow = await env2.DB.prepare(
      "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
    ).bind(roomId, puzzleIndex).first();
    if (!puzzleRow) return errorResponse("Puzzle not found", 400);
    const puzzle = JSON.parse(puzzleRow.puzzle_json);
    const existingAnswer = await env2.DB.prepare(
      "SELECT is_correct FROM room_results WHERE room_id = ? AND user_id = ? AND puzzle_index = ? LIMIT 1"
    ).bind(roomId, user.id, puzzleIndex).first();
    const normalizedQuiz = normalizeQuizPuzzle(puzzle);
    if (puzzle.correctIndex !== void 0 && puzzle.correctIndex !== null) {
      puzzle.correctIndex = Number(puzzle.correctIndex);
    }
    let isCorrect = false;
    console.log("[SUBMIT ANSWER]", {
      answerIndex,
      correctIndex: puzzle.correctIndex,
      correctIndexType: typeof puzzle.correctIndex,
      steps,
      hasSteps: Array.isArray(puzzle.steps),
      puzzleKeys: Object.keys(puzzle)
    });
    if (answerIndex !== void 0) {
      if (!normalizedQuiz) {
        console.log("[ERROR] Invalid quiz puzzle format (answerIndex provided)", {
          answerIndex,
          puzzleKeys: Object.keys(puzzle)
        });
        return errorResponse("Invalid puzzle format", 400);
      }
      isCorrect = Number(answerIndex) === Number(normalizedQuiz.correctIndex);
    } else if (steps && Array.isArray(puzzle.steps)) {
      const correctSteps = puzzle.steps.map((s) => s.word);
      isCorrect = JSON.stringify(correctSteps) === JSON.stringify(steps);
    } else {
      console.log("[ERROR] Invalid puzzle format", {
        answerIndex,
        correctIndex: puzzle.correctIndex,
        correctIndexType: typeof puzzle.correctIndex,
        steps,
        puzzleSteps: puzzle.steps,
        fullPuzzle: puzzle
      });
      return errorResponse("Invalid puzzle format", 400);
    }
    if (existingAnswer) {
      const participantCurrent2 = Number(participant?.current_puzzle_index ?? 0);
      let nextUserPuzzleIndex2 = null;
      if (Number.isFinite(participantCurrent2) && participantCurrent2 < room.puzzle_count) {
        nextUserPuzzleIndex2 = participantCurrent2;
      } else if (Number.isFinite(participantCurrent2) && participantCurrent2 >= room.puzzle_count) {
        nextUserPuzzleIndex2 = null;
      } else {
        const answeredPuzzles = await env2.DB.prepare(
          "SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ? ORDER BY puzzle_index ASC"
        ).bind(roomId, user.id).all();
        const answeredIndices = new Set((answeredPuzzles.results || []).map((r) => r.puzzle_index));
        for (let i = 0; i < room.puzzle_count; i++) {
          if (!answeredIndices.has(i)) {
            nextUserPuzzleIndex2 = i;
            break;
          }
        }
      }
      let nextPuzzle2 = null;
      let gameFinished2 = false;
      if (nextUserPuzzleIndex2 === null) {
        gameFinished2 = true;
      } else {
        const nextPuzzleRow = await env2.DB.prepare(
          "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
        ).bind(roomId, nextUserPuzzleIndex2).first();
        if (nextPuzzleRow) {
          nextPuzzle2 = toPublicPuzzle(JSON.parse(nextPuzzleRow.puzzle_json));
        }
      }
      await env2.DB.prepare(
        "UPDATE room_participants SET current_puzzle_index = ? WHERE room_id = ? AND user_id = ?"
      ).bind(gameFinished2 ? room.puzzle_count : nextUserPuzzleIndex2, roomId, user.id).run();
      return jsonResponse({
        success: true,
        alreadyAnswered: true,
        isCorrect: existingAnswer.is_correct === 1,
        isFirstCorrect: false,
        points: 0,
        rank: null,
        correctIndex: normalizedQuiz ? Number(normalizedQuiz.correctIndex) : null,
        nextPuzzle: nextPuzzle2,
        nextPuzzleIndex: gameFinished2 ? null : nextUserPuzzleIndex2,
        gameFinished: gameFinished2
      });
    }
    let isFirstCorrect = false;
    if (isCorrect) {
      const existingCorrect = await env2.DB.prepare(
        "SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ? AND is_correct = 1"
      ).bind(roomId, puzzleIndex).first();
      isFirstCorrect = existingCorrect.c === 0;
      if (isFirstCorrect) {
        await env2.DB.prepare(
          "UPDATE room_puzzles SET solved_by = ?, solved_at = CURRENT_TIMESTAMP WHERE room_id = ? AND puzzle_index = ?"
        ).bind(user.id, roomId, puzzleIndex).run();
      }
    }
    let puzzleId = null;
    if (puzzle.puzzleId) {
      puzzleId = puzzle.puzzleId;
    }
    if (!puzzleId) {
      const lang = room.language || "ar";
      const difficulty = room.difficulty || 1;
      const jsonStr = JSON.stringify(puzzle);
      const inserted = await env2.DB.prepare(
        "INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)"
        // returns last_row_id
      ).bind(difficulty, lang, jsonStr).run();
      puzzleId = inserted.meta.last_row_id;
    }
    await env2.DB.prepare(
      "INSERT INTO room_results (room_id, user_id, puzzle_id, puzzle_index, is_correct, time_taken) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(roomId, user.id, puzzleId, puzzleIndex, isCorrect, safeTimeTaken).run();
    let points = 0;
    let rank = null;
    if (isCorrect) {
      if (isFirstCorrect) {
        points = Math.max(500, 2e3 - Math.floor(safeTimeTaken / 50));
        rank = 1;
      } else {
        points = Math.max(100, 1e3 - Math.floor(safeTimeTaken / 100));
        const fasterCount = await env2.DB.prepare(
          "SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ? AND is_correct = 1 AND time_taken < ?"
        ).bind(roomId, puzzleIndex, safeTimeTaken).first();
        rank = fasterCount.c + 1;
      }
      await env2.DB.prepare(
        "UPDATE room_participants SET score = score + ?, puzzles_solved = puzzles_solved + 1 WHERE room_id = ? AND user_id = ?"
      ).bind(points, roomId, user.id).run();
      if (isFirstCorrect) {
        const doId = env2.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env2.ROOM_DO.get(doId);
        const req = new Request("http://room/puzzle-solved", {
          method: "POST",
          body: JSON.stringify({
            type: "puzzle_solved_first",
            userId: user.id,
            username: user.username,
            puzzleIndex,
            timeTaken: safeTimeTaken
          })
        });
        if (ctx?.waitUntil) ctx.waitUntil(roomObject.fetch(req));
        else await roomObject.fetch(req);
      }
    }
    let nextPuzzle = null;
    let nextPuzzleIndex = null;
    let gameFinished = false;
    const participantCurrent = Number(participant?.current_puzzle_index ?? 0);
    let nextUserPuzzleIndex = null;
    if (Number.isFinite(participantCurrent) && Number(puzzleIndex) === participantCurrent) {
      const candidate = participantCurrent + 1;
      nextUserPuzzleIndex = candidate >= room.puzzle_count ? null : candidate;
    } else {
      const answeredPuzzles = await env2.DB.prepare(
        "SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ? ORDER BY puzzle_index ASC"
      ).bind(roomId, user.id).all();
      const answeredIndices = new Set((answeredPuzzles.results || []).map((r) => r.puzzle_index));
      for (let i = 0; i < room.puzzle_count; i++) {
        if (!answeredIndices.has(i)) {
          nextUserPuzzleIndex = i;
          break;
        }
      }
    }
    if (nextUserPuzzleIndex === null) {
      gameFinished = true;
    } else {
      let nextPuzzleRow = await env2.DB.prepare(
        "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
      ).bind(roomId, nextUserPuzzleIndex).first();
      if (!nextPuzzleRow) {
        console.warn("[ON-DEMAND NEXT] Missing next puzzle row; generating now", {
          roomId,
          puzzleIndex: nextUserPuzzleIndex,
          lang: room.language,
          difficulty: room.difficulty
        });
        try {
          const generated = await generateUniqueRoomPuzzle(
            env2,
            roomId,
            room.language || "ar",
            room.difficulty || 1,
            validator
          );
          if (generated) {
            await env2.DB.prepare(
              "INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)"
            ).bind(roomId, nextUserPuzzleIndex, JSON.stringify(generated)).run();
            nextPuzzleRow = { puzzle_json: JSON.stringify(generated) };
          }
        } catch (e) {
          console.error("[ON-DEMAND NEXT] Failed to generate", String(e?.message || e));
        }
      }
      if (nextPuzzleRow?.puzzle_json) {
        let parsedNext = null;
        try {
          parsedNext = JSON.parse(nextPuzzleRow.puzzle_json);
        } catch (_) {
          parsedNext = null;
        }
        let normalizedNext = parsedNext ? normalizeQuizPuzzle(parsedNext) : null;
        const isInvalidNext = !normalizedNext || !validator.validatePuzzle(normalizedNext, room.language || "ar").valid;
        if (isInvalidNext) {
          try {
            const repaired = normalizeQuizPuzzle(
              await generatePuzzleWithRetry(env2, room.language || "ar", room.difficulty || 1)
            );
            if (repaired) {
              await env2.DB.prepare(
                "UPDATE room_puzzles SET puzzle_json = ? WHERE room_id = ? AND puzzle_index = ?"
              ).bind(JSON.stringify(repaired), roomId, nextUserPuzzleIndex).run();
              normalizedNext = repaired;
            }
          } catch (e) {
            console.error("[REPAIR NEXT] Failed to repair next puzzle", String(e?.message || e));
          }
        }
        if (normalizedNext) {
          nextPuzzle = toPublicPuzzle(normalizedNext);
        }
      }
      nextPuzzleIndex = nextUserPuzzleIndex;
    }
    await env2.DB.prepare(
      "UPDATE room_participants SET current_puzzle_index = ? WHERE room_id = ? AND user_id = ?"
    ).bind(gameFinished ? room.puzzle_count : nextUserPuzzleIndex, roomId, user.id).run();
    const maxPtr = await env2.DB.prepare(
      "SELECT MAX(current_puzzle_index) AS max_ptr FROM room_participants WHERE room_id = ?"
    ).bind(roomId).first();
    if (maxPtr?.max_ptr != null) {
      const computedGlobal = Math.max(0, Number(maxPtr.max_ptr) - 1);
      await env2.DB.prepare("UPDATE rooms SET current_puzzle_index = ? WHERE id = ?").bind(computedGlobal, roomId).run();
    }
    const allParticipantsCount = await env2.DB.prepare(
      "SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?"
    ).bind(roomId).first();
    const finishedParticipants = await env2.DB.prepare(
      "SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ? AND current_puzzle_index >= ?"
    ).bind(roomId, room.puzzle_count).first();
    if (finishedParticipants.c >= allParticipantsCount.c && room.status !== "finished") {
      await env2.DB.prepare("UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").bind("finished", roomId).run();
      const doId = env2.ROOM_DO.idFromName(roomId.toString());
      const roomObject = env2.ROOM_DO.get(doId);
      const req = new Request("http://room/finish-game", {
        method: "POST",
        body: JSON.stringify({ type: "finish_game", roomId })
      });
      if (ctx?.waitUntil) ctx.waitUntil(roomObject.fetch(req));
      else await roomObject.fetch(req);
    }
    return jsonResponse({
      success: true,
      isCorrect,
      isFirstCorrect,
      points,
      rank,
      // Reveal correctIndex only after answering (anti-cheat)
      correctIndex: normalizedQuiz ? Number(normalizedQuiz.correctIndex) : null,
      nextPuzzle,
      nextPuzzleIndex,
      gameFinished
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(submitAnswer, "submitAnswer");
async function getLeaderboard(request, env2) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const leaderboard = await env2.DB.prepare(
      `SELECT 
        rp.user_id,
        u.username,
        rp.score,
        rp.puzzles_solved,
        rp.current_puzzle_index,
        COUNT(rr.id) as total_answers,
        SUM(CASE WHEN rr.is_correct THEN 1 ELSE 0 END) as correct_answers
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN room_results rr ON rp.room_id = rr.room_id AND rp.user_id = rr.user_id
      WHERE rp.room_id = ?
      GROUP BY rp.user_id, u.username, rp.score, rp.puzzles_solved, rp.current_puzzle_index
      ORDER BY rp.score DESC, rp.puzzles_solved DESC, correct_answers DESC`
    ).bind(roomId).all();
    return jsonResponse({ leaderboard: leaderboard.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(getLeaderboard, "getLeaderboard");
async function createCompetition(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const {
    name = `Competition ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
    maxParticipants = 100,
    puzzleCount = 10,
    timePerPuzzle = 60
  } = body;
  try {
    const result = await env2.DB.prepare(
      "INSERT INTO competitions (name, type, max_participants, puzzle_count, time_per_puzzle, created_by) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(name, "global", maxParticipants, puzzleCount, timePerPuzzle, user.id).run();
    const competition = await env2.DB.prepare("SELECT * FROM competitions WHERE id = ?").bind(result.meta.last_row_id).first();
    return jsonResponse({ success: true, competition }, 201);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(createCompetition, "createCompetition");
async function joinCompetition(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { competitionId } = await request.json();
  if (!competitionId) return errorResponse("competitionId required", 400);
  try {
    const competition = await env2.DB.prepare("SELECT * FROM competitions WHERE id = ?").bind(competitionId).first();
    if (!competition) return errorResponse("Competition not found", 404);
    if (competition.status !== "waiting") {
      return errorResponse("Competition is not accepting new participants", 400);
    }
    const existing = await env2.DB.prepare(
      "SELECT id FROM competition_participants WHERE competition_id = ? AND user_id = ?"
    ).bind(competitionId, user.id).first();
    if (existing) {
      return jsonResponse({ success: true, message: "Already joined" }, 200);
    }
    const participantCount = await env2.DB.prepare(
      "SELECT COUNT(*) AS c FROM competition_participants WHERE competition_id = ?"
    ).bind(competitionId).first();
    if (participantCount.c >= competition.max_participants) {
      return errorResponse("Competition is full", 400);
    }
    await env2.DB.prepare("INSERT INTO competition_participants (competition_id, user_id) VALUES (?, ?)").bind(competitionId, user.id).run();
    return jsonResponse({ success: true, competition }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(joinCompetition, "joinCompetition");
async function getActiveCompetitions(request, env2) {
  try {
    const competitions = await env2.DB.prepare(
      "SELECT c.*, u.username as creator_name, COUNT(cp.id) as participant_count FROM competitions c LEFT JOIN users u ON c.created_by = u.id LEFT JOIN competition_participants cp ON c.id = cp.competition_id WHERE c.status IN (?, ?) GROUP BY c.id ORDER BY c.created_at DESC"
    ).bind("waiting", "active").all();
    return jsonResponse({ competitions: competitions.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(getActiveCompetitions, "getActiveCompetitions");
async function getMyRooms(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    const rooms = await env2.DB.prepare(
      `SELECT r.id, r.name, r.code, r.status, r.created_by, r.puzzle_count, 
              r.time_per_puzzle, r.difficulty, r.language, r.puzzle_source, r.created_at,
              u.username as creator_name,
              rp.role as my_role,
              COUNT(DISTINCT rp2.user_id) as participant_count
      FROM rooms r 
      JOIN room_participants rp ON r.id = rp.room_id 
      JOIN room_participants rp2 ON r.id = rp2.room_id
      JOIN users u ON r.created_by = u.id
      WHERE rp.user_id = ? 
      GROUP BY r.id
      ORDER BY r.created_at DESC LIMIT 50`
    ).bind(user.id).all();
    return jsonResponse({ rooms: rooms.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(getMyRooms, "getMyRooms");
async function leaveRoom(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId, permanent } = await request.json();
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT created_by FROM rooms WHERE id = ?").bind(roomId).first();
    if (room && room.created_by === user.id) {
      return errorResponse("\u0627\u0644\u0645\u0646\u0634\u0626 \u0644\u0627 \u064A\u0645\u0643\u0646\u0647 \u0645\u063A\u0627\u062F\u0631\u0629 \u0627\u0644\u063A\u0631\u0641\u0629. \u064A\u062C\u0628 \u062D\u0630\u0641 \u0627\u0644\u063A\u0631\u0641\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644.", 400);
    }
    const shouldDelete = permanent !== false;
    if (shouldDelete) {
      await env2.DB.prepare("DELETE FROM room_participants WHERE room_id = ? AND user_id = ?").bind(roomId, user.id).run();
    } else {
      await env2.DB.prepare("UPDATE room_participants SET is_ready = 0 WHERE room_id = ? AND user_id = ?").bind(roomId, user.id).run();
    }
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(leaveRoom, "leaveRoom");
async function kickUser(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId, targetUserId } = await request.json();
  if (!roomId || !targetUserId) return errorResponse("roomId and targetUserId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT created_by FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.created_by !== user.id) return errorResponse("Only host can kick users", 403);
    await env2.DB.prepare("DELETE FROM room_participants WHERE room_id = ? AND user_id = ?").bind(roomId, targetUserId).run();
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(kickUser, "kickUser");
async function manualStartGame(request, env2, ctx) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId } = await request.json();
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.created_by !== user.id) return errorResponse("Only host can start game", 403);
    if (room.status !== "waiting") return errorResponse("Room is not in waiting status", 400);
    await startRoomGame(env2, roomId, ctx);
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(manualStartGame, "manualStartGame");
async function deleteRoom(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT created_by FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.created_by !== user.id) return errorResponse("Only host can delete room", 403);
    await env2.DB.prepare("DELETE FROM manager_actions WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM puzzle_reports WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_results WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_puzzles WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_participants WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_settings WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM competition_participants WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM rooms WHERE id = ?").bind(roomId).run();
    const doId = env2.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env2.ROOM_DO.get(doId);
    await roomObject.fetch(new Request("http://room/delete-event", {
      method: "POST",
      body: JSON.stringify({ type: "room_deleted" })
    }));
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(deleteRoom, "deleteRoom");
async function reopenRoom(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId } = await request.json();
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.created_by !== user.id) return errorResponse("Only host can reopen room", 403);
    await env2.DB.prepare("DELETE FROM manager_actions WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM puzzle_reports WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_results WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("DELETE FROM room_puzzles WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0, is_ready = 0 WHERE room_id = ?").bind(roomId).run();
    await env2.DB.prepare("UPDATE rooms SET status = ?, current_puzzle_index = 0, current_puzzle_id = NULL, started_at = NULL, finished_at = NULL WHERE id = ?").bind("waiting", roomId).run();
    try {
      const doId = env2.ROOM_DO.idFromName(roomId.toString());
      const roomObject = env2.ROOM_DO.get(doId);
      await roomObject.fetch(new Request("http://room/reopen", {
        method: "POST",
        body: JSON.stringify({ type: "room_reopened" })
      }));
    } catch (_) {
    }
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(reopenRoom, "reopenRoom");
async function forceNextPuzzle(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const { roomId } = await request.json();
  if (!roomId) return errorResponse("roomId required", 400);
  try {
    const room = await env2.DB.prepare("SELECT * FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) return errorResponse("Room not found", 404);
    if (room.created_by !== user.id) return errorResponse("Only host can advance puzzle", 403);
    if (room.status !== "active") return errorResponse("Room is not active", 400);
    const currentIdx = room.current_puzzle_index ?? 0;
    const nextIdx = currentIdx + 1;
    if (nextIdx >= (room.puzzle_count ?? 0)) {
      await env2.DB.prepare("UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").bind("finished", roomId).run();
      const doId2 = env2.ROOM_DO.idFromName(roomId.toString());
      const roomObject2 = env2.ROOM_DO.get(doId2);
      await roomObject2.fetch(new Request("http://room/finish-game", {
        method: "POST",
        body: JSON.stringify({ type: "finish_game", roomId })
      }));
      return jsonResponse({ success: true, gameFinished: true });
    }
    let nextRow = await env2.DB.prepare(
      "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
    ).bind(roomId, nextIdx).first();
    if (!nextRow) {
      console.warn("[FORCE NEXT] Missing next puzzle row; generating on-demand", {
        roomId,
        puzzleIndex: nextIdx,
        lang: room.language,
        difficulty: room.difficulty
      });
      try {
        const generated = normalizeQuizPuzzle(
          await generatePuzzleWithRetry(env2, room.language || "ar", room.difficulty || 1)
        );
        if (generated) {
          const shuffled = shufflePuzzleOptions(generated, { enabled: true });
          const qh = computeQuestionHash(shuffled);
          await env2.DB.prepare(
            "INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)"
          ).bind(roomId, nextIdx, JSON.stringify(shuffled)).run();
          await ensureRoomPuzzleHistoryTable(env2);
          await env2.DB.prepare(
            "INSERT INTO room_puzzle_history (room_id, puzzle_id, question_hash) VALUES (?, ?, ?)"
          ).bind(roomId, shuffled.puzzleId ?? null, qh).run();
          nextRow = { puzzle_json: JSON.stringify(shuffled) };
        }
      } catch (e) {
        console.error("[FORCE NEXT] Failed to generate next puzzle", String(e?.message || e));
      }
    }
    if (!nextRow?.puzzle_json) return errorResponse("Next puzzle not found", 404);
    await env2.DB.prepare("UPDATE rooms SET current_puzzle_index = ? WHERE id = ?").bind(nextIdx, roomId).run();
    await env2.DB.prepare("UPDATE room_participants SET current_puzzle_index = ? WHERE room_id = ?").bind(nextIdx, roomId).run();
    let nextPuzzle = parseAndNormalizeQuizJson(nextRow.puzzle_json);
    if (!nextPuzzle) {
      console.warn("[REPAIR PUZZLE] Invalid next puzzle; regenerating", {
        roomId,
        puzzleIndex: nextIdx
      });
      try {
        const repaired = normalizeQuizPuzzle(
          await generatePuzzleWithRetry(env2, room.language || "ar", room.difficulty || 1)
        );
        if (!repaired) return errorResponse("Next puzzle invalid", 500);
        await env2.DB.prepare("UPDATE room_puzzles SET puzzle_json = ? WHERE room_id = ? AND puzzle_index = ?").bind(JSON.stringify(repaired), roomId, nextIdx).run();
        nextPuzzle = repaired;
      } catch (e) {
        return errorResponse("Next puzzle invalid", 500);
      }
    }
    const publicNextPuzzle = toPublicPuzzle(nextPuzzle);
    const doId = env2.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env2.ROOM_DO.get(doId);
    await roomObject.fetch(new Request("http://room/next-puzzle", {
      method: "POST",
      body: JSON.stringify({
        type: "next_puzzle",
        puzzle: publicNextPuzzle,
        puzzleIndex: nextIdx,
        roomId,
        timePerPuzzle: room.time_per_puzzle || 60
      })
    }));
    return jsonResponse({ success: true, nextPuzzle: publicNextPuzzle });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
__name(forceNextPuzzle, "forceNextPuzzle");

// src/settings.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function getRoomSettings(request, env2) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  if (!roomId) {
    return errorResponse("Missing roomId parameter", 400);
  }
  try {
    const room = await env2.DB.prepare("SELECT id, created_by FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) {
      return errorResponse("Room not found", 404);
    }
    const settings = await env2.DB.prepare(`
      SELECT * FROM room_settings WHERE room_id = ?
    `).bind(roomId).first();
    if (!settings) {
      return jsonResponse({
        hints_enabled: true,
        hints_per_player: 3,
        hint_penalty_percent: 10,
        allow_report_bad_puzzle: true,
        auto_advance_seconds: 2,
        shuffle_options: true,
        show_rankings_live: true,
        allow_skip_puzzle: false,
        min_time_per_puzzle: 5
      });
    }
    return jsonResponse(settings);
  } catch (e) {
    console.error("[GET ROOM SETTINGS ERROR]", e);
    return errorResponse("Failed to get room settings", 500);
  }
}
__name(getRoomSettings, "getRoomSettings");
async function updateRoomSettings(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const {
    roomId,
    hints_enabled,
    hints_per_player,
    hint_penalty_percent,
    allow_report_bad_puzzle,
    auto_advance_seconds,
    shuffle_options,
    show_rankings_live,
    allow_skip_puzzle,
    min_time_per_puzzle
  } = body;
  if (!roomId) {
    return errorResponse("Missing roomId", 400);
  }
  try {
    const room = await env2.DB.prepare("SELECT created_by, status FROM rooms WHERE id = ?").bind(roomId).first();
    if (!room) {
      return errorResponse("Room not found", 404);
    }
    if (room.created_by !== user.id) {
      return errorResponse("Only room creator can modify settings", 403);
    }
    if (room.status !== "waiting") {
      return errorResponse("Cannot modify settings after game starts", 400);
    }
    const existing = await env2.DB.prepare(
      "SELECT id FROM room_settings WHERE room_id = ?"
    ).bind(roomId).first();
    const updateFields = [];
    const values = [];
    if (hints_enabled !== void 0) {
      updateFields.push("hints_enabled = ?");
      values.push(hints_enabled ? 1 : 0);
    }
    if (hints_per_player !== void 0) {
      const hintCount = Math.max(0, Math.min(5, Number(hints_per_player)));
      updateFields.push("hints_per_player = ?");
      values.push(hintCount);
    }
    if (hint_penalty_percent !== void 0) {
      const penalty = Math.max(0, Math.min(100, Number(hint_penalty_percent)));
      updateFields.push("hint_penalty_percent = ?");
      values.push(penalty);
    }
    if (allow_report_bad_puzzle !== void 0) {
      updateFields.push("allow_report_bad_puzzle = ?");
      values.push(allow_report_bad_puzzle ? 1 : 0);
    }
    if (auto_advance_seconds !== void 0) {
      const delay = Math.max(0, Math.min(10, Number(auto_advance_seconds)));
      updateFields.push("auto_advance_seconds = ?");
      values.push(delay);
    }
    if (shuffle_options !== void 0) {
      updateFields.push("shuffle_options = ?");
      values.push(shuffle_options ? 1 : 0);
    }
    if (show_rankings_live !== void 0) {
      updateFields.push("show_rankings_live = ?");
      values.push(show_rankings_live ? 1 : 0);
    }
    if (allow_skip_puzzle !== void 0) {
      updateFields.push("allow_skip_puzzle = ?");
      values.push(allow_skip_puzzle ? 1 : 0);
    }
    if (min_time_per_puzzle !== void 0) {
      const minTime = Math.max(1, Math.min(60, Number(min_time_per_puzzle)));
      updateFields.push("min_time_per_puzzle = ?");
      values.push(minTime);
    }
    if (updateFields.length === 0) {
      return errorResponse("No settings to update", 400);
    }
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(roomId);
    if (existing) {
      await env2.DB.prepare(`
        UPDATE room_settings 
        SET ${updateFields.join(", ")}
        WHERE room_id = ?
      `).bind(...values).run();
    } else {
      await env2.DB.prepare(`
        INSERT INTO room_settings (
          room_id, hints_enabled, hints_per_player, hint_penalty_percent,
          allow_report_bad_puzzle, auto_advance_seconds, shuffle_options,
          show_rankings_live, allow_skip_puzzle, min_time_per_puzzle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        roomId,
        hints_enabled ?? true,
        hints_per_player ?? 3,
        hint_penalty_percent ?? 10,
        allow_report_bad_puzzle ?? true,
        auto_advance_seconds ?? 2,
        shuffle_options ?? true,
        show_rankings_live ?? true,
        allow_skip_puzzle ?? false,
        min_time_per_puzzle ?? 5
      ).run();
    }
    return jsonResponse({ success: true, message: "Settings updated" });
  } catch (e) {
    console.error("[UPDATE ROOM SETTINGS ERROR]", e);
    return errorResponse("Failed to update room settings", 500);
  }
}
__name(updateRoomSettings, "updateRoomSettings");
async function getHint(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const { roomId, puzzleIndex } = body;
  if (!roomId || puzzleIndex === void 0) {
    return errorResponse("Missing roomId or puzzleIndex", 400);
  }
  try {
    const settings = await env2.DB.prepare(
      "SELECT hints_enabled, hints_per_player FROM room_settings WHERE room_id = ?"
    ).bind(roomId).first();
    if (!settings || !settings.hints_enabled) {
      return errorResponse("Hints are not enabled in this room", 400);
    }
    const participant = await env2.DB.prepare(
      "SELECT hints_used, hints_available FROM room_participants WHERE room_id = ? AND user_id = ?"
    ).bind(roomId, user.id).first();
    if (!participant) {
      return errorResponse("You are not in this room", 403);
    }
    if (participant.hints_available <= 0) {
      return errorResponse("No hints available", 400);
    }
    const puzzle = await env2.DB.prepare(
      "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
    ).bind(roomId, puzzleIndex).first();
    if (!puzzle) {
      return errorResponse("Puzzle not found", 404);
    }
    const puzzleData = JSON.parse(puzzle.puzzle_json);
    const hint = puzzleData.hint || "No hint available";
    await env2.DB.prepare(
      "UPDATE room_participants SET hints_used = hints_used + 1, hints_available = hints_available - 1 WHERE room_id = ? AND user_id = ?"
    ).bind(roomId, user.id).run();
    const doId = env2.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env2.ROOM_DO.get(doId);
    await roomObject.fetch(new Request("http://room/hint-event", {
      method: "POST",
      body: JSON.stringify({
        type: "hint_used",
        userId: user.id,
        puzzleIndex,
        username: user.username
      })
    })).catch(() => {
    });
    return jsonResponse({
      hint,
      hintsRemaining: participant.hints_available - 1
    });
  } catch (e) {
    console.error("[GET HINT ERROR]", e);
    return errorResponse("Failed to get hint", 500);
  }
}
__name(getHint, "getHint");
async function reportBadPuzzle(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const body = await request.json();
  const { roomId, puzzleIndex, reportType, details } = body;
  if (!roomId || puzzleIndex === void 0 || !reportType) {
    return errorResponse("Missing required fields", 400);
  }
  const validReportTypes = [
    "bad_wording",
    "wrong_answer",
    "unclear",
    "offensive",
    "duplicate",
    "other"
  ];
  if (!validReportTypes.includes(reportType)) {
    return errorResponse("Invalid report type", 400);
  }
  try {
    const participant = await env2.DB.prepare(
      "SELECT id FROM room_participants WHERE room_id = ? AND user_id = ?"
    ).bind(roomId, user.id).first();
    if (!participant) {
      return errorResponse("You are not in this room", 403);
    }
    const settings = await env2.DB.prepare(
      "SELECT allow_report_bad_puzzle FROM room_settings WHERE room_id = ?"
    ).bind(roomId).first();
    if (settings && !settings.allow_report_bad_puzzle) {
      return errorResponse("Reporting is disabled in this room", 400);
    }
    const puzzle = await env2.DB.prepare(
      "SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?"
    ).bind(roomId, puzzleIndex).first();
    const puzzleJson = puzzle?.puzzle_json || null;
    await env2.DB.prepare(`
      INSERT INTO puzzle_reports (
        room_id, puzzle_index, puzzle_json, user_id, report_type, details
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(roomId, puzzleIndex, puzzleJson, user.id, reportType, details || null).run();
    return jsonResponse({
      success: true,
      message: "Report submitted successfully"
    });
  } catch (e) {
    console.error("[REPORT BAD PUZZLE ERROR]", e);
    return errorResponse("Failed to submit report", 500);
  }
}
__name(reportBadPuzzle, "reportBadPuzzle");
async function getPuzzleReports(request, env2) {
  const user = await getUserFromRequest2(request, env2);
  if (!user) return errorResponse("Unauthorized", 401);
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId");
  if (!roomId) {
    return errorResponse("Missing roomId", 400);
  }
  try {
    const room = await env2.DB.prepare(
      "SELECT created_by FROM rooms WHERE id = ?"
    ).bind(roomId).first();
    if (!room) {
      return errorResponse("Room not found", 404);
    }
    if (room.created_by !== user.id) {
      return errorResponse("Only room creator can view reports", 403);
    }
    const reports = await env2.DB.prepare(`
      SELECT 
        r.id, r.puzzle_index, r.report_type, r.details, r.reported_at,
        u.username
      FROM puzzle_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.room_id = ?
      ORDER BY r.reported_at DESC
    `).bind(roomId).all();
    return jsonResponse({
      total: reports.results?.length || 0,
      reports: reports.results || []
    });
  } catch (e) {
    console.error("[GET PUZZLE REPORTS ERROR]", e);
    return errorResponse("Failed to get reports", 500);
  }
}
__name(getPuzzleReports, "getPuzzleReports");

// src/manager_permissions.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function isManager(env2, roomId, userId) {
  const participant = await env2.DB.prepare(
    `SELECT role FROM room_participants WHERE room_id = ? AND user_id = ? AND is_kicked = FALSE`
  ).bind(roomId, userId).first();
  return participant && (participant.role === "manager" || participant.role === "co_manager");
}
__name(isManager, "isManager");
async function isMainManager(env2, roomId, userId) {
  const participant = await env2.DB.prepare(
    `SELECT role FROM room_participants WHERE room_id = ? AND user_id = ?`
  ).bind(roomId, userId).first();
  return participant && participant.role === "manager";
}
__name(isMainManager, "isMainManager");
async function logManagerAction(env2, roomId, managerUserId, actionType, targetUserId = null, details = null) {
  await env2.DB.prepare(
    `INSERT INTO manager_actions (room_id, manager_user_id, action_type, target_user_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  ).bind(
    roomId,
    managerUserId,
    actionType,
    targetUserId,
    details ? JSON.stringify(details) : null
  ).run();
}
__name(logManagerAction, "logManagerAction");
async function kickPlayer(request, env2) {
  try {
    const { roomId, userId, targetUserId } = await request.json();
    if (!roomId || !userId || !targetUserId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isMainManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only manager can kick players" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT manager_can_kick_players FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.manager_can_kick_players) {
      return new Response(JSON.stringify({ error: "Kicking players is disabled" }), { status: 403 });
    }
    if (userId === targetUserId) {
      return new Response(JSON.stringify({ error: "Cannot kick yourself" }), { status: 400 });
    }
    await env2.DB.prepare(
      `UPDATE room_participants SET is_kicked = TRUE WHERE room_id = ? AND user_id = ?`
    ).bind(roomId, targetUserId).run();
    await logManagerAction(env2, roomId, userId, "kick", targetUserId);
    return new Response(JSON.stringify({ success: true, message: "Player kicked" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[KICK PLAYER ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(kickPlayer, "kickPlayer");
async function freezePlayer(request, env2) {
  try {
    const { roomId, userId, targetUserId, freeze } = await request.json();
    if (!roomId || !userId || !targetUserId || freeze === void 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only manager can freeze players" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT manager_can_freeze_players FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.manager_can_freeze_players) {
      return new Response(JSON.stringify({ error: "Freezing players is disabled" }), { status: 403 });
    }
    await env2.DB.prepare(
      `UPDATE room_participants SET is_frozen = ? WHERE room_id = ? AND user_id = ?`
    ).bind(freeze ? 1 : 0, roomId, targetUserId).run();
    await logManagerAction(env2, roomId, userId, freeze ? "freeze" : "unfreeze", targetUserId);
    return new Response(JSON.stringify({
      success: true,
      message: freeze ? "Player frozen" : "Player unfrozen"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[FREEZE PLAYER ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(freezePlayer, "freezePlayer");
async function resetScores(request, env2) {
  try {
    const { roomId, userId } = await request.json();
    if (!roomId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isMainManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only manager can reset scores" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT manager_can_reset_scores FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.manager_can_reset_scores) {
      return new Response(JSON.stringify({ error: "Resetting scores is disabled" }), { status: 403 });
    }
    await env2.DB.prepare(
      `UPDATE room_participants SET score = 0, puzzles_solved = 0 WHERE room_id = ?`
    ).bind(roomId).run();
    await logManagerAction(env2, roomId, userId, "reset_scores");
    return new Response(JSON.stringify({ success: true, message: "All scores reset" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[RESET SCORES ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(resetScores, "resetScores");
async function skipPuzzle(request, env2) {
  try {
    const { roomId, userId } = await request.json();
    if (!roomId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only manager can skip puzzles" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT manager_can_skip_puzzle FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.manager_can_skip_puzzle) {
      return new Response(JSON.stringify({ error: "Skipping puzzles is disabled" }), { status: 403 });
    }
    const room = await env2.DB.prepare(
      `SELECT current_puzzle_index, puzzle_count FROM rooms WHERE id = ?`
    ).bind(roomId).first();
    if (!room) {
      return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
    }
    const nextIndex = room.current_puzzle_index + 1;
    if (nextIndex >= room.puzzle_count) {
      return new Response(JSON.stringify({ error: "No more puzzles to skip" }), { status: 400 });
    }
    await env2.DB.prepare(
      `UPDATE rooms SET current_puzzle_index = ? WHERE id = ?`
    ).bind(nextIndex, roomId).run();
    await logManagerAction(env2, roomId, userId, "skip_puzzle", null, {
      from_index: room.current_puzzle_index,
      to_index: nextIndex
    });
    return new Response(JSON.stringify({
      success: true,
      message: "Puzzle skipped",
      newIndex: nextIndex
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[SKIP PUZZLE ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(skipPuzzle, "skipPuzzle");
async function changeDifficulty(request, env2) {
  try {
    const { roomId, userId, newDifficulty } = await request.json();
    if (!roomId || !userId || !newDifficulty) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const difficulty = parseInt(newDifficulty);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 10) {
      return new Response(JSON.stringify({ error: "Difficulty must be between 1 and 10" }), { status: 400 });
    }
    const manager = await isManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only manager can change difficulty" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT manager_can_change_difficulty FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.manager_can_change_difficulty) {
      return new Response(JSON.stringify({ error: "Changing difficulty is disabled" }), { status: 403 });
    }
    await env2.DB.prepare(
      `UPDATE rooms SET difficulty = ? WHERE id = ?`
    ).bind(difficulty, roomId).run();
    await logManagerAction(env2, roomId, userId, "change_difficulty", null, {
      new_difficulty: difficulty
    });
    return new Response(JSON.stringify({
      success: true,
      message: "Difficulty updated",
      newDifficulty: difficulty
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[CHANGE DIFFICULTY ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(changeDifficulty, "changeDifficulty");
async function transferManager(request, env2) {
  try {
    const { roomId, userId, newManagerUserId } = await request.json();
    if (!roomId || !userId || !newManagerUserId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isMainManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only the main manager can transfer role" }), { status: 403 });
    }
    const targetParticipant = await env2.DB.prepare(
      `SELECT id FROM room_participants WHERE room_id = ? AND user_id = ? AND is_kicked = FALSE`
    ).bind(roomId, newManagerUserId).first();
    if (!targetParticipant) {
      return new Response(JSON.stringify({ error: "Target user not in room" }), { status: 404 });
    }
    await env2.DB.batch([
      env2.DB.prepare(
        `UPDATE room_participants SET role = 'co_manager' WHERE room_id = ? AND user_id = ?`
      ).bind(roomId, userId),
      env2.DB.prepare(
        `UPDATE room_participants SET role = 'manager' WHERE room_id = ? AND user_id = ?`
      ).bind(roomId, newManagerUserId),
      env2.DB.prepare(
        `UPDATE rooms SET created_by = ? WHERE id = ?`
      ).bind(newManagerUserId, roomId)
    ]);
    await logManagerAction(env2, roomId, userId, "transfer_manager", newManagerUserId);
    return new Response(JSON.stringify({
      success: true,
      message: "Manager role transferred"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[TRANSFER MANAGER ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(transferManager, "transferManager");
async function promoteToCoManager(request, env2) {
  try {
    const { roomId, userId, targetUserId } = await request.json();
    if (!roomId || !userId || !targetUserId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isMainManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only main manager can promote" }), { status: 403 });
    }
    const settings = await env2.DB.prepare(
      `SELECT allow_co_managers FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.allow_co_managers) {
      return new Response(JSON.stringify({ error: "Co-managers are disabled" }), { status: 403 });
    }
    await env2.DB.prepare(
      `UPDATE room_participants SET role = 'co_manager' WHERE room_id = ? AND user_id = ?`
    ).bind(roomId, targetUserId).run();
    await logManagerAction(env2, roomId, userId, "promote_co_manager", targetUserId);
    return new Response(JSON.stringify({
      success: true,
      message: "Player promoted to co-manager"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[PROMOTE CO-MANAGER ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(promoteToCoManager, "promoteToCoManager");
async function getManagerLogs(request, env2) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    const userId = url.searchParams.get("userId");
    if (!roomId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const manager = await isManager(env2, roomId, userId);
    if (!manager) {
      return new Response(JSON.stringify({ error: "Only managers can view logs" }), { status: 403 });
    }
    const logs = await env2.DB.prepare(
      `SELECT ma.*, 
              mu.username as manager_name,
              tu.username as target_name
       FROM manager_actions ma
       LEFT JOIN users mu ON ma.manager_user_id = mu.id
       LEFT JOIN users tu ON ma.target_user_id = tu.id
       WHERE ma.room_id = ?
       ORDER BY ma.created_at DESC
       LIMIT 50`
    ).bind(roomId).all();
    return new Response(JSON.stringify({
      success: true,
      logs: logs.results || []
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[GET MANAGER LOGS ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(getManagerLogs, "getManagerLogs");
async function getDetailedStats(request, env2) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    const userId = url.searchParams.get("userId");
    if (!roomId || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const settings = await env2.DB.prepare(
      `SELECT show_detailed_stats_to_all FROM room_settings WHERE room_id = ?`
    ).bind(roomId).first();
    if (settings && !settings.show_detailed_stats_to_all) {
      const manager = await isManager(env2, roomId, userId);
      if (!manager) {
        return new Response(JSON.stringify({ error: "Only managers can view detailed stats" }), { status: 403 });
      }
    }
    const participants = await env2.DB.prepare(
      `SELECT rp.*, u.username, u.email,
              COUNT(rr.id) as total_attempts,
              SUM(CASE WHEN rr.is_correct THEN 1 ELSE 0 END) as correct_answers,
              AVG(rr.time_taken) as avg_time
       FROM room_participants rp
       LEFT JOIN users u ON rp.user_id = u.id
       LEFT JOIN room_results rr ON rr.room_id = rp.room_id AND rr.user_id = rp.user_id
       WHERE rp.room_id = ? AND rp.is_kicked = FALSE
       GROUP BY rp.id, u.username, u.email
       ORDER BY rp.score DESC`
    ).bind(roomId).all();
    return new Response(JSON.stringify({
      success: true,
      stats: participants.results || []
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("[GET DETAILED STATS ERROR]", e);
    return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
  }
}
__name(getDetailedStats, "getDetailedStats");

// src/room_do.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function toPublicPuzzle2(puzzle) {
  if (!puzzle || typeof puzzle !== "object") return puzzle;
  const copy = Array.isArray(puzzle) ? puzzle.slice() : { ...puzzle };
  delete copy.correctIndex;
  return copy;
}
__name(toPublicPuzzle2, "toPublicPuzzle");
var GroupRoom = class {
  static {
    __name(this, "GroupRoom");
  }
  constructor(state, env2) {
    this.state = state;
    this.env = env2;
    this.sessions = [];
    this.roomData = null;
    this.messages = [];
    this.hostId = null;
    this.lastEvent = null;
    this.gameState = {
      isStarted: false,
      currentPuzzleIndex: 0,
      readyUsers: {},
      // userId -> boolean
      puzzleEndsAt: null,
      totalPuzzles: 0
    };
    this.roomId = null;
    this.timePerPuzzle = 60;
    this.state.blockConcurrencyWhile(async () => {
      let storedHost = await this.state.storage.get("hostId");
      if (storedHost) this.hostId = storedHost;
      let storedState = await this.state.storage.get("gameState");
      if (storedState) this.gameState = storedState;
      let storedMessages = await this.state.storage.get("messages");
      if (storedMessages) this.messages = storedMessages;
      let storedLastEvent = await this.state.storage.get("lastEvent");
      if (storedLastEvent) this.lastEvent = storedLastEvent;
    });
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.includes("/events")) {
      const payload = this.lastEvent || { type: "noop" };
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname.includes("/chat-event")) {
      const data = await request.json();
      const chatMsg = data?.message;
      if (chatMsg) {
        this.messages.push(chatMsg);
        if (this.messages.length > 100) this.messages.shift();
        await this.state.storage.put("messages", this.messages);
        this.broadcast({ type: "chat", message: chatMsg });
      }
      return new Response("OK");
    }
    if (url.pathname.includes("/delete-event")) {
      const data = await request.json();
      this.broadcast({ type: "room_deleted" });
      await this.state.storage.deleteAll();
      this.sessions.forEach((s) => {
        try {
          s.ws.close(1001, "Deleted");
        } catch (e) {
        }
      });
      this.sessions = [];
      return new Response("OK");
    }
    if (url.pathname.includes("/reopen")) {
      this.gameState = {
        ...this.gameState,
        status: "waiting",
        isStarted: false,
        currentPuzzleIndex: 0,
        totalPuzzles: 0,
        currentPuzzle: null,
        solvedBy: null,
        puzzleEndsAt: null,
        readyUsers: {}
      };
      this.lastEvent = { type: "room_reopened" };
      await this.state.storage.put("gameState", this.gameState);
      await this.state.storage.put("lastEvent", this.lastEvent);
      this.broadcast({ type: "room_reopened", gameState: this.gameState });
      return new Response("OK");
    }
    if (url.pathname.includes("/start-game-event")) {
      const data = await request.json();
      this.roomId = data.roomId ?? this.roomId;
      this.timePerPuzzle = data.timePerPuzzle ?? this.timePerPuzzle;
      this.gameState.status = "active";
      this.gameState.currentPuzzleIndex = data.puzzleIndex || 0;
      this.gameState.totalPuzzles = data.totalPuzzles || 5;
      this.gameState.currentPuzzle = toPublicPuzzle2(data.puzzle);
      this.gameState.solvedBy = null;
      this.gameState.timePerPuzzle = this.timePerPuzzle;
      this.gameState.puzzleEndsAt = Date.now() + this.timePerPuzzle * 1e3;
      await this.state.storage.put("gameState", this.gameState);
      await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));
      this.broadcast({
        type: "game_started",
        gameState: this.gameState,
        puzzle: toPublicPuzzle2(data.puzzle),
        puzzleIndex: data.puzzleIndex,
        totalPuzzles: data.totalPuzzles
      });
      this.broadcast({
        type: "timer_started",
        endsAt: this.gameState.puzzleEndsAt,
        durationSec: this.timePerPuzzle
      });
      return new Response("OK");
    }
    if (url.pathname.includes("/puzzle-solved")) {
      const data = await request.json();
      this.gameState.solvedBy = data.userId;
      await this.state.storage.put("gameState", this.gameState);
      this.broadcast({
        type: "puzzle_solved_first",
        userId: data.userId,
        username: data.username,
        puzzleIndex: data.puzzleIndex,
        timeTaken: data.timeTaken
      });
      return new Response("OK");
    }
    if (url.pathname.includes("/next-puzzle")) {
      const data = await request.json();
      this.roomId = data.roomId ?? this.roomId;
      this.timePerPuzzle = data.timePerPuzzle ?? this.timePerPuzzle;
      this.gameState.currentPuzzleIndex = data.puzzleIndex;
      this.gameState.currentPuzzle = toPublicPuzzle2(data.puzzle);
      this.gameState.solvedBy = null;
      this.gameState.timePerPuzzle = this.timePerPuzzle;
      this.gameState.puzzleEndsAt = Date.now() + this.timePerPuzzle * 1e3;
      await this.state.storage.put("gameState", this.gameState);
      await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));
      this.broadcast({
        type: "new_puzzle",
        puzzle: toPublicPuzzle2(data.puzzle),
        puzzleIndex: data.puzzleIndex,
        gameState: this.gameState
      });
      this.broadcast({
        type: "timer_started",
        endsAt: this.gameState.puzzleEndsAt,
        durationSec: this.timePerPuzzle
      });
      return new Response("OK");
    }
    if (url.pathname.includes("/finish-game")) {
      const data = await request.json();
      this.roomId = data.roomId ?? this.roomId;
      this.gameState.status = "finished";
      await this.state.storage.put("gameState", this.gameState);
      let leaderboard = [];
      if (this.roomId) {
        try {
          const rows = await this.env.DB.prepare(
            `SELECT rp.user_id, u.username, rp.score, rp.puzzles_solved
             FROM room_participants rp JOIN users u ON rp.user_id = u.id
             WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC`
          ).bind(this.roomId).all();
          leaderboard = rows.results;
        } catch (e) {
        }
      }
      this.broadcast({
        type: "game_finished",
        gameState: this.gameState,
        leaderboard
      });
      return new Response("OK");
    }
    if (url.pathname.includes("/ws")) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }
      const qsRoomId = url.searchParams.get("roomId");
      if (qsRoomId) {
        this.roomId = qsRoomId;
      }
      if ((!this.hostId || String(this.hostId).length === 0) && this.roomId) {
        try {
          const row = await this.env.DB.prepare("SELECT created_by FROM rooms WHERE id = ?").bind(this.roomId).first();
          if (row?.created_by !== null && row?.created_by !== void 0) {
            this.hostId = String(row.created_by);
            await this.state.storage.put("hostId", this.hostId);
          }
        } catch (e) {
        }
      }
      const userId = request.headers.get("X-User-Id");
      const username = request.headers.get("X-User-Name");
      if (!userId || !username) {
        return new Response("Missing Identity Headers", { status: 400 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      await this.handleSession(server, userId, username);
      const responseHeaders = new Headers();
      const protocol = request.headers.get("Sec-WebSocket-Protocol");
      if (protocol) {
        const parts = protocol.split(",").map((p) => p.trim());
        if (parts.length > 0) {
          responseHeaders.set("Sec-WebSocket-Protocol", parts[0]);
        }
      }
      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: responseHeaders
      });
    }
    return new Response("Not Found", { status: 404 });
  }
  // Durable Object alarm handler to auto-advance when timer expires
  async alarm() {
    try {
      if (!this.roomId || this.gameState.status !== "active") return;
      const now = Date.now();
      const endsAt = this.gameState.puzzleEndsAt ?? now;
      if (now < endsAt) {
        await this.state.storage.setAlarm(new Date(endsAt));
        return;
      }
      const room = await this.env.DB.prepare("SELECT id, current_puzzle_index, puzzle_count, status FROM rooms WHERE id = ?").bind(this.roomId).first();
      if (!room || room.status !== "active") return;
      const current = room.current_puzzle_index ?? 0;
      const total = room.puzzle_count ?? (this.gameState.totalPuzzles || 0);
      if (current < total - 1) {
        const nextIndex = current + 1;
        const nextRow = await this.env.DB.prepare("SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?").bind(this.roomId, nextIndex).first();
        if (!nextRow) return;
        const nextPuzzle = JSON.parse(nextRow.puzzle_json);
        await this.env.DB.prepare("UPDATE rooms SET current_puzzle_index = ? WHERE id = ?").bind(nextIndex, this.roomId).run();
        this.gameState.currentPuzzleIndex = nextIndex;
        this.gameState.currentPuzzle = toPublicPuzzle2(nextPuzzle);
        this.gameState.solvedBy = null;
        this.gameState.timePerPuzzle = this.timePerPuzzle;
        this.gameState.puzzleEndsAt = Date.now() + this.timePerPuzzle * 1e3;
        await this.state.storage.put("gameState", this.gameState);
        await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));
        this.broadcast({ type: "new_puzzle", puzzle: toPublicPuzzle2(nextPuzzle), puzzleIndex: nextIndex, gameState: this.gameState });
        this.broadcast({ type: "timer_started", endsAt: this.gameState.puzzleEndsAt, durationSec: this.timePerPuzzle });
      } else {
        await this.env.DB.prepare("UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").bind("finished", this.roomId).run();
        this.gameState.status = "finished";
        await this.state.storage.put("gameState", this.gameState);
        let leaderboard = [];
        try {
          const rows = await this.env.DB.prepare(
            `SELECT rp.user_id, u.username, rp.score, rp.puzzles_solved
             FROM room_participants rp JOIN users u ON rp.user_id = u.id
             WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC`
          ).bind(this.roomId).all();
          leaderboard = rows.results;
        } catch (e) {
        }
        this.broadcast({ type: "game_finished", gameState: this.gameState, leaderboard });
      }
    } catch (e) {
    }
  }
  async handleSession(ws, userId, username) {
    console.log(`User ${username} (${userId}) attempting to connect`);
    ws.accept();
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
    userId = userId.toString();
    if (!this.hostId) {
      this.hostId = userId;
      await this.state.storage.put("hostId", this.hostId);
      console.log(`Host assigned (fallback): ${userId}`);
    }
    const session = { ws, userId, username };
    this.sessions.push(session);
    const getParticipants = /* @__PURE__ */ __name(() => {
      return this.sessions.map((s) => ({
        userId: s.userId,
        username: s.username,
        isReady: !!this.gameState.readyUsers[s.userId]
      }));
    }, "getParticipants");
    this.getParticipants = getParticipants;
    ws.send(JSON.stringify({
      type: "init",
      messages: this.messages.slice(-50),
      gameState: this.gameState,
      hostId: this.hostId,
      participants: getParticipants()
    }));
    this.broadcast({
      type: "user_joined",
      userId,
      username,
      hostId: this.hostId,
      participants: getParticipants()
    });
    ws.onmessage = async (msg) => {
      try {
        console.log(`Received message from ${userId}: ${msg.data}`);
        const data = JSON.parse(msg.data);
        await this.handleMessage(session, data);
      } catch (err) {
        console.error(`Error handling message: ${err.message}`);
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      }
    };
    ws.onclose = () => {
      console.log(`Connection closed for user ${userId}`);
      this.sessions = this.sessions.filter((s) => s !== session);
      this.broadcast({
        type: "user_left",
        userId,
        username,
        hostId: this.hostId,
        participants: getParticipants()
      });
    };
  }
  async handleMessage(session, data) {
    const userId = session.userId;
    const username = session.username;
    switch (data.type) {
      case "chat":
        const chatMsg = {
          id: crypto.randomUUID(),
          userId,
          username,
          text: data.text,
          timestamp: Date.now()
        };
        this.messages.push(chatMsg);
        if (this.messages.length > 100) this.messages.shift();
        await this.state.storage.put("messages", this.messages);
        this.broadcast({ type: "chat", message: chatMsg });
        break;
      case "toggle_ready":
        this.gameState.readyUsers[userId] = !!data.isReady;
        await this.state.storage.put("gameState", this.gameState);
        this.broadcast({
          type: "ready_status",
          userId,
          isReady: this.gameState.readyUsers[userId],
          participants: this.getParticipants()
        });
        break;
      case "kick_user":
        if (session.userId !== this.hostId) {
          throw new Error("Only host can kick users");
        }
        const targetSession = this.sessions.find((s) => s.userId === data.targetUserId);
        if (targetSession) {
          targetSession.ws.send(JSON.stringify({ type: "kicked" }));
          targetSession.ws.close(1e3, "Kicked by host");
        }
        break;
      case "start_game":
        if (session.userId !== this.hostId) {
          throw new Error("Only host can manually start game");
        }
        await this.startGame();
        break;
      case "solve_puzzle":
        if (this.gameState.solvedBy === null) {
          this.gameState.solvedBy = session.userId;
          this.broadcast({
            type: "puzzle_solved_first",
            userId: session.userId,
            username: session.username,
            puzzleIndex: data.puzzleIndex
          });
        }
        break;
      case "next_puzzle":
        this.gameState.currentPuzzleIndex = data.puzzleIndex;
        this.gameState.currentPuzzle = toPublicPuzzle2(data.puzzle);
        this.gameState.solvedBy = null;
        await this.state.storage.put("gameState", this.gameState);
        this.broadcast({
          type: "new_puzzle",
          puzzle: toPublicPuzzle2(data.puzzle),
          puzzleIndex: data.puzzleIndex,
          gameState: this.gameState
        });
        break;
      case "finish_game":
        this.gameState.status = "finished";
        this.broadcast({ type: "game_finished", gameState: this.gameState });
        break;
    }
  }
  async startGame() {
    this.gameState.status = "active";
    this.gameState.currentPuzzleIndex = 0;
    this.gameState.solvedBy = null;
    this.broadcast({ type: "game_started", gameState: this.gameState });
  }
  broadcast(message) {
    const data = JSON.stringify(message);
    this.lastEvent = message;
    this.state.storage.put("lastEvent", message);
    this.sessions.forEach((s) => {
      try {
        s.ws.send(data);
      } catch (e) {
      }
    });
  }
};

// src/index.js
var src_default = {
  async fetch(request, env2, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const shouldAuth = requiresAuth(path, request.method);
      const authContext = shouldAuth ? await requireAuth(request, env2) : null;
      if (shouldAuth && authContext?.response) return authContext.response;
      if (path === "/auth/register" && request.method === "POST") {
        return await register(request, env2);
      }
      if (path === "/auth/login" && request.method === "POST") {
        return await login(request, env2);
      }
      if (path === "/auth/reset" && request.method === "POST") {
        return await resetPassword(request, env2);
      }
      if (path === "/auth/me") {
        const user = authContext?.user;
        if (!user) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
        if (request.method === "GET") {
          return new Response(JSON.stringify(user), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }
        if (request.method === "PUT") {
          return await updateProfile(request, env2, user.id);
        }
        if (request.method === "DELETE") {
          return await deleteAccount(request, env2, user.id);
        }
      }
      if (path === "/progress") {
        const { user, response } = await requireAuth(request, env2);
        if (!user) return response;
        if (request.method === "GET") {
          return await getProgress(request, env2);
        }
        if (request.method === "POST") {
          return await saveProgress(request, env2);
        }
      }
      if ((path === "/generate-level" || path === "/api/generate") && request.method === "POST") {
        return await generateLevel(request, env2, CORS_HEADERS);
      }
      if (path === "/api/generate-path" && request.method === "POST") {
        return await generatePathLevel(request, env2, CORS_HEADERS);
      }
      if ((path === "/submit-solution" || path === "/api/submit") && request.method === "POST") {
        return await submitSolution(request, env2, CORS_HEADERS);
      }
      if (path === "/api/generate-from-image" && request.method === "POST") {
        return await generatePuzzleFromImage(request, env2);
      }
      if ((path === "/api/generate-spot-diff" || path === "/generate-spot-diff") && request.method === "POST") {
        return await generateSpotDiffPuzzle(request, env2);
      }
      if ((path === "/api/list-gemini-models" || path === "/list-gemini-models") && request.method === "GET") {
        const apiKey = env2?.GEMINI_API_KEY;
        if (!apiKey) {
          return errorResponse("GEMINI_API_KEY not configured", 500);
        }
        const url2 = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url2);
        const data = await response.json();
        const textModels = data.models?.filter(
          (m) => m.supportedGenerationMethods?.includes("generateContent")
        ).map((m) => ({
          name: m.name,
          displayName: m.displayName,
          description: m.description
        })) || [];
        return new Response(JSON.stringify({
          models: textModels,
          count: textModels.length
        }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      if ((path === "/api/test-gemini-text" || path === "/test-gemini-text") && request.method === "GET") {
        const apiKey = env2?.GEMINI_API_KEY;
        if (!apiKey) {
          return errorResponse("GEMINI_API_KEY not configured", 500);
        }
        const model = "gemini-2.0-flash";
        const url2 = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const testResponse = await fetch(url2, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say hello in Arabic" }] }]
          })
        });
        const responseText = await testResponse.text();
        return new Response(JSON.stringify({
          model,
          status: testResponse.status,
          ok: testResponse.ok,
          body: responseText
        }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
      if (path.startsWith("/admin/puzzles")) {
        if (request.method === "GET") return await listPuzzles(request, env2);
        if (request.method === "DELETE") return await deletePuzzle(request, env2);
      }
      if (path === "/admin/puzzles/cleanup" && request.method === "POST") {
        return await cleanupPuzzlesEndpoint(request, env2);
      }
      if (path === "/admin/puzzles/regenerate" && request.method === "POST") {
        return await regeneratePuzzle(request, env2, CORS_HEADERS);
      }
      if (path === "/admin/puzzles/generate-bulk" && request.method === "POST") {
        return await generateBulkPuzzles(request, env2, CORS_HEADERS);
      }
      if (path === "/tournament/daily" && request.method === "GET") {
        return await getDailyChallenge(request, env2);
      }
      if (path === "/tournament/daily/submit" && request.method === "POST") {
        return await submitDailyScore(request, env2);
      }
      if (path === "/tournament/daily/leaderboard" && request.method === "GET") {
        return await getDailyLeaderboard(request, env2);
      }
      if (path === "/tournament/weekly" && request.method === "GET") {
        return await getWeeklyStandings(request, env2);
      }
      if (path === "/competitions" || path === "/api/competitions/active") {
        if (request.method === "GET") {
          return await getActiveCompetitions(request, env2);
        }
        if (request.method === "POST") {
          return await createCompetition(request, env2);
        }
      }
      if (path === "/competitions/join" || path === "/api/competitions/join") {
        if (request.method === "POST") {
          return await joinCompetition(request, env2);
        }
      }
      if (path === "/rooms" && request.method === "POST") {
        return await createRoom(request, env2);
      }
      if (path === "/rooms/join" && request.method === "POST") {
        return await joinRoom(request, env2);
      }
      if (url.pathname === "/api/rooms/my" && request.method === "GET") {
        return getMyRooms(request, env2);
      }
      if ((path === "/rooms/status" || url.pathname === "/api/rooms/status") && request.method === "GET") {
        return await getRoomStatus(request, env2);
      }
      if (url.pathname.startsWith("/rooms/") && url.pathname.endsWith("/events") && request.method === "GET") {
        const parts = url.pathname.split("/").filter(Boolean);
        const roomId = parts.length >= 3 ? parts[1] : null;
        if (!roomId) return errorResponse("roomId required", 400);
        const user = await getUserFromRequest(request, env2);
        if (!user) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
        const id = env2.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env2.ROOM_DO.get(id);
        return roomObject.fetch(new Request("http://room/events", { method: "GET" }));
      }
      if (url.pathname === "/api/rooms/leave" && request.method === "POST") {
        return await leaveRoom(request, env2);
      }
      if (url.pathname === "/api/rooms/kick" && request.method === "POST") {
        return await kickUser(request, env2);
      }
      if (url.pathname === "/api/rooms/delete" && request.method === "DELETE") {
        return await deleteRoom(request, env2);
      }
      if (path === "/rooms/ready" && request.method === "POST") {
        return await setReady(request, env2);
      }
      if (path === "/rooms/chat" && request.method === "POST") {
        return await sendRoomChat(request, env2);
      }
      if (path === "/rooms/answer" && request.method === "POST") {
        return await submitAnswer(request, env2, ctx);
      }
      if (path === "/rooms/leaderboard" && request.method === "GET") {
        return await getLeaderboard(request, env2);
      }
      if (path === "/rooms/start" && request.method === "POST") {
        return await manualStartGame(request, env2, ctx);
      }
      if (path === "/rooms/reopen" && request.method === "POST") {
        return await reopenRoom(request, env2);
      }
      if (path === "/rooms/next" && request.method === "POST") {
        return await forceNextPuzzle(request, env2);
      }
      if (path === "/rooms/settings" && request.method === "GET") {
        return await getRoomSettings(request, env2);
      }
      if (path === "/rooms/settings" && request.method === "POST") {
        return await updateRoomSettings(request, env2);
      }
      if (path === "/rooms/hint" && request.method === "POST") {
        return await getHint(request, env2);
      }
      if (path === "/rooms/report" && request.method === "POST") {
        return await reportBadPuzzle(request, env2);
      }
      if (path === "/rooms/reports" && request.method === "GET") {
        return await getPuzzleReports(request, env2);
      }
      if (path === "/manager/kick" && request.method === "POST") {
        return await kickPlayer(request, env2);
      }
      if (path === "/manager/freeze" && request.method === "POST") {
        return await freezePlayer(request, env2);
      }
      if (path === "/manager/reset-scores" && request.method === "POST") {
        return await resetScores(request, env2);
      }
      if (path === "/manager/skip-puzzle" && request.method === "POST") {
        return await skipPuzzle(request, env2);
      }
      if (path === "/manager/change-difficulty" && request.method === "POST") {
        return await changeDifficulty(request, env2);
      }
      if (path === "/manager/transfer" && request.method === "POST") {
        return await transferManager(request, env2);
      }
      if (path === "/manager/promote" && request.method === "POST") {
        return await promoteToCoManager(request, env2);
      }
      if (path === "/manager/logs" && request.method === "GET") {
        return await getManagerLogs(request, env2);
      }
      if (path === "/manager/detailed-stats" && request.method === "GET") {
        return await getDetailedStats(request, env2);
      }
      if (path === "/rooms/ws") {
        const roomId = url.searchParams.get("roomId");
        if (!roomId) return errorResponse("roomId required", 400);
        const user = await getUserFromRequest(request, env2);
        if (!user) return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
        const id = env2.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env2.ROOM_DO.get(id);
        const doHeaders = new Headers(request.headers);
        doHeaders.set("X-User-Id", user.id.toString());
        doHeaders.set("X-User-Name", user.username);
        const doRequest = new Request(request, {
          headers: doHeaders
        });
        return roomObject.fetch(doRequest);
      }
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    } catch (e) {
      console.error(e);
      return errorResponse(e.message, 500);
    }
  },
  async scheduled(event, env2, ctx) {
    try {
      const task = runPuzzleCleanup(env2, {
        maxPerGroup: Number(env2?.PUZZLE_RETENTION_PER_GROUP ?? 1200),
        maxAgeDays: Number(env2?.PUZZLE_RETENTION_DAYS ?? 45),
        recentProtect: Number(env2?.PUZZLE_RECENT_PROTECT ?? 250)
      });
      if (ctx?.waitUntil) {
        ctx.waitUntil(task);
      } else {
        await task;
      }
    } catch (e) {
      console.error("Scheduled puzzle cleanup failed:", e);
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0fLDPf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0fLDPf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  GroupRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

bcryptjs/dist/bcrypt.js:
  (**
   * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/bcrypt.js for details
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=index.js.map
