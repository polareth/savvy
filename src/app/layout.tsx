import { Viewport } from 'next';
import { Fira_Code as FontMono, Inter as FontSans } from 'next/font/google';

import '@/styles/globals.css';

import { METADATA_BASE } from '@/lib/constants/site';
import { cn } from '@/lib/utils';

import { Analytics } from '@/components/config/analytics';
import { ThemeProvider } from '@/components/config/providers';
import { ThemeSwitcher } from '@/components/config/theme-switcher';
import BaseLayout from '@/components/layouts/base';
import ContainerLayout from '@/components/layouts/container';
import { Toaster } from '@/components/ui/sonner';

export const metadata = METADATA_BASE;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BaseLayout>
            <ContainerLayout>{children}</ContainerLayout>
          </BaseLayout>
          <ThemeSwitcher />
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
