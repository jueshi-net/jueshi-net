import { redirect } from "next/navigation";

// v1.39.0: Legacy /workbench now redirects to unified /workspace
export default function WorkbenchRedirect() {
  redirect("/workspace");
}
