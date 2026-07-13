import type { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './settings-client';
import WorkspacePageFrame from '@/components/workspace/WorkspacePageFrame';

export const metadata: Metadata = {
  title: buildTitle('账号设置'),
  description: '管理你的账户设置。',
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical('/workspace/settings') },
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/settings");
  return (
    <WorkspacePageFrame rightRail={null}>
      <SettingsClient userName={session.user.name || ''} userEmail={session.user.email || ''} />
    </WorkspacePageFrame>
  );
}
