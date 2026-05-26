import type { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import { auth } from '@/lib/auth';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: buildTitle('账号设置'),
  description: '管理你的账户设置。',
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical('/settings') },
};

export default async function SettingsPage() {
  const session = await auth();

  // Layout (workspace/layout.tsx) already provides UserNavSidebar + top bar
  return <SettingsClient userName={session?.user?.name || ''} userEmail={session?.user?.email || ''} />;
}
