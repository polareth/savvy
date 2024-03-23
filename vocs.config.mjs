import { defineConfig } from 'vocs';

export default defineConfig({
  baseUrl: 'https://docs.svvy.sh',
  title: 'savvy · docs',
  titleTemplate: '%s – savvy • docs',
  description:
    'An interface for the EVM in the browser, to simulate and visualize onchain activity.',
  banner:
    "savvy is under heavy development—don't hesitate to report any issues you encounter!",
  editLink: {
    pattern: 'https://github.com/0xpolarzero/svvy/edit/main/docs/pages/:path',
    text: 'Edit on GitHub',
  },
  font: {
    google: 'Inter',
  },
  iconUrl: '/favicon.ico',
  markdown: {
    code: {
      themes: {
        light: 'poimandres',
        dark: 'poimandres',
      },
    },
  },
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/0xpolarzero/savvy',
    },
    {
      icon: 'x',
      link: 'https://twitter.com/svvydotsh',
    },
  ],
  theme: {
    colorScheme: 'system',
    variables: {
      fontFamily: {
        default: 'Inter, sans-serif',
        mono: 'Fira Code, monospace',
      },
    },
  },
  sidebar: [
    {
      text: 'Overview',
      link: '/overview',
    },
    {
      text: 'Progress',
      link: '/progress',
    },
    {
      text: 'Architecture',
      link: '/architecture',
    },
    {
      text: 'Using locally',
      link: '/using-locally',
    },
    {
      text: 'Getting started (WIP)',
      collapsed: true,
      items: [
        {
          text: 'Configuration',
          link: '/getting-started/configuration',
        },
        {
          text: 'Making a call',
          link: '/getting-started/call',
        },
        {
          text: 'Visualizing the result',
          link: '/getting-started/result',
        },
      ],
    },
    {
      text: 'Libraries (WIP)',
      collapsed: true,
      items: [
        {
          text: 'Tevm',
          link: '/libraries/tevm',
        },
        {
          text: 'WhatsABI',
          link: '/libraries/whatsabi',
        },
      ],
    },
    {
      text: 'Notes',
      link: '/notes',
    },
  ],
  topNav: [
    { text: 'Overview', link: '/overview' },
    {
      text: 'Progress',
      link: '/progress',
    },
    { text: 'savvy', link: 'https://svvy.sh' },
  ],
});
