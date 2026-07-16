import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { ForumCategorySkeleton } from "@/components/community/forum-skeleton";

export default function Loading() {
  return (
    <JueshiV4PublicShell>
      <ForumCategorySkeleton />
    </JueshiV4PublicShell>
  );
}
