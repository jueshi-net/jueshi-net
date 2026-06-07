import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function TopicsDynamic() {
  let topics: { title: string; desc: string; href: string; image: string; tag: string }[] = [];

  try {
    const dbTopics = await prisma.topic.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });

    if (dbTopics.length > 0) {
      topics = dbTopics.map((t, i) => ({
        title: t.title,
        desc: t.subtitle || t.summary || "精选出海场景，一站式解决方案",
        href: `/topics/${t.slug}`,
        image: t.coverImage || "https://images.unsplash.com/photo-1517940310602-26535839fe84?q=80&w=800&auto=format&fit=crop",
        tag: i === 0 ? "编辑推荐" : (t.heroBadges ? JSON.parse(t.heroBadges as any)[0]?.label || "专题" : "专题"),
      }));
    }
  } catch {
    // fallback
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">精选专题</h2>
          <p className="mt-1.5 text-sm text-gray-500">场景化解决方案，一站式指南</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 3).map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="group bg-white rounded-[20px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="relative h-48 bg-gray-100">
                <Image src={topic.image} alt={topic.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                <span className="absolute top-3 left-3 text-[11px] font-semibold text-white bg-teal-600 px-2.5 py-1 rounded-lg">
                  {topic.tag}
                </span>
              </div>
              <div className="p-5">
                <div className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                  {topic.title}
                </div>
                <div className="text-sm text-gray-500 mt-1.5 line-clamp-2">{topic.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
