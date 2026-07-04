import type { Metadata, Viewport } from 'next';
import {
  Noto_Serif_SC,
  Noto_Sans_SC,
  Ma_Shan_Zheng,
  ZCOOL_XiaoWei,
  Cormorant_Garamond,
  Long_Cang,
} from 'next/font/google';
import './globals.css';

const song = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-song',
  display: 'swap',
});

const hei = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-hei',
  display: 'swap',
});

const hand = Ma_Shan_Zheng({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-hand',
  display: 'swap',
});

const xiaowei = ZCOOL_XiaoWei({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-xiaowei',
  display: 'swap',
});

const longcang = Long_Cang({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-longcang',
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
      className={`${song.variable} ${hei.variable} ${hand.variable} ${xiaowei.variable} ${longcang.variable} ${en.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
