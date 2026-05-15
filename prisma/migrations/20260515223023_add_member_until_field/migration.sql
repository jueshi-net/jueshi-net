-- Add memberUntil field to User
ALTER TABLE "users" ADD COLUMN "member_until" TIMESTAMP(3);
