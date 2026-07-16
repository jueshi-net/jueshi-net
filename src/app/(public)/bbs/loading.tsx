import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { ForumHomeSkeleton } from "@/components/community/forum-skeleton";

export default function Loading() {
  return (
    <JueshiV4PublicShell>
      <ForumHomeSkeleton />
    </JueshiV4PublicShell>
  );
}
