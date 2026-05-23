import type { Metadata } from 'next';
import { buildCanonical, buildTitle } from '@/lib/seo';
import { auth } from '@/lib/auth';
import { UserNavSidebar } from '@/components/user/UserSidebar';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: buildTitle('账号设置'),
  description: '管理你的账户设置。',
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical('/settings') },
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <UserNavSidebar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 lg:ml-0">
        <SettingsClient
          userName={session?.user?.name || ''}
          userEmail={session?.user?.email || ''}
        />
      </div>
    </div>
  );
}
