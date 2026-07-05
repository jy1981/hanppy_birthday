import type { Metadata, Viewport } from 'next';
import { Noto_Serif_SC, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const song = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-song',
  display: 'swap',
});

const en = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-en',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '致 彤彤 · 二周年与生辰',
  description: '一份写给你的小礼物',
  robots: { index: false, follow: false },
  icons: {
    icon: '/media/icon/icon-192.png',
    apple: '/media/icon/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: '致彤彤',
    statusBarStyle: 'black-translucent',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F5EDE0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${song.variable} ${en.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
