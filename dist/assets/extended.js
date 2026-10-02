import "./chunk-QGM4M3NI.js";

// src/app/catalog-design.mjs
var cards = {
  protect: ["proposal", null, "lock-simple", "Keep a document behind a password.", "AES-256", "Protect PDF"],
  unlock: ["proposal", null, "lock-simple-open", "Open a password-protected document.", "Password needed", "Unlock PDF"],
  lossless: ["invoice", null, "arrows-in-simple", "Reduce size while keeping selectable text.", "Lossless", "Lossless compression"],
  recover: ["proposal", "notes", "arrows-clockwise", "Try to recover a damaged document.", "Best effort", "Repair & recover"],
  jpg: ["scan", null, "image", "Save every page as a JPG image.", "ZIP download", "PDF to JPG"],
  docx: ["letter", null, "file-doc", "Turn selectable text into editable Word.", "Text only", "PDF to Word"],
  xlsx: ["sheet", null, "file-xls", "Put extracted rows into a workbook.", "Approximate tables", "PDF to Excel"],
  pptx: ["slides", null, "file-ppt", "Give every PDF page its own slide.", "Image slides", "PDF to PowerPoint"],
  createform: ["form", null, "textbox", "Add fields, checkboxes and choices.", null, "Create PDF forms"],
  drawsign: ["signed", null, "signature", "Draw your signature or a freehand note.", "Visual signature", "Draw & sign"],
  imagewatermark: ["proposal", null, "image", "Place your image across every page.", null, "Image watermark"],
  shapes: ["notes", null, "shapes", "Make your point with a shape or line.", null, "Add shapes"],
  visualcompare: ["proposal", "letter", "columns", "View two versions side by side.", "Visual preview", "Compare PDFs"],
  aisummary: ["brief", null, "sparkle", "Find the main points with on-device AI.", "Browser dependent", "AI summary"],
  wordtopdf: ["letter", null, "file-doc", "Make a Word document easy to share.", "DOCX text only", "Word to PDF"],
  exceltopdf: ["sheet", null, "file-xls", "Give spreadsheet values a printable home.", "Cell values only", "Excel to PDF"],
  ppttopdf: ["slides", null, "file-ppt", "Bring slide text into one document.", "Slide text only", "PowerPoint to PDF"],
  htmltopdf: ["letter", null, "code", "Turn local HTML text into a PDF.", "Local files only", "HTML to PDF"],
  watermark: ["proposal", null, "text-aa", "Add a subtle text mark across pages.", null, "Text watermark"],
  numbers: ["notes", null, "list-numbers", "Keep the order clear with page numbers.", null, "Page numbers"],
  rotate: ["invoice", null, "arrows-clockwise", "Turn your pages the right way around.", null, "Rotate PDF"],
  crop: ["proposal", null, "crop", "Trim the edges for a cleaner page.", null, "Crop PDF"],
  markdown: ["markdown", null, "code", "Take selectable text into Markdown.", "Page-based text", "PDF to Markdown"],
  translate: ["letter", "notes", "translate", "Translate English text on your device.", "TXT \xB7 browser dependent", "Translate text"],
  fillform: ["form", null, "textbox", "Fill in an existing interactive form.", null, "Fill PDF forms"]
};
function createCatalogCard(id, config, select, group) {
  const [file, secondary, icon, description, badge, title] = cards[id], link = document.createElement("a");
  link.href = "#workspace";
  link.dataset.group = group;
  link.dataset.search = (config.title + " " + config.copy + " " + title).toLowerCase();
  link.dataset.toolCard = id;
  const cover = document.createElement("span");
  cover.className = `tool-cover catalog-cover catalog-${id}`;
  for (const [name, cls] of [[secondary, "secondary-page"], [file, "document-page"]]) {
    if (!name) continue;
    const image = document.createElement("img");
    image.src = `/previews/${name}.png`;
    image.alt = "";
    image.className = cls;
    image.width = name === "slides" ? 900 : 540;
    image.height = name === "slides" ? 570 : 705;
    image.loading = "lazy";
    image.decoding = "async";
    cover.append(image);
  }
  const action = document.createElement("span");
  action.className = "cover-action";
  const glyph = document.createElement("img");
  glyph.src = `/assets/icons/${icon}.svg`;
  glyph.alt = "";
  glyph.width = glyph.height = 20;
  action.append(glyph);
  cover.append(action);
  if (badge) {
    const label = document.createElement("span");
    label.className = "cover-badge";
    label.textContent = badge;
    cover.append(label);
  }
  if (["docx", "xlsx", "pptx", "jpg", "wordtopdf", "exceltopdf", "ppttopdf", "markdown", "htmltopdf"].includes(id)) {
    const format = document.createElement("span");
    format.className = "format-tag";
    format.textContent = { docx: "DOCX", xlsx: "XLSX", pptx: "PPTX", jpg: "JPG", wordtopdf: "PDF", exceltopdf: "PDF", ppttopdf: "PDF", markdown: "MD", htmltopdf: "HTML" }[id];
    cover.append(format);
  }
  const heading = document.createElement("span");
  heading.className = "tool-card-title";
  heading.textContent = title;
  const arrow = document.createElement("img");
  arrow.src = "/assets/icons/arrow-up-right.svg";
  arrow.alt = "";
  arrow.width = arrow.height = 16;
  heading.append(arrow);
  const desc = document.createElement("span");
  desc.className = "tool-card-desc";
  desc.textContent = description;
  link.append(cover, heading, desc);
  link.onclick = (event) => {
    event.preventDefault();
    select(id);
    document.getElementById("workspace").scrollIntoView({ behavior: event.detail === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    document.getElementById("tool-title").focus({ preventScroll: true });
  };
  return link;
}
function catalogIcon(id) {
  return cards[id]?.[2] || "file-pdf";
}

// src/app/design-ui.mjs
function refineOptions() {
  const options = document.getElementById("options");
  if (!options?.children.length || options.classList.contains("refined")) return;
  for (const label of [...options.children].filter((el) => el.tagName === "LABEL")) {
    if (label.querySelector("input")) {
      label.classList.add("option-check");
      continue;
    }
    const input = label.nextElementSibling;
    if (!input || !["INPUT", "SELECT", "TEXTAREA"].includes(input.tagName)) continue;
    const field = document.createElement("div");
    field.className = "option-field";
    if (input.tagName === "TEXTAREA" || input.type === "file") field.classList.add("option-wide");
    if (input.id) label.htmlFor = input.id;
    label.before(field);
    field.append(label, input);
  }
  for (const child of options.children) if (child.matches(".hint,canvas,button")) child.classList.add("option-wide");
  options.classList.add("refined");
}
function initDesignUI() {
  document.addEventListener("privypdf:tool", () => queueMicrotask(refineOptions));
  document.querySelector(".sidebar").addEventListener("click", () => queueMicrotask(refineOptions));
  queueMicrotask(refineOptions);
}

// src/app/extended.mjs
function initExtended(api) {
  initDesignUI();
  const { configs, categories, select, current, files, go, status, options, downloadBlob, loadPdfJs, extractPdfText, advancedOptions } = api;
  const tools = { protect: ["Protect PDF", "Encrypt a PDF with an AES-256 password on this device."], unlock: ["Unlock PDF", "Remove encryption using the document password."], lossless: ["Lossless PDF compression", "Optimize PDF structure without rasterizing text. Size reduction varies."], recover: ["Recover damaged PDF", "Attempt local cross-reference and object recovery. Some damaged files cannot be recovered."], jpg: ["PDF to JPG", "Export each page as a JPG in a ZIP file."], docx: ["PDF to Word (DOCX)", "Export selectable text into an editable DOCX. Original layouts and images are not preserved."], xlsx: ["PDF to Excel (XLSX)", "Export extracted text rows into a real workbook, one sheet per page. Table reconstruction is approximate."], pptx: ["PDF to PowerPoint", "Preserve each page visually as a slide image. Slide content is not editable."] };
  Object.assign(tools, { createform: ["Create PDF forms", "Add a named text field, checkbox, dropdown, or radio group to a PDF. Existing form fields are preserved."], drawsign: ["Draw signature / freehand", "Draw an ink signature or annotation and place it on a page. This is a visual mark, not a digital certificate."], imagewatermark: ["Image watermark", "Place a PNG or JPG watermark on every PDF page."], shapes: ["Add PDF shapes", "Add a colored rectangle, ellipse, or line to a page."], visualcompare: ["Compare PDFs visually", "View corresponding pages side by side locally. This does not automatically identify every difference."], aisummary: ["AI Summarizer", "Summarize selectable text using the browser\u2019s on-device AI, when supported. A model download may be required."] });
  for (const [id, [title, copy]] of Object.entries(tools)) {
    configs[id] = { title, copy, accept: "application/pdf", multiple: id === "visualcompare", drop: id === "visualcompare" ? "Drop exactly two PDFs here" : "Drop one PDF here", action: "Process & download" };
    const button = document.createElement("button");
    button.className = "tool";
    button.dataset.tool = id;
    const icon = document.createElement("span"), glyph = document.createElement("img");
    glyph.src = `/assets/icons/${catalogIcon(id)}.svg`;
    glyph.alt = "";
    glyph.width = glyph.height = 18;
    icon.append(glyph);
    button.append(icon, document.createTextNode(title));
    button.addEventListener("click", () => select(id));
    document.querySelector('[data-tool="merge"]').parentElement.append(button);
    button.style.display = "none";
  }
  categories.secure.push("protect", "unlock");
  categories.convert.push("jpg", "docx", "xlsx", "pptx");
  categories.intelligence.push("lossless", "recover");
  const grid = document.getElementById("core-tools");
  for (const id of [...Object.keys(tools), "wordtopdf", "exceltopdf", "ppttopdf", "htmltopdf", "watermark", "numbers", "rotate", "crop", "markdown", "translate", "fillform"]) {
    const group = ["createform", "drawsign", "imagewatermark", "shapes"].includes(id) ? "Edit & sign" : categories.secure.includes(id) ? "Privacy" : categories.edit.includes(id) ? "Edit & sign" : categories.organize.includes(id) ? "Organize" : categories.convert.includes(id) ? "Convert" : "Intelligence";
    grid.append(createCatalogCard(id, configs[id], select, group));
  }
  advancedOptions.protect = '<label for="local-password">New password</label><input id="local-password" type="password" autocomplete="new-password"><label for="confirm-password">Confirm password</label><input id="confirm-password" type="password" autocomplete="new-password"><span class="hint">Keep this password safe. FolioCove cannot recover it.</span>';
  advancedOptions.unlock = '<label for="local-password">Document password</label><input id="local-password" type="password" autocomplete="off">';
  advancedOptions.edit += '<label for="edit-font">Font</label><select id="edit-font"><option value="Helvetica">Helvetica</option><option value="TimesRoman">Times Roman</option><option value="Courier">Courier</option></select><label for="edit-size">Font size</label><input id="edit-size" type="number" min="6" max="120" value="12"><label for="edit-color">Text color</label><input id="edit-color" type="color" value="#0d141f">';
  const position = '<label for="local-page">Page</label><input id="local-page" type="number" min="1" value="1"><label for="local-x">Left (%)</label><input id="local-x" type="number" min="0" max="90" value="10"><label for="local-y">Top (%)</label><input id="local-y" type="number" min="0" max="90" value="20"><label for="local-w">Width (%)</label><input id="local-w" type="number" min="1" max="90" value="40"><label for="local-h">Height (%)</label><input id="local-h" type="number" min="1" max="90" value="10">';
  advancedOptions.createform = '<label for="field-name">Field name</label><input id="field-name" value="Full Name"><label for="field-kind">Field type</label><select id="field-kind"><option value="text">Text</option><option value="check">Checkbox</option><option value="dropdown">Dropdown</option><option value="radio">Radio group</option></select><label for="field-choices">Choices (one per line)</label><textarea id="field-choices">Yes\nNo</textarea>' + position;
  advancedOptions.drawsign = position + '<span class="hint">Draw below using your mouse, finger, or pen.</span><canvas id="ink-pad" width="640" height="180" aria-label="Signature drawing pad" style="width:100%;max-width:640px;background:white;border:1px solid #bbb;touch-action:none"></canvas><button type="button" id="clear-ink">Clear drawing</button>';
  advancedOptions.imagewatermark = '<label for="watermark-image">Watermark image</label><input id="watermark-image" type="file" accept="image/png,image/jpeg"><label for="image-opacity">Opacity</label><input id="image-opacity" type="number" min="0.05" max="1" step="0.05" value="0.3">';
  advancedOptions.shapes = '<label for="shape-kind">Shape</label><select id="shape-kind"><option value="rectangle">Rectangle</option><option value="ellipse">Ellipse</option><option value="line">Line</option></select><label for="shape-color">Color</label><input id="shape-color" type="color" value="#c52949">' + position;
  advancedOptions.visualcompare = '<label for="compare-page">Page</label><input id="compare-page" type="number" min="1" value="1"><span class="hint">Change the page number and run again to view another pair.</span>';
  categories.edit.push("createform", "drawsign", "imagewatermark", "shapes");
  categories.intelligence.push("visualcompare", "aisummary");
  document.addEventListener("privypdf:tool", ({ detail }) => {
    if (detail.tool !== "drawsign") return;
    const canvas = document.getElementById("ink-pad"), ctx = canvas.getContext("2d");
    let drawing = false;
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
    };
    canvas.onpointerdown = (e) => {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      ctx.beginPath();
      ctx.moveTo(...point(e));
    };
    canvas.onpointermove = (e) => {
      if (!drawing) return;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineTo(...point(e));
      ctx.stroke();
      canvas.dataset.drawn = "yes";
    };
    canvas.onpointerup = canvas.onpointercancel = () => drawing = false;
    document.getElementById("clear-ink").onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      delete canvas.dataset.drawn;
    };
  });
  go.addEventListener("click", async (event) => {
    const id = current();
    if (!tools[id]) return;
    event.stopImmediatePropagation();
    go.disabled = true;
    status.className = "status";
    status.textContent = "Processing on your device\u2026";
    try {
      const file = files()[0];
      if (!file) throw Error("Choose a PDF first.");
      if (file.size > 100 * 1024 * 1024) throw Error("Choose a PDF smaller than 100 MB.");
      let password = document.getElementById("local-password")?.value;
      if (id === "protect" && (!password || password !== document.getElementById("confirm-password").value)) throw Error("Enter matching, non-empty passwords.");
      if (id === "aisummary") {
        if (!globalThis.Summarizer) throw Error("This browser does not support on-device AI summaries. Use Smart summary for an extractive summary.");
        const model = await Summarizer.create({ type: "key-points", format: "markdown", length: "medium", expectedInputLanguages: ["en"], outputLanguage: "en", monitor: (m) => m.addEventListener("downloadprogress", (e) => {
          status.textContent = `Downloading local AI model: ${Math.round(e.loaded * 100)}%`;
        }) });
        try {
          const text = (await extractPdfText(file)).join("\n");
          if (!text.trim()) throw Error("No selectable text found. Run OCR first.");
          const summary = await model.summarize(text);
          downloadBlob(new Blob([summary], { type: "text/markdown;charset=utf-8" }), "ai-summary.md");
        } finally {
          model.destroy();
        }
      } else if (id === "visualcompare") {
        if (files().length !== 2) throw Error("Choose exactly two PDFs.");
        const pdfjs = await loadPdfJs(), panel = document.getElementById("visual-panel");
        panel.replaceChildren();
        panel.classList.add("show");
        for (const source of files()) {
          const task = pdfjs.getDocument({ data: new Uint8Array(await source.arrayBuffer()) }), pdf = await task.promise;
          try {
            const n = Number(document.getElementById("compare-page").value);
            if (!Number.isInteger(n) || n < 1 || n > pdf.numPages) throw Error(`Page ${n} is not present in both files.`);
            const page = await pdf.getPage(n), viewport = page.getViewport({ scale: 1 }), canvas = document.createElement("canvas");
            if (viewport.width * viewport.height > 12e6) throw Error("Page too large to preview.");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = "100%";
            const figure = document.createElement("figure"), caption = document.createElement("figcaption");
            caption.textContent = `${source.name} \xB7 page ${n} of ${pdf.numPages}`;
            figure.append(caption, canvas);
            panel.append(figure);
            await page.render({ canvasContext: canvas.getContext("2d"), viewport, background: "white" }).promise;
          } finally {
            await task.destroy();
          }
        }
      } else if (["createform", "drawsign", "imagewatermark", "shapes"].includes(id)) {
        const { PDFDocument, rgb } = await import("./es-BISQX4II.js"), doc = await PDFDocument.load(await file.arrayBuffer());
        if (id === "imagewatermark") {
          const image = document.getElementById("watermark-image").files[0];
          if (!image || image.size > 10 * 1024 * 1024) throw Error("Choose a PNG or JPG smaller than 10 MB.");
          const bytes = await image.arrayBuffer(), img = image.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes), opacity = Number(document.getElementById("image-opacity").value);
          if (!Number.isFinite(opacity) || opacity < 0.05 || opacity > 1) throw Error("Opacity must be between 0.05 and 1.");
          for (const p of doc.getPages()) {
            const scale = Math.min(p.getWidth() * 0.5 / img.width, p.getHeight() * 0.5 / img.height), w = img.width * scale, h = img.height * scale;
            p.drawImage(img, { x: (p.getWidth() - w) / 2, y: (p.getHeight() - h) / 2, width: w, height: h, opacity });
          }
        } else {
          const value = (name) => Number(document.getElementById(name).value), n = value("local-page");
          if (!Number.isInteger(n) || n < 1 || n > doc.getPageCount()) throw Error("Choose a page in this document.");
          const page = doc.getPage(n - 1), left = value("local-x"), top = value("local-y"), width = value("local-w"), height = value("local-h");
          if (![left, top, width, height].every(Number.isFinite) || left < 0 || top < 0 || width <= 0 || height <= 0 || left + width > 100 || top + height > 100) throw Error("The region must fit inside the page.");
          const box = { x: page.getWidth() * left / 100, y: page.getHeight() * (1 - (top + height) / 100), width: page.getWidth() * width / 100, height: page.getHeight() * height / 100 };
          if (id === "createform") {
            const form = doc.getForm(), name = document.getElementById("field-name").value.trim();
            if (!name) throw Error("Enter a field name.");
            if (form.getFields().some((f) => f.getName() === name)) throw Error("That field name already exists.");
            const kind = document.getElementById("field-kind").value, choices = [...new Set(document.getElementById("field-choices").value.split("\n").map((s) => s.trim()).filter(Boolean))];
            if (kind === "text") form.createTextField(name).addToPage(page, box);
            else if (kind === "check") form.createCheckBox(name).addToPage(page, { ...box, width: Math.min(box.width, box.height), height: Math.min(box.width, box.height) });
            else {
              if (!choices.length) throw Error("Enter at least one choice.");
              if (kind === "dropdown") {
                const f = form.createDropdown(name);
                f.addOptions(choices);
                f.addToPage(page, box);
              } else {
                const f = form.createRadioGroup(name);
                choices.forEach((choice, i) => f.addOptionToPage(choice, page, { x: box.x + i * box.width / choices.length, y: box.y, width: Math.min(18, box.width / choices.length), height: 18 }));
              }
            }
          } else if (id === "drawsign") {
            const canvas = document.getElementById("ink-pad");
            if (!canvas.dataset.drawn) throw Error("Draw a signature or annotation first.");
            const image = await doc.embedPng(canvas.toDataURL("image/png"));
            page.drawImage(image, box);
          } else {
            const hex = document.getElementById("shape-color").value, color = rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255), kind = document.getElementById("shape-kind").value;
            if (kind === "rectangle") page.drawRectangle({ ...box, color });
            else if (kind === "ellipse") page.drawEllipse({ x: box.x + box.width / 2, y: box.y + box.height / 2, xScale: box.width / 2, yScale: box.height / 2, color });
            else page.drawLine({ start: { x: box.x, y: box.y }, end: { x: box.x + box.width, y: box.y + box.height }, color, thickness: 2 });
          }
        }
        downloadBlob(new Blob([await doc.save()], { type: "application/pdf" }), `${id}.pdf`);
      } else if (["protect", "unlock", "lossless", "recover"].includes(id)) {
        const data = await file.arrayBuffer();
        const result = await new Promise((resolve, reject) => {
          const worker = new Worker("/assets/qpdf-worker.js", { type: "module" });
          const timer = setTimeout(() => {
            worker.terminate();
            reject(Error("Processing timed out. Try a smaller document."));
          }, 12e4);
          const finish = () => {
            clearTimeout(timer);
            worker.terminate();
          };
          worker.onmessage = ({ data: data2 }) => {
            finish();
            data2.error ? reject(Error(data2.error)) : resolve(data2.bytes);
          };
          worker.onerror = () => {
            finish();
            reject(Error("The local PDF engine could not start in this browser."));
          };
          worker.postMessage({ id, data, password }, [data]);
        });
        downloadBlob(new Blob([result], { type: "application/pdf" }), `${id}.pdf`);
      } else if (id === "docx") {
        const { Document, Paragraph, Packer } = await import("./dist-SCWYDJSQ.js");
        const pages = await extractPdfText(file);
        if (!pages.some((p) => p.trim())) throw Error("No selectable text found. Run OCR first.");
        const doc = new Document({ sections: pages.map((text) => ({ children: text.split("\n").map((line) => new Paragraph(line)) })) });
        downloadBlob(await Packer.toBlob(doc), "document.docx");
      } else if (id === "xlsx") {
        const XLSX = await import("./xlsx-NKG7VBLZ.js");
        const pages = await extractPdfText(file);
        if (!pages.some((p) => p.trim())) throw Error("No selectable text found. Run OCR first.");
        const book = XLSX.utils.book_new();
        pages.forEach((text, i) => XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(text.split("\n").map((line) => line.split(/\s{2,}|\t/))), `Page ${i + 1}`));
        downloadBlob(new Blob([XLSX.write(book, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "document.xlsx");
      } else {
        const pdfjs = await loadPdfJs(), task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }), pdf = await task.promise;
        try {
          const { default: JSZip } = await import("./jszip.min-5NV2IEKU.js");
          const zip = new JSZip();
          let ppt;
          if (id === "pptx") {
            const { default: PptxGenJS } = await import("./pptxgen.es-WRELKYQA.js");
            ppt = new PptxGenJS();
            ppt.layout = "LAYOUT_WIDE";
          }
          for (let n = 1; n <= pdf.numPages; n++) {
            status.textContent = `Rendering page ${n} of ${pdf.numPages} locally\u2026`;
            const page = await pdf.getPage(n), viewport = page.getViewport({ scale: 1.5 });
            if (viewport.width * viewport.height > 24e6) throw Error("A page is too large to render safely.");
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext("2d"), viewport, background: "white" }).promise;
            if (ppt) {
              const scale = Math.min(13.333 / viewport.width, 7.5 / viewport.height), w = viewport.width * scale, h = viewport.height * scale;
              const slide = ppt.addSlide();
              slide.addImage({ data: canvas.toDataURL("image/jpeg", 0.92), x: (13.333 - w) / 2, y: (7.5 - h) / 2, w, h });
            } else {
              const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
              if (!blob) throw Error("JPG export failed.");
              zip.file(`page-${String(n).padStart(3, "0")}.jpg`, blob);
            }
            canvas.width = canvas.height = 0;
          }
          downloadBlob(ppt ? new Blob([await ppt.write({ outputType: "arraybuffer" })], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }) : await zip.generateAsync({ type: "blob" }), ppt ? "document.pptx" : "pdf-jpg-pages.zip");
        } finally {
          await task.destroy();
        }
      }
      status.textContent = id === "visualcompare" ? "Done \u2014 local previews are ready." : "Done \u2014 your local download is ready.";
      status.className = "status ok";
    } catch (error) {
      status.textContent = error.message || "Unable to process this PDF.";
      status.className = "status error";
    } finally {
      go.disabled = !files().length;
    }
  }, true);
  document.getElementById("tool-filter").dispatchEvent(new Event("change", { bubbles: true }));
}
export {
  initExtended
};
