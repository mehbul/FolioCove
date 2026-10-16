# Prepared downloads and changed settings

A visitor could extract page 1, change Pages to keep to 2-3, and still see the previous download and success message. The file was valid for the previous settings but could be mistaken for the newly requested output.

The prepared download now clears when a tool-option input or selection changes. Its object URL is revoked and the previous success message is removed. Selecting files or changing tools retains the existing invalidation behavior. Original files and output filenames are unchanged; processing remains on-device.

The regression first failed because the old result stayed visible after changing the extraction range. After the fix it verifies that the old panel disappears, processing can run again, and the downloaded PDF contains only the new range's two synthetic page markers. Existing repeat-download and compression-size checks still pass.

Local validation: build, 77 handler cases, 88 AI-readable registry checks, three applicable root download checks, and all 22 Pages browser checks passed. The root build was restored after Pages verification. This scope does not establish physical camera capture, native phone downloads, Safari-app behavior, or arbitrary-document fidelity. Deployment and live behavior require separate completed workflow evidence.
