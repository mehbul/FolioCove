# Refreshed short browser compatibility pilot

The current root build passed 24 scoped checks on Windows-hosted Playwright: eight each for Pixel 7 Chromium emulation, iPhone 13 WebKit emulation and desktop WebKit 26.6. The first attempt could not launch WebKit because its executable was absent. Installing Playwright WebKit resolved the environment problem; all 24 checks then passed.

The pilot covers synthetic merge/split, photo import to PDF, text edit and typed signature outputs, unavailable local AI, capture-input configuration, empty selection, malformed photos, pre-processing feature limits and changed extraction settings. The latter checks that the previous download clears and only the updated page range is present in the next output.

General CI now installs Chromium and WebKit and runs this short pilot after its existing handler and Chromium checks. Linux-hosted CI results must be confirmed from that commit's completed workflow; the local Windows result does not prove Linux execution.

This is engine/emulation evidence only. No physical phone camera permissions/capture, native file picker, Files/Downloads opening, actual Safari app or human task completion was tested. Those gates remain pending, together with the general support inbox and finalized business notices. No customer documents or remote analytics were introduced.
