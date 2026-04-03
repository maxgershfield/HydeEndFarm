import NavbarClient from 'components/layout/navbar/navbar-client';
import { DM_Sans, Libre_Baskerville } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';

const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const siteName = SITE_NAME ?? 'Hyde End Cellar Door';
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: 'Buy wine direct from Hyde End Farm Vineyard, Berkshire.',
  robots: {
    follow: true,
    index: true
  },
  ...(TWITTER_CREATOR &&
    TWITTER_SITE && {
      twitter: {
        card: 'summary_large_image',
        creator: TWITTER_CREATOR,
        site: TWITTER_SITE
      }
    })
};

const libre = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre'
});

const dm = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm'
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${libre.variable} ${dm.variable}`}>
      <body className="min-h-screen bg-hev-void text-hev-text selection:bg-hev-gold selection:text-hev-void font-sans antialiased">
        <NavbarClient />
        <main>{children}</main>
      </body>
    </html>
  );
}
