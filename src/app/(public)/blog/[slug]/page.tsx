import { redirect } from "next/navigation";

export default function BlogSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/guides/${params.slug}`);
}
