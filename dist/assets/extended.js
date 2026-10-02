import "./chunk-QGM4M3NI.js";

// src/content/tools.mjs
var configs = { merge: { title: "Merge PDFs", copy: "Combine multiple PDFs in the order you add them.", accept: "application/pdf", multiple: true, drop: "Drop PDFs here", action: "Merge & download" }, split: { title: "Extract pages", copy: "Create a new PDF from only the pages you need.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Extract & download" }, rotate: { title: "Rotate PDF", copy: "Rotate every page clockwise while keeping quality intact.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Rotate & download" }, images: { title: "Images to PDF", copy: "Turn JPG and PNG images into one clean PDF.", accept: "image/jpeg,image/png", multiple: true, drop: "Drop images here", action: "Create & download" }, watermark: { title: "Add watermark", copy: "Stamp custom text across every page without uploading.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Watermark & download" }, numbers: { title: "Add page numbers", copy: "Add clean, centered numbering to every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Number & download" }, clean: { title: "Clear PDF info fields", copy: "Clear standard title, author, subject, keyword and software fields only. Hidden data is not removed.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Clear info fields" }, inspect: { title: "Inspect PDF", copy: "Check page count, dimensions and hidden document details.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Inspect privately" }, quick: { title: "Quick Action", copy: "Describe several changes once. FolioCove runs them locally in one pass.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Run & download" }, organize: { title: "Organize pages", copy: "Reorder, remove or duplicate pages with one simple sequence.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Organize & download" }, crop: { title: "Crop margins", copy: "Trim whitespace from every page by a precise percentage.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Crop & download" }, flatten: { title: "Flatten forms", copy: "Lock filled form values into the PDF for reliable sharing.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Flatten & download" }, topng: { title: "PDF page to PNG", copy: "Export any PDF page as a crisp, high-resolution PNG.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Export PNG" }, metadata: { title: "Edit metadata", copy: "Set the title, author and subject stored inside your PDF.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Save metadata" }, header: { title: "Header & footer", copy: "Add consistent document labels across every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Apply & download" }, reverse: { title: "Reverse page order", copy: "Flip the entire document from last page to first.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Reverse & download" }, oddeven: { title: "Odd / even pages", copy: "Create a new PDF containing only odd or even pages.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Extract & download" }, interleave: { title: "Interleave PDFs", copy: "Alternate pages from two PDFs\u2014perfect for front/back scans.", accept: "application/pdf", multiple: true, drop: "Drop exactly two PDFs here", action: "Interleave & download" }, resize: { title: "Resize pages", copy: "Fit every page cleanly onto A4 or US Letter paper.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Resize & download" }, twoup: { title: "Two-up layout", copy: "Place two document pages side by side on each sheet.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create two-up PDF" }, bates: { title: "Bates numbering", copy: "Add a prefixed, zero-padded identifier to every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Number & download" }, compress: { title: "Compress PDF", copy: "Shrink a PDF locally by rebuilding pages at a chosen quality.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Compress & download" }, allpng: { title: "All pages to PNG", copy: "Export every PDF page into one convenient ZIP file.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create PNG ZIP" }, chunk: { title: "Split into chunks", copy: "Break a long PDF into smaller PDFs inside one ZIP.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Split & download ZIP" }, blank: { title: "Insert blank page", copy: "Add a blank A4 page at the end of your document.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Insert & download" } };
Object.assign(configs, { text: { title: "Extract text", copy: "Save selectable PDF text as a clean TXT file.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Extract text" }, markdown: { title: "PDF to Markdown", copy: "Turn selectable PDF text into page-structured Markdown.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create Markdown" }, stats: { title: "Reading statistics", copy: "Count words, characters and estimated reading time locally.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Analyze privately" }, datestamp: { title: "Date stamp", copy: "Add today\u2019s date to the bottom of every PDF page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Stamp & download" } });
Object.assign(configs, { annotations: { title: "Remove annotations", copy: "Remove comments, links and interactive annotations from every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Remove & download" }, margins: { title: "Add print margins", copy: "Place each page on a larger white canvas for safer printing.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Add margins" }, grayscale: { title: "Grayscale PDF", copy: "Create a black-and-white friendly copy for printing and archiving.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Convert & download" }, findtext: { title: "Find text", copy: "Find every page containing a word or phrase without uploading.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Search document" } });
Object.assign(configs, { compare: { title: "Compare PDFs", copy: "Compare page text from two PDFs and identify changed pages.", accept: "application/pdf", multiple: true, drop: "Drop exactly two PDFs here", action: "Compare privately" }, checksum: { title: "File fingerprint", copy: "Generate a SHA-256 fingerprint to verify document integrity.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Generate fingerprint" }, tojson: { title: "PDF to JSON", copy: "Export page-by-page text as structured JSON for automation.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create JSON" }, removeblank: { title: "Remove blank pages", copy: "Visually detect and remove empty pages from a PDF.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Clean & download" } });
Object.assign(configs, { ocr: { title: "OCR scanned PDF", copy: "Recognize English text from scanned pages and download it as TXT.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Run local OCR" }, contrast: { title: "Enhance scanned PDF", copy: "Increase grayscale contrast for clearer printing and reading.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Enhance & download" }, trimheads: { title: "Remove headers & footers", copy: "Cover the outer header and footer bands on every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Remove & download" }, spreads: { title: "Split scanned spreads", copy: "Turn each landscape two-page scan into separate left and right pages.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Split & download" } });
Object.assign(configs, { edit: { title: "Edit PDF", copy: "Place new text precisely on any page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Apply edit" }, sign: { title: "Sign PDF", copy: "Add a typed signature and date to any page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Sign & download" }, redact: { title: "Secure redact", copy: "Permanently rasterize and black out a selected page region.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Redact & download" }, fillform: { title: "Fill PDF forms", copy: "Fill named text, checkbox and choice fields from one simple list.", accept: "application/pdf", multiple: false, drop: "Drop a fillable PDF here", action: "Fill & download" }, searchableocr: { title: "Searchable OCR PDF", copy: "Create a searchable scanned PDF with an invisible English text layer.", accept: "application/pdf", multiple: false, drop: "Drop a scanned PDF here", action: "Create searchable PDF" }, repair: { title: "Repair PDF", copy: "Rebuild readable objects and save a clean PDF copy.", accept: "application/pdf", multiple: false, drop: "Drop a damaged PDF here", action: "Repair & download" }, summary: { title: "Smart summary", copy: "Create a private extractive summary without sending text to an AI server.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Summarize privately" }, translate: { title: "Translate PDF text", copy: "Translate extracted text with your browser\u2019s on-device translation engine when available.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Translate privately" }, htmltopdf: { title: "HTML to PDF", copy: "Convert an HTML or text document into a clean, printable PDF.", accept: "text/html,text/plain", multiple: false, drop: "Drop HTML or TXT here", action: "Convert to PDF" }, wordtopdf: { title: "Word to PDF", copy: "Convert DOCX text into a private browser-generated PDF.", accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", multiple: false, drop: "Drop one DOCX here", action: "Convert to PDF" }, exceltopdf: { title: "Excel to PDF", copy: "Render spreadsheet cell values into paginated PDF tables.", accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel", multiple: false, drop: "Drop one spreadsheet here", action: "Convert to PDF" }, ppttopdf: { title: "PowerPoint to PDF", copy: "Extract slide text and create one clean PDF page per slide.", accept: "application/vnd.openxmlformats-officedocument.presentationml.presentation", multiple: false, drop: "Drop one PPTX here", action: "Convert to PDF" }, pdftoword: { title: "PDF to Word", copy: "Export selectable PDF text as an editable Word-compatible document.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create Word document" }, pdftoexcel: { title: "PDF to Excel", copy: "Export page text into an editable spreadsheet with one row per line.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create spreadsheet" } });
Object.assign(configs, { duplicate: { title: "Duplicate pages", copy: "Repeat selected pages immediately after their originals.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Duplicate & download" }, deletepages: { title: "Delete pages", copy: "Remove selected pages and keep everything else.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Delete & download" }, splitcustom: { title: "Split every N pages", copy: "Create a ZIP containing consistently sized PDF chunks.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Split & download ZIP" }, booklet: { title: "Booklet layout", copy: "Impose pages for double-sided folding and saddle-stitch printing.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create booklet" }, fourup: { title: "Four-up handout", copy: "Place four document pages on each landscape sheet.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create handout" }, stamp: { title: "Approval stamp", copy: "Add a dated approval, review or draft stamp to every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Stamp & download" }, qrstamp: { title: "QR code stamp", copy: "Place a scannable URL or reference code onto every page.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Add QR code" }, sanitize: { title: "Sanitization unavailable", copy: "Verified hidden-data removal is paused until output cleanup can be independently proven.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Show limits" }, contacts: { title: "Extract contacts", copy: "Find email addresses, phone numbers and web links in selectable text.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Create contacts CSV" }, deskew: { title: "Deskew scans", copy: "Correct a consistent small tilt across scanned pages.", accept: "application/pdf", multiple: false, drop: "Drop a scanned PDF here", action: "Deskew & download" } });
Object.assign(configs, { visualorganize: { title: "Visual page organizer", copy: "Drag thumbnail pages into order, rotate them or remove them.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Apply page layout" }, targetcompress: { title: "Compress to target size", copy: "Aim for a specific upload limit with automatic quality selection.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Compress to target" }, camerascanner: { title: "Camera document scanner", copy: "Capture or select document photos, trim white borders and enhance contrast.", accept: "image/jpeg,image/png,image/webp", multiple: true, drop: "Take or choose document photos", action: "Create scanned PDF" }, privacycheck: { title: "Privacy Inspector", copy: "Inspect hidden-data signals before sharing. No sanitized copy is created.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Inspect only" }, workflow: { title: "Workflow builder", copy: "Combine repeatable document actions and save the recipe on this device.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Run saved workflow" } });
Object.assign(configs, { sensitive: { title: "Sensitive data finder", copy: "Find common personal-data patterns and permanently redact confirmed matches.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Find & redact" }, qualitycheck: { title: "Document quality check", copy: "Detect mixed page sizes, blank pages, low text coverage and scan-quality problems.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Run quality check" }, askpdf: { title: "Ask PDF locally", copy: "Find the most relevant passages for a question without uploading document text.", accept: "application/pdf", multiple: false, drop: "Drop one PDF here", action: "Find answer" }, opendoc: { title: "OpenDocument / EPUB to PDF", copy: "Convert ODT, ODS, ODP, EPUB and RTF text into a clean PDF.", accept: "application/epub+zip,application/rtf,text/rtf,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation", multiple: false, drop: "Drop ODT, ODS, ODP, EPUB or RTF", action: "Convert to PDF" } });
var extendedTools = { protect: ["Protect PDF", "Encrypt a PDF with an AES-256 password on this device."], unlock: ["Unlock PDF", "Remove encryption using the document password."], lossless: ["Lossless PDF compression", "Optimize PDF structure without rasterizing text. Size reduction varies."], recover: ["Recover damaged PDF", "Attempt local cross-reference and object recovery. Some damaged files cannot be recovered."], jpg: ["PDF to JPG", "Export each page as a JPG in a ZIP file."], docx: ["PDF to Word (DOCX)", "Export selectable text into an editable DOCX. Original layouts and images are not preserved."], xlsx: ["PDF to Excel (XLSX)", "Export extracted text rows into a real workbook, one sheet per page. Table reconstruction is approximate."], pptx: ["PDF to PowerPoint", "Preserve each page visually as a slide image. Slide content is not editable."] };
Object.assign(extendedTools, { createform: ["Create PDF forms", "Add a named text field, checkbox, dropdown, or radio group to a PDF. Existing form fields are preserved."], drawsign: ["Draw signature / freehand", "Draw an ink signature or annotation and place it on a page. This is a visual mark, not a digital certificate."], imagewatermark: ["Image watermark", "Place a PNG or JPG watermark on every PDF page."], shapes: ["Add PDF shapes", "Add a colored rectangle, ellipse, or line to a page."], visualcompare: ["Compare PDFs visually", "View corresponding pages side by side locally. This does not automatically identify every difference."], aisummary: ["AI Summarizer", "Summarize selectable text using the browser\u2019s on-device AI, when supported. A model download may be required."] });

// src/app/local-ai.mjs
function localModelStep(promise, milliseconds = 2e4) {
  let timer, expired = false;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      expired = true;
      reject(Error("The on-device AI model is not ready. Retry after its browser-managed download completes, or use another local tool."));
    }, milliseconds);
  });
  const operation = Promise.resolve(promise).then((value) => {
    if (expired) value?.destroy?.();
    return value;
  });
  return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
}

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
  const { configs: configs2, categories, select, current, files, go, status, options, downloadBlob, loadPdfJs, extractPdfText, advancedOptions } = api;
  const tools = extendedTools;
  for (const [id, [title, copy]] of Object.entries(tools)) {
    configs2[id] = { title, copy, accept: "application/pdf", multiple: id === "visualcompare", drop: id === "visualcompare" ? "Drop exactly two PDFs here" : "Drop one PDF here", action: "Process & download" };
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
    grid.append(createCatalogCard(id, configs2[id], select, group));
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
        if (!globalThis.Summarizer || typeof Summarizer.availability !== "function" || await localModelStep(Summarizer.availability({ expectedInputLanguages: ["en"], outputLanguage: "en" }), 5e3) === "unavailable") throw Error("This browser does not support on-device AI summaries. Use Smart summary for an extractive summary.");
        const model = await localModelStep(Summarizer.create({ type: "key-points", format: "markdown", length: "medium", expectedInputLanguages: ["en"], outputLanguage: "en", monitor: (m) => m.addEventListener("downloadprogress", (e) => {
          status.textContent = `Downloading local AI model: ${Math.round(e.loaded * 100)}%`;
        }) }));
        try {
          const text = (await extractPdfText(file)).join("\n");
          if (!text.trim()) throw Error("No selectable text found. Run OCR first.");
          const summary = await localModelStep(model.summarize(text));
          if (!summary?.trim() || /^Model not available in /i.test(summary.trim())) throw Error("The on-device AI model is unavailable. Use Smart summary instead.");
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
  const sidebar = document.querySelector(".sidebar"), priority = ["merge", "split", "targetcompress", "docx", "xlsx", "pptx", "wordtopdf", "exceltopdf", "ppttopdf", "jpg", "images", "edit", "shapes", "sign", "drawsign", "createform", "fillform", "protect", "unlock", "watermark", "imagewatermark", "numbers", "rotate", "crop", "visualorganize", "searchableocr", "visualcompare", "aisummary", "translate", "markdown", "lossless", "recover"];
  const buttons = [...sidebar.querySelectorAll(".tool")];
  buttons.sort((a, b) => {
    const rank = (id) => {
      const i = priority.indexOf(id);
      return i < 0 ? priority.length : i;
    };
    return rank(a.dataset.tool) - rank(b.dataset.tool);
  }).forEach((button) => sidebar.append(button));
  const count = document.createElement("span");
  count.className = "catalog-count";
  count.textContent = String(buttons.length);
  sidebar.querySelector("h2").append(count);
}
export {
  initExtended
};
