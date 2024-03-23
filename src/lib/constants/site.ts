import type { Metadata } from 'next';

import { MetadataExtra, Page } from '@/lib/types/site';

const title = 'savvy';
const description =
  'An interface for the EVM in the browser, to simulate & visualize onchain activity.';
const authorUrl = 'https://twitter.com/0xpolarzero';
const websiteUrl = 'https://svvy.sh';

/* -------------------------------------------------------------------------- */
/*                                  METADATA                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- BASE ---------------------------------- */
export const METADATA_BASE: Metadata = {
  title: title,
  description: description,
  applicationName: title,
  authors: { url: authorUrl, name: 'polarzero' },
  keywords: [],
  twitter: {
    site: '@svvydotsh',
  },
  icons: {
    icon: '/images/favicon.ico',
    apple: '/images/apple-touch-icon.png',
    shortcut: '/images/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // robots?
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: websiteUrl,
    siteName: title,
    title: title,
    description: description,
    emails: ['contact@polarzero.xyz'],
    images: [
      {
        url: `${websiteUrl}/og/home.png`,
        width: 1200,
        height: 630,
        alt: `${title} open-graph image`,
      },
    ],
  },
};

/* ---------------------------------- EXTRA --------------------------------- */
export const METADATA_EXTRA: MetadataExtra = {
  links: {
    github: 'https://github.com/0xpolarzero/savvy',
    twitter: 'https://twitter.com/svvydotsh',
    documentation: 'https://docs.svvy.sh',
  },
};

/* -------------------------------------------------------------------------- */
/*                                 NAVIGATION                                 */
/* -------------------------------------------------------------------------- */

export const NAVBAR: Page[] = [
  {
    name: 'documentation',
    url: METADATA_EXTRA.links.documentation,
    external: true,
  },
  // description: 'Find the most optimized airdrop solution for your use case',
];
