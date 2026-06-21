-- Add membershipTier column for separating role (permission) from membership tier
-- v1.20.42.18.4.2: Role Membership Schema Separation

-- Step 1: Add membership_tier column with default 'free'
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "membership_tier" TEXT NOT NULL DEFAULT 'free';

-- Step 2: Backfill membership_tier based on memberUntil
-- If memberUntil > NOW(), set membership_tier to 'member'
UPDATE "users" 
SET "membership_tier" = 'member' 
WHERE "memberUntil" IS NOT NULL AND "memberUntil" > NOW();

-- Step 3: Normalize role values
-- Convert ADMIN/管理员 to admin
UPDATE "users" SET "role" = 'admin' WHERE "role" IN ('ADMIN', '管理员');

-- Convert USER to user
UPDATE "users" SET "role" = 'user' WHERE "role" = 'USER';

-- Step 4: Ensure 9833416@qq.com is admin
UPDATE "users" SET "role" = 'admin', "membership_tier" = 'member' WHERE "email" = '9833416@qq.com';

-- Step 5: Convert any remaining role=member to role=user (should be 0 after v18.4.1)
UPDATE "users" SET "role" = 'user' WHERE "role" = 'member';

-- Verification queries (run after migration)
-- SELECT role, COUNT(*) FROM users GROUP BY role;
-- SELECT membership_tier, COUNT(*) FROM users GROUP BY membership_tier;
-- SELECT email, role, membership_tier, member_until FROM users WHERE email = '9833416@qq.com';
