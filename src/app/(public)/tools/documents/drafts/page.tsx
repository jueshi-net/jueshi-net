import { permanentRedirect } from "next/navigation";

export default function DraftsRedirect() {
  permanentRedirect("/dashboard/documents");
}
