import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../providers/Providers';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';

export const metadata: Metadata = {
  title: 'AIcetro | AI-Powered DeFi Treasury Management',
  description: 'AI-powered treasury management with ERC-4337 smart accounts on Monad',
  applicationName: 'AIcetro',
  appleWebApp: {
    capable: true,
    title: 'AIcetro',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#346ef0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-surface">
      <head>
        {/* Yandex.Metrika will be injected here via Script component */}
      </head>
      <body>
        <YandexMetrika />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
