import type { Metadata } from 'next';
import { Inter as FontSans, Fira_Code as FontMono } from 'next/font/google';
import '@/styles/globals.css';
import { SITE_CONFIG } from '@/lib/constants/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
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
    <html lang='en'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
