import Link from "next/link";
import { Shield, Award, Users } from "lucide-react";

const links = [
  { href: "/admin/community/reputation", label: "荣誉管理", icon: Shield },
  { href: "/admin/community/badges", label: "勋章管理", icon: Award },
];

export default function AdminCommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">社区管理</h1>
        <div className="flex gap-2 mt-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
