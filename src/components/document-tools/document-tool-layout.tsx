/**
 * Document Tool Layout
 * 
 * Standard two-column layout for document tools.
 * Desktop: Form (Left) + Preview (Right)
 * Mobile: Single column, stacked.
 * 
 * Usage:
 * <DocumentToolLayout
 *   showPreview={showPreview}
 *   form={<FormContent />}
 *   preview={<PreviewContent />}
 * />
 */

interface DocumentToolLayoutProps {
  /** Whether preview panel should be visible */
  showPreview: boolean;
  /** Form content (Left column on desktop) */
  form: React.ReactNode;
  /** Preview content (Right column on desktop) */
  preview: React.ReactNode;
}

export default function DocumentToolLayout({ showPreview, form, preview }: DocumentToolLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Form Column */}
        <div className="space-y-4 min-w-0">
          {form}
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="lg:sticky lg:top-20 self-start">
            {preview}
          </div>
        )}
      </div>
    </div>
  );
}
