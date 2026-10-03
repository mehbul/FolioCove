# Public discovery update — 3 October 2026

The owner authorized public search discovery. Commit b260f64 deployed successfully in GitHub Pages run 37109270407. Live homepage, sitemap and demo returned HTTP 200. The homepage has index,follow and the Google ownership meta tag; the separate root Sites build remains noindex,nofollow and was not published.

Validation: root build, 77 handler checks, AI-readiness checks and focused Pages browser workflow passed. The real synthetic-file demo downloaded a PDF verified to have two pages. Host-root robots.txt returned 404; the project robots file is informational, not the host-root policy.

Google Search Console ownership was verified using the HTML tag in the owner's signed-in session. The 18-URL sitemap submission was accepted, but the first processing result said "Couldn't fetch" / "Sitemap could not be read". A subsequent direct request returned HTTP 200 application/xml with the expected XML, including when supplying a Googlebot User-Agent; this does not establish Google's actual crawler access. Do not claim Google indexing is complete.

The public beta release and README advertise accurate limits. Tester invitation and community-launch copy are prepared in docs/LAUNCH-KIT.md. No tester invitations or community posts were sent because specific recipients and posting accounts have not been supplied. Physical-device validation remains incomplete.
