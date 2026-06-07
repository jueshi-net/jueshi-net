import { notFound } from "next/navigation";
import { getScenarioBySlug, getAllScenarioSlugs } from "@/data/scenario-packages";
import ScenarioClient from "./scenario-client";

export function generateStaticParams() {
  return getAllScenarioSlugs().map((slug) => ({ slug }));
}

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = getScenarioBySlug(slug);

  if (!pkg) {
    notFound();
  }

  return <ScenarioClient pkg={pkg} slug={slug} />;
}
