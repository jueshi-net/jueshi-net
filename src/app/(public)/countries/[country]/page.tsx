import { redirect } from "next/navigation";

// Slug aliases: countries config uses different slugs than destinations DB
const SLUG_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
};

export function generateStaticParams() {
  return [];
}

export default async function CountryRedirectPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const destSlug = SLUG_ALIASES[country] || country;
  redirect(`/destinations/${destSlug}`);
}
