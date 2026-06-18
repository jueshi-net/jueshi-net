INSERT INTO invite_codes (code, max_uses, used_count, is_active, expires_at, note, created_by, created_at, updated_at)
VALUES 
  ('BETA2026-001', 5, 0, true, '2026-07-18 23:59:59', 'Beta 测试批次 1', 'system', NOW(), NOW()),
  ('BETA2026-002', 5, 0, true, '2026-07-18 23:59:59', 'Beta 测试批次 2', 'system', NOW(), NOW()),
  ('BETA2026-003', 5, 0, true, '2026-07-18 23:59:59', 'Beta 测试批次 3', 'system', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
