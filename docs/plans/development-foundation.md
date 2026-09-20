# PrivyPDF development foundation

## Global constraints

- Preserve PrivyPDF's browser-first, device-local document-processing model. Do not add document uploads, remote analytics, accounts, payments, or deployment in this plan.
- Keep the existing private Sites configuration in `.openai/hosting.json` and preserve all existing tool routes and beta/legal pages.
- Keep generated deployable output in `dist/`, while placing editable application source in a clearly named source directory.
- Pin direct runtime and development dependency versions exactly; do not commit `node_modules`.
- Support Windows development with Node.js 24 and npm.
- Retain the current 77-handler test coverage and add meaningful checks for the new build/development workflow.
- Keep the existing public-facing beta warnings and `noindex,nofollow` behavior.

## Task 1: Establish the local development foundation

Convert the transferred static prototype into a conventional, reproducible Node project.

Requirements:

1. Add `package.json` and a lockfile with exact dependency versions. Provide working `npm run dev`, `npm run build`, and `npm test` commands. The development command must serve the app locally; the build must reproducibly generate the deployable `dist/` tree.
2. Separate editable source from generated output. Move or reconstruct the editable homepage, styles, JavaScript modules, route metadata, and documentation-page content under `src/` (or an equivalently clear source directory). `dist/` must be generated from source rather than remaining the only editable implementation. Avoid a framework migration or visual redesign.
3. Bundle browser dependencies locally through the build so normal PDF processing does not fetch executable JavaScript from third-party CDNs at runtime. OCR language-model downloads may remain external if clearly documented. Preserve browser-only processing.
4. Add a clear `README.md` for Windows setup, local development, build, test, project structure, privacy model, and known limitations.
5. Extend `.gitignore` for generated/local files without ignoring tracked deployable artifacts required by the existing hosting setup.
6. Add a GitHub Actions workflow that installs with `npm ci`, builds, and runs the tests on pushes and pull requests. Use a current supported Node release compatible with local Node 24.
7. Update tests so they run solely from declared project dependencies and verify that the build produces the expected 10 tool routes and 5 documentation routes. Tests must not rely on `CODEX_PRIMARY_RUNTIME_NODE_MODULES`.
8. Run `npm ci`, `npm run build`, and `npm test`. Confirm the generated tree has no unintended changes or document-upload endpoints. Commit all work on the current feature branch with a descriptive commit message.

Report the exact commands and results, changed architecture, any remaining external runtime requests, and concerns.

## Task 2: Verify the ten core tools in real browsers

This task will be dispatched only after Task 1 passes review. Add automated browser coverage for the ten core routes and representative synthetic documents, test Chrome and Edge locally where available, record unsupported checks honestly, and fix defects revealed by the tests without expanding into accounts, billing, public launch, or production deployment.
