import fs from 'node:fs/promises';
import {guidePage} from './discovery.mjs';
import {escapeHtml as e} from './ai.mjs';
import {feedbackPrompts,supportMailto} from './contact.mjs';

export async function buildPilot(){
 const base='/FolioCove';
 const feedback=e(supportMailto('iHatePDF pilot feedback',feedbackPrompts));
 const body=`<p>Help improve iHatePDF by trying one small task. No sign-up is needed. Start with the synthetic samples below; keep your own documents out of feedback. Participation is optional and does not subscribe you to messages.</p>
 <h2>Choose one five-minute task</h2>
 <ol>
 <li><h3>Combine two PDFs</h3><p><a href="${base}/merge-pdf/">Open Merge PDFs</a>, choose <strong>Try sample PDFs</strong>, then Merge &amp; download. Open the result and check for three pages in this order: <code>FC-MERGE-A-1</code>, <code>FC-MERGE-B-1</code>, <code>FC-MERGE-B-2</code>.</p></li>
 <li><h3>Keep pages 2–4</h3><p><a href="${base}/split-pdf/">Open Extract pages</a> and choose <strong>Try sample PDF</strong>. Check the selection is <code>2-4</code>, then extract and open the result. Expect three pages labeled <code>FC-EXTRACT-2</code>, <code>FC-EXTRACT-3</code> and <code>FC-EXTRACT-4</code>.</p></li>
 <li><h3>Turn two images into a PDF</h3><p>Download the synthetic <a href="${base}/previews/brief.png" download>brief image</a> and <a href="${base}/previews/invoice.png" download>invoice image</a>. <a href="${base}/jpg-to-pdf/">Open Images to PDF</a>, select the brief first and invoice second, and create a PDF. Open it and check for two pages in that order. This does not add OCR or automatic A4 margins.</p></li>
 </ol>
 <p>If the sample button cannot load, use the downloadable samples in the <a href="${base}/guides/merge-pdfs-without-uploading/">merge guide</a> or <a href="${base}/guides/extract-pages-from-pdf/">extraction guide</a>. Please report the step that failed, without attaching your own files.</p>
 <h2>Tell us what happened</h2><p><a href="${feedback}">Email your pilot feedback</a>. This opens a draft in your email app with a few short questions. Review it before sending; nothing is sent automatically. If an email app is not configured, write to <a href="${e(supportMailto('iHatePDF pilot feedback'))}">mehbulislam81@gmail.com</a> and include:</p>
 <ul><li>The tool and your browser/device.</li><li>Whether you finished without help and checked the output.</li><li>What confused you, using an invented example.</li><li>Whether this was your first visit or a return for another task.</li></ul>
 <p>Your email provider and iHatePDF receive the message and your email address when you send it. Do not send documents, filenames, private screenshots, passwords or sensitive information. Feedback is separate from on-device PDF processing. No support response time is guaranteed.</p>
 <h2>Come back when you have another task</h2><p>Bookmark the tool you found useful. If you choose to return, tell us whether it helped with another task. There are no automatic reminder emails or remote usage analytics.</p>
 <h2>Trying it on a phone?</h2><p>Check whether you can select a sample, download the result and open it in your device’s file app. Actual camera capture, native phone downloads and Safari-app behavior remain unverified. A report from your physical device helps us identify problems; automated emulation does not establish those results.</p><p><a href="${base}/support/">Get help or report a problem</a>.</p>`;
 await fs.mkdir('dist/try',{recursive:true});
 await fs.writeFile('dist/try/index.html',guidePage('','Try one PDF task in five minutes','Use synthetic sample files, inspect your download and share optional feedback by email. No app account required.',body,'try'));
}
