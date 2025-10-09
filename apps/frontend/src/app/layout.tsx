import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../providers/Providers';

export const metadata: Metadata = {
  title: 'Aicetro',
  description: 'AIcetro: Your Autonomous Treasury — autonomous AI agents for trustless corporate treasury on Monad'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-surface">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
