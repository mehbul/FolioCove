import "./chunk-QGM4M3NI.js";

// node_modules/pdfstudio/dist/runner.js
var QpdfRunner = class _QpdfRunner {
  compiled;
  createModule;
  constructor(compiled, createModule) {
    this.compiled = compiled;
    this.createModule = createModule;
  }
  static async create(options = {}) {
    const { default: createQpdfModule } = await import("./qpdf-CLIEQS7W.js");
    const compiled = options.wasmModule ?? await WebAssembly.compile(await loadWasmBytes(resolveWasmUrl(options.wasmUrl)));
    return new _QpdfRunner(compiled, createQpdfModule);
  }
  /**
   * Run one or more qpdf invocations against a fresh instance, with
   * `inputs` staged as numbered files in a MEMFS working directory.
   */
  async run(inputs, job) {
    const stagedInputs = await Promise.all(inputs.map(toBytes));
    const stdoutBytes = [];
    const stderrBytes = [];
    const moduleArg = {
      preRun: [
        () => {
          moduleArg.FS.init(null, (byte) => {
            if (byte !== null)
              stdoutBytes.push(byte);
          }, (byte) => {
            if (byte !== null)
              stderrBytes.push(byte);
          });
        }
      ],
      instantiateWasm: (imports, onSuccess) => {
        WebAssembly.instantiate(this.compiled, imports).then((instance) => onSuccess(instance, this.compiled));
        return {};
      }
    };
    const module = await withNodeDetectionDisabledInWorkers(() => this.createModule(moduleArg));
    const dir = "/job";
    module.FS.mkdir(dir);
    const inputPaths = stagedInputs.map((bytes, i) => {
      const path = `${dir}/in${i}.pdf`;
      module.FS.writeFile(path, bytes);
      return path;
    });
    const exec = (args) => {
      stdoutBytes.length = 0;
      stderrBytes.length = 0;
      let exitCode;
      try {
        exitCode = module.callMain(args);
      } catch (e) {
        if (isExitStatus(e)) {
          exitCode = e.status;
        } else {
          throw e;
        }
      }
      const stdout = new Uint8Array(stdoutBytes);
      return {
        exitCode: exitCode ?? 0,
        stdout,
        stdoutText: decoder.decode(stdout),
        stderr: decoder.decode(new Uint8Array(stderrBytes))
      };
    };
    return job({ dir, inputPaths, exec, fs: module.FS });
  }
};
var decoder = new TextDecoder();
var isCloudflareWorkers = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
async function withNodeDetectionDisabledInWorkers(fn) {
  const globals = globalThis;
  if (!isCloudflareWorkers || typeof globals.process === "undefined")
    return fn();
  const realProcess = globals.process;
  delete globals.process;
  try {
    return await fn();
  } finally {
    globals.process = realProcess;
  }
}
function resolveWasmUrl(wasmUrl) {
  if (wasmUrl === void 0)
    return new URL("./wasm/qpdf.wasm", import.meta.url);
  if (wasmUrl instanceof URL)
    return wasmUrl;
  const base = typeof location !== "undefined" && typeof location.href === "string" ? location.href : import.meta.url;
  return new URL(wasmUrl, base);
}
async function loadWasmBytes(url) {
  if (url.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    return new Uint8Array(await readFile(url));
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch qpdf.wasm from ${url}: HTTP ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
function isExitStatus(e) {
  return typeof e === "object" && e !== null && e.name === "ExitStatus" && typeof e.status === "number";
}
async function toBytes(input) {
  if (input instanceof Uint8Array)
    return input;
  if (input instanceof ArrayBuffer)
    return new Uint8Array(input);
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer());
  }
  throw new TypeError("Unsupported PDF input: expected Uint8Array, ArrayBuffer, or Blob");
}

// node_modules/pdfstudio/dist/errors.js
var PdfError = class extends Error {
  /** qpdf process exit code (2 = error). */
  exitCode;
  /** Raw qpdf stderr output. */
  stderr;
  constructor(message, exitCode, stderr) {
    super(message);
    this.name = "PdfError";
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
};
var PdfPasswordError = class extends PdfError {
  constructor(message, exitCode, stderr) {
    super(message, exitCode, stderr);
    this.name = "PdfPasswordError";
  }
};

// node_modules/pdfstudio/dist/index.js
var PdfToolkit = class _PdfToolkit {
  runner;
  constructor(runner) {
    this.runner = runner;
  }
  /** @internal — use {@link createPdfToolkit}. */
  static async create(options = {}) {
    return new _PdfToolkit(await QpdfRunner.create(options));
  }
  /**
   * Decrypt an encrypted PDF, producing a copy with no password and no
   * usage restrictions.
   */
  unlock(pdf, options) {
    return this.transform(pdf, [passwordArg(options.password), "--decrypt"]);
  }
  /**
   * Alias of {@link unlock}: removes the password and all restrictions.
   */
  removePassword(pdf, options) {
    return this.unlock(pdf, options);
  }
  /**
   * Encrypt a PDF with a password (AES-256 by default) and optional
   * usage restrictions.
   */
  lock(pdf, options) {
    return this.transform(pdf, encryptArgs(options));
  }
  /**
   * Change the password of an encrypted PDF (decrypts with the current
   * password and re-encrypts with the new one in a single pass).
   */
  changePassword(pdf, options) {
    const lockOptions = {
      userPassword: options.newPassword,
      ownerPassword: options.newOwnerPassword ?? options.newPassword,
      ...options.keyLength !== void 0 && { keyLength: options.keyLength },
      ...options.permissions !== void 0 && { permissions: options.permissions }
    };
    return this.transform(pdf, [
      passwordArg(options.currentPassword),
      ...encryptArgs(lockOptions)
    ]);
  }
  /**
   * Merge multiple PDFs (or page selections from them) into one document,
   * in the order given.
   */
  async merge(sources) {
    if (sources.length === 0) {
      throw new TypeError("merge() needs at least one source document");
    }
    const normalized = sources.map(normalizeSource);
    return this.runner.run(normalized.map((s) => s.data), ({ dir, inputPaths, exec, fs }) => {
      const args = ["--empty", "--pages"];
      normalized.forEach((source, i) => {
        args.push(inputPaths[i]);
        if (source.password !== void 0)
          args.push(`--password=${source.password}`);
        args.push(source.pages !== void 0 ? pagesArg(source.pages) : "1-z");
      });
      const out = `${dir}/out.pdf`;
      args.push("--", out);
      assertOk(exec(args));
      return fs.readFile(out);
    });
  }
  /**
   * Split a PDF into multiple documents of `pagesPerFile` pages each
   * (default 1 — one document per page). Returns the parts in order.
   */
  async split(pdf, options = {}) {
    const per = options.pagesPerFile ?? 1;
    if (!Number.isInteger(per) || per < 1) {
      throw new TypeError(`pagesPerFile must be a positive integer, got ${per}`);
    }
    return this.runner.run([pdf], ({ dir, inputPaths, exec, fs }) => {
      const args = [];
      if (options.password !== void 0)
        args.push(passwordArg(options.password));
      args.push(`--split-pages=${per}`, inputPaths[0], `${dir}/part-%d.pdf`);
      assertOk(exec(args));
      const parts = fs.readdir(dir).filter((name) => name.startsWith("part-")).sort((a, b) => partNumber(a) - partNumber(b));
      return parts.map((name) => fs.readFile(`${dir}/${name}`));
    });
  }
  /**
   * Extract a page selection into a new document.
   */
  extractPages(pdf, options) {
    const args = [];
    if (options.password !== void 0)
      args.push(passwordArg(options.password));
    args.push("--pages", ".", pagesArg(options.pages), "--");
    return this.transform(pdf, args);
  }
  /**
   * Rotate pages. Relative to the current rotation by default; pass
   * `absolute: true` to set the exact rotation instead.
   */
  async rotate(pdf, options) {
    const { angle, absolute = false, pages, password } = options;
    if (absolute && angle < 0) {
      throw new TypeError("absolute rotation must use a non-negative angle (90, 180, or 270)");
    }
    const prefix = absolute ? "" : angle < 0 ? "-" : "+";
    const spec = `${prefix}${Math.abs(angle)}${pages !== void 0 ? `:${pagesArg(pages)}` : ""}`;
    const args = [];
    if (password !== void 0)
      args.push(passwordArg(password));
    args.push(`--rotate=${spec}`);
    return this.transform(pdf, args);
  }
  /** Number of pages in the document. */
  async pageCount(pdf, options = {}) {
    return this.runner.run([pdf], ({ inputPaths, exec }) => {
      const args = [];
      if (options.password !== void 0)
        args.push(passwordArg(options.password));
      args.push("--show-npages", inputPaths[0]);
      const result = exec(args);
      assertOk(result);
      return Number.parseInt(result.stdoutText.trim(), 10);
    });
  }
  /** Whether the document is encrypted (locked). */
  async isEncrypted(pdf) {
    return this.runner.run([pdf], ({ inputPaths, exec }) => {
      const result = exec(["--is-encrypted", inputPaths[0]]);
      if (result.exitCode === 0)
        return true;
      if (result.exitCode === 2)
        return false;
      throw toPdfError(result);
    });
  }
  /**
   * Whether opening the document requires a password. `false` for
   * unencrypted files and for files encrypted with an empty user password.
   */
  async requiresPassword(pdf) {
    return this.runner.run([pdf], ({ inputPaths, exec }) => {
      const result = exec(["--requires-password", inputPaths[0]]);
      if (result.exitCode === 0)
        return true;
      if (result.exitCode === 2 || result.exitCode === 3)
        return false;
      throw toPdfError(result);
    });
  }
  /**
   * Shrink a PDF by recompressing streams and packing objects into
   * object streams. Lossless — image data is not resampled.
   */
  compress(pdf, options = {}) {
    const { password, compressionLevel = 9, objectStreams = true, linearize = false } = options;
    if (!Number.isInteger(compressionLevel) || compressionLevel < 1 || compressionLevel > 9) {
      throw new TypeError(`compressionLevel must be 1-9, got ${compressionLevel}`);
    }
    const args = [];
    if (password !== void 0)
      args.push(passwordArg(password));
    args.push("--compress-streams=y", "--recompress-flate", `--compression-level=${compressionLevel}`, `--object-streams=${objectStreams ? "generate" : "preserve"}`);
    if (linearize)
      args.push("--linearize");
    return this.transform(pdf, args);
  }
  /**
   * Linearize for "fast web view": browsers can render the first page
   * while the rest of the file is still downloading.
   */
  linearize(pdf, options = {}) {
    const args = [];
    if (options.password !== void 0)
      args.push(passwordArg(options.password));
    args.push("--linearize");
    return this.transform(pdf, args);
  }
  /**
   * Rewrite a damaged PDF. qpdf reconstructs the cross-reference table
   * and repairs recoverable structural problems; unrecoverable files
   * reject with `PdfError`.
   */
  repair(pdf, options = {}) {
    const args = [];
    if (options.password !== void 0)
      args.push(passwordArg(options.password));
    return this.transform(pdf, args);
  }
  /**
   * Stamp pages of one PDF onto another — watermarks, letterheads,
   * "CONFIDENTIAL" overlays. By default stamp page N goes onto document
   * page N until the stamp runs out; pass `repeat` to tile stamp pages
   * across the rest (e.g. `repeat: 1` for a single-page watermark).
   */
  async watermark(pdf, stamp, options = {}) {
    const { mode = "overlay", password, stampPassword, to, from, repeat } = options;
    return this.runner.run([pdf, stamp], ({ dir, inputPaths, exec, fs }) => {
      const args = [];
      if (password !== void 0)
        args.push(passwordArg(password));
      args.push(`--${mode}`, inputPaths[1]);
      if (stampPassword !== void 0)
        args.push(`--password=${stampPassword}`);
      if (to !== void 0)
        args.push(`--to=${pagesArg(to)}`);
      if (from !== void 0)
        args.push(`--from=${pagesArg(from)}`);
      if (repeat !== void 0)
        args.push(`--repeat=${pagesArg(repeat)}`);
      const out = `${dir}/out.pdf`;
      args.push("--", inputPaths[0], out);
      assertOk(exec(args));
      return fs.readFile(out);
    });
  }
  /**
   * Remove a page selection, keeping everything else.
   */
  deletePages(pdf, options) {
    const exclusions = pagesArg(options.pages).split(",").map((group) => `x${group}`).join(",");
    const extractOptions = {
      pages: `1-z,${exclusions}`,
      ...options.password !== void 0 && { password: options.password }
    };
    return this.extractPages(pdf, extractOptions);
  }
  /** Reverse the page order. */
  reversePages(pdf, options = {}) {
    return this.extractPages(pdf, { pages: "z-1", ...options });
  }
  /**
   * Interleave pages from multiple documents — page 1 of each, then
   * page 2 of each, and so on (or groups of `groupSize` pages). Useful
   * for combining separately scanned fronts and backs.
   */
  async collate(sources, options = {}) {
    const groupSize = options.groupSize ?? 1;
    if (!Number.isInteger(groupSize) || groupSize < 1) {
      throw new TypeError(`groupSize must be a positive integer, got ${groupSize}`);
    }
    if (sources.length < 2) {
      throw new TypeError("collate() needs at least two source documents");
    }
    const normalized = sources.map(normalizeSource);
    return this.runner.run(normalized.map((s) => s.data), ({ dir, inputPaths, exec, fs }) => {
      const args = ["--empty", `--collate=${groupSize}`, "--pages"];
      normalized.forEach((source, i) => {
        args.push(inputPaths[i]);
        if (source.password !== void 0)
          args.push(`--password=${source.password}`);
        args.push(source.pages !== void 0 ? pagesArg(source.pages) : "1-z");
      });
      const out = `${dir}/out.pdf`;
      args.push("--", out);
      assertOk(exec(args));
      return fs.readFile(out);
    });
  }
  /**
   * Flatten annotations and form fields into the page content, freezing
   * their appearance — useful before printing, splitting, or sharing.
   */
  flatten(pdf, options = {}) {
    const args = [];
    if (options.password !== void 0)
      args.push(passwordArg(options.password));
    args.push("--generate-appearances", `--flatten-annotations=${options.annotations ?? "all"}`);
    return this.transform(pdf, args);
  }
  /** Attach a file to the PDF (embedded-files table). */
  async addAttachment(pdf, options) {
    const { data, name, mimeType, description, password } = options;
    return this.runner.run([pdf], async ({ dir, inputPaths, exec, fs }) => {
      const attachmentPath = `${dir}/${sanitizeName(name)}`;
      fs.writeFile(attachmentPath, await toBytes(data));
      const args = [];
      if (password !== void 0)
        args.push(passwordArg(password));
      args.push("--add-attachment", attachmentPath, `--key=${name}`, `--filename=${name}`);
      if (mimeType !== void 0)
        args.push(`--mimetype=${mimeType}`);
      if (description !== void 0)
        args.push(`--description=${description}`);
      const out = `${dir}/out.pdf`;
      args.push("--", inputPaths[0], out);
      assertOk(exec(args));
      return fs.readFile(out);
    });
  }
  /** Remove an attachment by name. */
  removeAttachment(pdf, options) {
    const args = [];
    if (options.password !== void 0)
      args.push(passwordArg(options.password));
    args.push(`--remove-attachment=${options.name}`);
    return this.transform(pdf, args);
  }
  /** Extract an attachment's content. */
  async getAttachment(pdf, options) {
    return this.runner.run([pdf], ({ inputPaths, exec }) => {
      const args = [];
      if (options.password !== void 0)
        args.push(passwordArg(options.password));
      args.push(`--show-attachment=${options.name}`, inputPaths[0]);
      const result = exec(args);
      assertOk(result);
      return result.stdout;
    });
  }
  /** List the PDF's attachments. */
  async listAttachments(pdf, options = {}) {
    const info = await this.getInfo(pdf, options);
    return info.attachments;
  }
  /**
   * Inspect a document: PDF version, page count, encryption details
   * (scheme, matched passwords, permissions), and attachments.
   */
  async getInfo(pdf, options = {}) {
    return this.runner.run([pdf], ({ inputPaths, exec, fs }) => {
      const passwordArgs = options.password !== void 0 ? [passwordArg(options.password)] : [];
      const jsonResult = exec([
        ...passwordArgs,
        "--json",
        "--json-key=encrypt",
        "--json-key=attachments",
        "--json-key=pages",
        inputPaths[0]
      ]);
      assertOk(jsonResult);
      const json = JSON.parse(jsonResult.stdoutText);
      const header = new TextDecoder("latin1").decode(fs.readFile(inputPaths[0]).slice(0, 1024));
      const pdfVersion = /%PDF-(\d+\.\d+)/.exec(header)?.[1] ?? "unknown";
      const attachments = Object.entries(json.attachments ?? {}).map(([name, a]) => ({
        name,
        ...a.preferredname !== void 0 && { filename: a.preferredname },
        ...a.description !== void 0 && { description: a.description }
      }));
      const encrypt = json.encrypt;
      const info = {
        pdfVersion,
        pageCount: json.pages?.length ?? 0,
        encrypted: encrypt?.encrypted ?? false,
        attachments
      };
      if (encrypt?.encrypted) {
        const c = encrypt.capabilities ?? {};
        info.encryption = {
          bits: encrypt.parameters?.bits ?? 0,
          method: encrypt.parameters?.method ?? "unknown",
          userPasswordMatched: encrypt.userpasswordmatched ?? false,
          ownerPasswordMatched: encrypt.ownerpasswordmatched ?? false,
          permissions: {
            accessibility: c.accessibility ?? false,
            extract: c.extract ?? false,
            print: c.printhigh ?? c.printlow ?? false,
            modify: c.modify ?? false,
            annotate: c.modifyannotations ?? false,
            fillForms: c.modifyforms ?? false,
            assemble: c.modifyassembly ?? false
          }
        };
      }
      return info;
    });
  }
  /**
   * Escape hatch: run qpdf with arbitrary CLI arguments. Input documents
   * are staged as `in0.pdf`, `in1.pdf`, … in the working directory; write
   * your output to `out.pdf`. Placeholders `$in0`, `$in1`, …, `$out` in
   * `args` are replaced with the real paths.
   */
  async raw(inputs, args) {
    return this.runner.run(inputs, ({ dir, inputPaths, exec, fs }) => {
      const out = `${dir}/out.pdf`;
      const resolved = args.map((a) => a.replace(/\$out/g, out).replace(/\$in(\d+)/g, (_, i) => {
        const path = inputPaths[Number(i)];
        if (path === void 0)
          throw new TypeError(`no input for placeholder $in${i}`);
        return path;
      }));
      assertOk(exec(resolved));
      return fs.readFile(out);
    });
  }
  /** Run a single-input → single-output qpdf transform. */
  async transform(pdf, extraArgs) {
    return this.runner.run([pdf], ({ dir, inputPaths, exec, fs }) => {
      const out = `${dir}/out.pdf`;
      assertOk(exec([...extraArgs, inputPaths[0], out]));
      return fs.readFile(out);
    });
  }
};
function createPdfToolkit(options = {}) {
  return PdfToolkit.create(options);
}
function normalizeSource(s) {
  return typeof s === "object" && s !== null && "data" in s ? s : { data: s };
}
function sanitizeName(name) {
  return name.replace(/[^\w.-]/g, "_") || "attachment";
}
function partNumber(name) {
  return Number.parseInt(name.replace(/^part-/, ""), 10);
}
function passwordArg(password) {
  return `--password=${password}`;
}
function pagesArg(pages) {
  if (typeof pages === "number")
    return String(pages);
  if (typeof pages === "string")
    return pages;
  return pages.map(String).join(",");
}
function encryptArgs(options) {
  const { userPassword, ownerPassword = userPassword, keyLength = 256, permissions = {} } = options;
  const args = [];
  if (keyLength === 40)
    args.push("--allow-weak-crypto");
  args.push("--encrypt", `--user-password=${userPassword}`, `--owner-password=${ownerPassword}`, `--bits=${keyLength}`);
  if (keyLength === 128)
    args.push("--use-aes=y");
  const { print, modify, extract, accessibility } = permissions;
  if (keyLength === 40) {
    if (print !== void 0)
      args.push(`--print=${print === "none" ? "n" : "y"}`);
    if (modify !== void 0)
      args.push(`--modify=${modify === "none" ? "n" : "y"}`);
    if (extract !== void 0)
      args.push(`--extract=${extract ? "y" : "n"}`);
  } else {
    if (print !== void 0)
      args.push(`--print=${print}`);
    if (modify !== void 0)
      args.push(`--modify=${modify}`);
    if (extract !== void 0)
      args.push(`--extract=${extract ? "y" : "n"}`);
    if (accessibility !== void 0)
      args.push(`--accessibility=${accessibility ? "y" : "n"}`);
  }
  args.push("--");
  return args;
}
function assertOk(result) {
  if (result.exitCode === 0 || result.exitCode === 3)
    return;
  throw toPdfError(result);
}
function toPdfError(result) {
  const stderr = result.stderr.trim();
  const message = stderr.split("\n").at(-1) ?? `qpdf failed with exit code ${result.exitCode}`;
  if (/invalid password|password.*(required|incorrect)/i.test(stderr)) {
    return new PdfPasswordError(message, result.exitCode, stderr);
  }
  return new PdfError(message, result.exitCode, stderr);
}

// src/app/qpdf-worker.mjs
self.onmessage = async ({ data: { id, data, password } }) => {
  try {
    const pdf = await createPdfToolkit({ wasmUrl: "/assets/qpdf.wasm" });
    const bytes = await (id === "protect" ? pdf.lock(data, { userPassword: password, keyLength: 256 }) : id === "unlock" ? pdf.unlock(data, { password: password || "" }) : id === "lossless" ? pdf.compress(data) : pdf.repair(data));
    self.postMessage({ bytes });
  } catch (error) {
    self.postMessage({ error: error.name === "PdfPasswordError" ? "The document password is incorrect." : error.message || "This PDF could not be processed." });
  }
};
