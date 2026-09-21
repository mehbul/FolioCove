import { test, expect } from '@playwright/test';
import { installPageGuards, expectNoGuardViolations, openTool } from './helpers.mjs';

const routes = [
  { route: '/merge-pdf/', title: 'Merge PDFs', action: 'Merge & download', accept: 'application/pdf' },
  { route: '/split-pdf/', title: 'Extract pages', action: 'Extract & download', accept: 'application/pdf', label: 'Pages to keep' },
  { route: '/organize-pdf/', title: 'Visual page organizer', action: 'Apply page layout', accept: 'application/pdf' },
  { route: '/compress-pdf/', title: 'Compress to target size', action: 'Compress to target', accept: 'application/pdf', label: 'Maximum size' },
  { route: '/scan-pdf/', title: 'Camera document scanner', action: 'Create scanned PDF', accept: 'image/jpeg,image/png,image/webp', label: 'Enhancement' },
  { route: '/ocr-pdf/', title: 'Searchable OCR PDF', action: 'Create searchable PDF', accept: 'application/pdf' },
  { route: '/edit-pdf/', title: 'Edit PDF', action: 'Apply edit', accept: 'application/pdf', label: 'Text' },
  { route: '/sign-pdf/', title: 'Sign PDF', action: 'Sign & download', accept: 'application/pdf', label: 'Signer name' },
  { route: '/redact-pdf/', title: 'Secure redact', action: 'Redact & download', accept: 'application/pdf', label: 'Left %' },
  { route: '/privacy-inspector/', title: 'Privacy Inspector', action: 'Inspect & make safe', accept: 'application/pdf', labelText: 'Download a sanitized sharing copy' }
];

test.describe('direct core routes', () => {
  for (const spec of routes) {
    test(`${spec.route} selects ${spec.title} and exposes controls`, async ({ page }) => {
      const guards = installPageGuards(page);
      await openTool(page, spec.route, spec.title);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
      await expect(page.getByTestId('file-input')).toHaveAttribute('accept', spec.accept);
      await expect(page.getByTestId('run-tool')).toHaveText(spec.action);
      await expect(page.getByTestId('tool-limit')).not.toBeEmpty();
      if (spec.label) await expect(page.getByLabel(spec.label)).toBeVisible();
      if (spec.labelText) await expect(page.getByLabel(spec.labelText)).toBeVisible();
      await expectNoGuardViolations(guards);
    });
  }
});