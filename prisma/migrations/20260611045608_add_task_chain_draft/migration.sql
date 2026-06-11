-- CreateTable
CREATE TABLE "task_chain_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source_tool" TEXT NOT NULL,
    "last_active_tool" TEXT,
    "context" JSONB NOT NULL,
    "linked_draft_hints" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "task_chain_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_chain_drafts_user_id_idx" ON "task_chain_drafts"("user_id");

-- CreateIndex
CREATE INDEX "task_chain_drafts_user_id_status_idx" ON "task_chain_drafts"("user_id", "status");

-- CreateIndex
CREATE INDEX "task_chain_drafts_created_at_idx" ON "task_chain_drafts"("created_at");

-- CreateIndex
CREATE INDEX "task_chain_drafts_updated_at_idx" ON "task_chain_drafts"("updated_at");

-- AddForeignKey
ALTER TABLE "task_chain_drafts" ADD CONSTRAINT "task_chain_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
