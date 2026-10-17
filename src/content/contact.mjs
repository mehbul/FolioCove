import {site} from './site.mjs';

// Opens the visitor's email app; this is not a feedback collection endpoint.
export function supportMailto(subject='FolioCove support',body=''){
 return `mailto:${site.supportEmail}?subject=${encodeURIComponent(subject)}${body?'&body='+encodeURIComponent(body):''}`;
}

export const feedbackPrompts=[
 'Tool tried:',
 'Browser and device (no serial numbers or identifiers):',
 'Did you finish without help? Yes / No',
 'Did you open the downloaded output and check it? Correct / Incorrect / Could not open',
 'What confused you? Use an invented example only.',
 'Is this your first visit or a return for another task?',
 '',
 'Please remove documents, filenames, private screenshots, passwords and other private information before sending.'
].join('\n');
