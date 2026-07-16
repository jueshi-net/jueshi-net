import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import { ForumPostDetailSkeleton } from "@/components/community/forum-skeleton";

export default function Loading() {
  return (
    <JueshiV4PublicShell>
      <ForumPostDetailSkeleton />
    </JueshiV4PublicShell>
  );
}
