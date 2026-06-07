import ToolCard from "./tool-card";
import ToolEmptyState from "./tool-empty-state";
import { ToolCenterItem } from "@/lib/tool-center";

interface ToolGridProps {
  tools: ToolCenterItem[];
  query?: string;
}

export default function ToolGrid({ tools, query }: ToolGridProps) {
  if (tools.length === 0) {
    return <ToolEmptyState query={query} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
