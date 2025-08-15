import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
export const metadata: Metadata = {
  title: 'MedMeet — Study, Share, Connect',
  description: 'A hub for healthcare learners: reels, notes, resources, jobs.',
  icons: [{ rel: 'icon', url: '/favicon.svg' }]
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><Nav /><main className="container py-6 space-y-6">{children}</main></body></html>);
}
