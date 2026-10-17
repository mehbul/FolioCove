# Pilot results and private contact handling

The committed [CSV](results-template.csv) is a header-only template. It contains no participants or results. Copy it to a private owner-controlled location for live use. The app's optional local metrics remain on the participant's device; they are not a source of remotely collected adoption or retention figures.

## CSV schema

One row per observed initial attempt or later return report. Use only the values below; no names, emails, employer names, filenames, document text, raw errors, addresses, IPs or free-text notes. The same randomly assigned `tester_code` links a return to its initial session. Because a private mapping may exist, these rows are pseudonymous, not automatically anonymous or safe to publish.

| Column | Allowed values / meaning |
| --- | --- |
| `tester_code` | Locally assigned code such as `T001`, with no initials or derived identity. |
| `cohort` | `first10`, `second10`. |
| `session_week` | `week1` through `week5`; exact appointment details stay private. |
| `event_type` | `initial`, `later_need_return`, `followup_no_return`. The latter is a follow-up result, not a task failure. |
| `role_group` | `agency_admin`, `agency_owner`, `other_admin`, `other`. |
| `task_id` | `merge`, `split`, `organize`, `images`, `other`, `not_applicable`. |
| `device_family` | `windows`, `mac`, `android_phone`, `iphone`, `other`, `unknown`. |
| `browser_family` | `chrome`, `edge`, `safari`, `firefox`, `other`, `unknown`. |
| `help_level` | `none`, `site_help_only`, `facilitator_help`, `not_observed`. Site help alone still counts as unassisted. |
| `task_result` | `completed`, `failed`, `stopped`, `not_attempted`, `unknown`. Preserve a failed initial row even if a retry works. |
| `output_check` | `verified_correct`, `incorrect`, `not_checked`, `self_reported_correct`, `not_applicable`. `verified_correct` requires opening the output and checking page count/content/order. |
| `minutes_bucket` | `under2`, `2to5`, `over5to10`, `over10`, `not_observed`. |
| `blocker_category` | `none`, `discovery`, `sample_download`, `file_picker`, `settings`, `processing`, `download`, `output_quality`, `expectations`, `other`, `unknown`. Put sanitized details in a separate private note, then a public issue only if suitable. |
| `return_evidence` | `not_applicable`, `observed_later_need`, `self_reported_later_need`, `no_later_need`, `used_alternative`, `unknown`. No response is `unknown`, never a fabricated failure or return. |

No real session rows are committed with this work. Do not fill the template with synthetic participants; examples could later be mistaken for business evidence.

## Counting without inflating results

- **Initial completion:** distinct testers whose first `initial` row is `completed`, with `output_check=verified_correct` and `help_level=none` or `site_help_only`, divided by all distinct testers who started their first session. The target is at least 18 out of the planned 20. Report the actual denominator if fewer finish recruitment.
- **Actual return:** distinct initial testers with a later `later_need_return` event, `task_result=completed`, and either `observed_later_need` plus `verified_correct`, or `self_reported_later_need` plus `self_reported_correct`. Report observed and self-reported totals separately; label the combined figure as including self-report. The target is five people, with no double counting.
- **Follow-up coverage:** consenting testers contacted, replies received, later needs reported and successful returns are separate counts. Missing replies and people with no later need do not establish product rejection.
- **Buyer progress:** count five completed conversations separately from enquiries, written scopes, accepted quotes and received payments. A draft offer or positive interview is not paid demand. See [the buyer protocol](BUYER-INTERVIEWS.md).

Publish aggregate counts and sanitized recurring problems only. Avoid tiny cross-tabulations that identify one person, and do not publish quotes without explicit permission. Record which deployed version was used privately so a later fix does not erase earlier failures.

## Keep contacts out of public source and history

Prefer a private owner-controlled address book or ledger outside this repository. If a workspace-local ledger is necessary, the existing ignored `.cache/pilot-private/` path is available. Before saving anything there, run `git check-ignore .cache/pilot-private/contacts.csv` and confirm the exact file is ignored. Ignoring a path prevents ordinary Git staging; it is not encryption or a guarantee against backup/sync exposure. Never use `git add -f`, paste identities into issues, or place this ledger under `src/`, `dist/` or `docs/`.

Private ledger fields: tester/buyer code, minimal contact channel, eligibility note, invitation state/date, consent to notes, consent to one follow-up, follow-up due date, opt-out state, and deletion date. Store exact appointment/browser version and non-sensitive observation notes there only when needed. Do not copy private documents or credentials into the ledger.

Collect only the contact details needed to arrange the session. Honor opt-outs immediately; do not send another reminder. Review and delete the contact mapping and unnecessary notes within 30 days after this pilot ends unless the person separately agrees to ongoing contact. Keep only reviewed anonymous aggregate findings for public reporting. This is an operational minimization rule for this pilot, not a claim of legal compliance.
