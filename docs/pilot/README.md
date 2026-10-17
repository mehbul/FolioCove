# First 20 task sessions

Prepared 17 October 2026. Execution materials, not evidence of recruited users or completed sessions. Small-agency administrative staff are the initial audience hypothesis: people who regularly assemble reports, invoices or client packs. No customer persona or market demand has been established.

The goal is to learn whether people can finish a useful task and choose FolioCove again. Use the current [operating priorities](../OPERATIONS.md) and [compatibility evidence](../audits/2026-10-17-browser-pilot.md). The owner supplied [mehbulislam81@gmail.com](mailto:mehbulislam81@gmail.com) as the support contact. Completed public-business notices and physical-device checks remain pending. Run a controlled synthetic-file pilot while those are resolved; do not advertise universal phone/Safari support. The public recruitment entry is [Try one task](https://mehbul.github.io/FolioCove/try/).

## Execution order

| Period | Work | Decision evidence |
| --- | --- | --- |
| Days 1–7 | Invite the first ten eligible people through owner-approved contacts/channels; observe ten sessions. Arrange actual Android, iPhone Safari and macOS Safari checks when hardware is available. | Correct outputs, help needed and the three most frequent obstacles. |
| Days 8–14 | Fix the highest-impact reproducible obstacles; verify and deploy changes. Recruit ten more testers. Start five organizational buyer conversations using [the interview script](BUYER-INTERVIEWS.md). | Second cohort outcomes, with the app version recorded privately. |
| Days 15–21 | Complete 20 initial sessions. Share the existing demo and a relevant task link in two communities whose current rules allow it, once the notice/device launch gates are resolved. Follow up only with people who opted in. | Count permitted posts, responses and observed tasks separately. |
| Days 22–30 | Ask about the participant's next naturally occurring PDF need; review repeat use and buyer evidence. Review equal Search Console reporting windows if access exists. | Actual returns, unresolved failures and one scoped paid pilot only if a buyer agrees and prerequisites are met. |

Targets: **20 distinct observed testers; at least 18/20 correct first-task completions without facilitator help; five distinct testers returning for a later real need; five buyer conversations; one paid setup pilot if demand emerges.** These are decision targets, not results or a statistical estimate of all users. Do not replace missing observations with site visits, indexing, automated tests or intentions to return.

## Recruiting and invitation

Recruit people who have done an ordinary PDF assembly task in the last month. Prefer one initial participant per organization to reduce shared-workflow bias. Ask which task they last did, what they used, and whether they can spare 15 minutes. Keep the first ten and second ten cohorts separate when comparing outcomes. Record role groups, not employer names, in the results file.

Send through the owner's existing authorized account to selected contacts, or post where recruitment/promotion is allowed. Record the destination and actual send/post outcome privately. No recipient list is supplied by this kit; a draft is not a sent invitation.

> I built FolioCove, a free, open-source PDF workspace that processes selected documents in your browser. I am looking for people who prepare reports, invoices or client packs to try one 15-minute task. We will use provided synthetic files, and I want to see where the tool is confusing. Please keep real documents closed. Would you be willing to try merge, extract pages, organize pages or images-to-PDF? Start at https://mehbul.github.io/FolioCove/try/. No account is needed. Keep originals and inspect outputs; phone/Safari validation is still incomplete. Contact: mehbulislam81@gmail.com.

Confirm privately whether they agree to notes about the task and, separately, one later follow-up. Recording or screen sharing is optional and needs their agreement; written notes are sufficient. Never ask for customer files, passwords or permission to upload documents.

## Fifteen-minute session

1. Ask: “Tell me about the last time you needed to combine or change PDF pages. What triggered it, what did you use, and what was difficult?” Avoid pitching benefits before hearing the answer.
2. Read: “We are testing the tool. Use these synthetic files, keep the originals and open the result. Please say what you expect as you go. Stop whenever you want.” Ask them to close private documents and notifications if screen sharing.
3. Give one relevant task card below and start timing when the tool and downloaded inputs are ready. Let them use the page's own help. Do not demonstrate controls or show the demo first. Record any facilitator instruction as help. After ten minutes, ask whether they want help or to stop; either outcome remains a valid observation.
4. Ask them to open the output and explain how they know it is correct. Check the success key independently. A toast or prepared download alone does not count as completion.
5. Ask: “What was hardest? What would you use for this task today? What would make this unsuitable?” Then ask whether one later follow-up is welcome. Do not solicit a positive review or testimonial.

Use the task that matches the participant's need; aim for roughly five first sessions per task so one easy workflow does not dominate. Report the actual task mix. Follow the participant's accessibility needs and usual device; accommodation is not product coaching, and any control-specific help must still be recorded.

## Task cards and facilitator success keys

All inputs below are existing synthetic examples. Download them before the timed task. If a browser displays a sample rather than saving it, use its normal Save/Download command during preparation. Record sample-download friction separately.

| ID | Give the participant this goal and link | Inputs | Success key, checked after the attempt |
| --- | --- | --- | --- |
| `merge` | “Create one PDF with the first document followed by the second.” [Merge PDFs](https://mehbul.github.io/FolioCove/merge-pdf/) | [First PDF](https://mehbul.github.io/FolioCove/examples/merge-first.pdf), [second PDF](https://mehbul.github.io/FolioCove/examples/merge-second.pdf) | Three pages labeled `FC-MERGE-A-1`, `FC-MERGE-B-1`, `FC-MERGE-B-2`, in that order. [Reference](https://mehbul.github.io/FolioCove/examples/merge-reference.pdf). |
| `split` | “Save only pages 2 through 4 of this six-page PDF in one new PDF.” [Extract pages](https://mehbul.github.io/FolioCove/split-pdf/) | [Six-page PDF](https://mehbul.github.io/FolioCove/examples/extract-six-pages.pdf) | Exactly three pages: `FC-EXTRACT-2`, `FC-EXTRACT-3`, `FC-EXTRACT-4`. No pages 1, 5 or 6. [Reference](https://mehbul.github.io/FolioCove/examples/extract-reference-2-4.pdf). |
| `organize` | “Put page 6 first, then pages 2 and 3. Leave out the other pages and save one PDF.” [Organize pages](https://mehbul.github.io/FolioCove/organize-pdf/) | [Six-page PDF](https://mehbul.github.io/FolioCove/examples/extract-six-pages.pdf) | Exactly three pages: `FC-EXTRACT-6`, `FC-EXTRACT-2`, `FC-EXTRACT-3`, in that order. |
| `images` | “Make one PDF with the example brief first and the sample invoice second.” [Images to PDF](https://mehbul.github.io/FolioCove/jpg-to-pdf/) | [Example brief PNG](https://mehbul.github.io/FolioCove/previews/brief.png), [sample invoice PNG](https://mehbul.github.io/FolioCove/previews/invoice.png) | Exactly two pages: “The main points.” brief, then “SAMPLE INVOICE”; readable, upright and uncropped. Image dimensions determine page size; no automatic A4 margins or OCR. |

The PDF labels are defined in `src/static/examples/manifest.json`. PNG provenance is in `scripts/create-catalog-assets.mjs` and `scripts/create-design-assets.mjs`; both generate illustrative content. Compare page content and order, not byte-for-byte output or an exact output size.

## Returns, evidence and decisions

Follow up once, after about a week, only with consent: “Since our session, did another PDF task come up? What did you use, and why? If you used FolioCove, did you open and check the result? Please do not send the document.” A scheduled second exercise, opening the homepage or “I would use it again” does not establish a return for a real need. Self-reported successful repeat use counts as self-reported evidence; an observed repeat counts separately. Never request the private document as proof.

Use [results-template.csv](results-template.csv) with the [schema and privacy instructions](RESULTS.md). Publish only aggregate counts after checking for re-identification risk. Count at most one first-task outcome per tester in the 18/20 measure, and each tester once toward the five-return target. Report results by task/device and facilitator help; don't conceal failed attempts after a successful retry.

Prioritize missing/corrupt downloads and wrong page order before polish. Reproduce with the provided examples, link a sanitized issue and verify the fix. Physical camera/native download/Safari results belong in the existing [device checklist](../../src/static/device-pilot.csv) and a dated audit; emulation and a human desktop session do not close those checks. Choose the next product change from repeated observed obstacles, not the size of the catalog. A theme from one session is provisional; seek independent confirmation before changing positioning.
