-- 编年史说说时间统一回拨 8 小时 (数据库 UTC 存储 vs 前端展示时区差异)
UPDATE talk SET created_at = DATE_SUB(created_at, INTERVAL 8 HOUR), updated_at = DATE_SUB(updated_at, INTERVAL 8 HOUR)
WHERE user_id = 2 AND content LIKE '【2026.%';
SELECT id, created_at, LEFT(content, 24) FROM talk WHERE user_id = 2 ORDER BY created_at DESC LIMIT 6;
