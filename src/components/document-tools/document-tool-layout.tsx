/**
 * Document Tool Layout — split layout for form + preview.
 */

"use client";

interface DocumentToolLayoutProps {
  showPreview: boolean;
  form: React.ReactNode;
  preview: React.ReactNode;
}

export default function DocumentToolLayout({ showPreview, form, preview }: DocumentToolLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
        <div className="space-y-4 min-w-0">{form}</div>
        {showPreview && (
          <div className="lg:sticky lg:top-20 self-start">{preview}</div>
        )}
      </div>
    </div>
  );
}
