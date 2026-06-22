import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CommunityCategoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/bbs/category/${slug}`);
}
