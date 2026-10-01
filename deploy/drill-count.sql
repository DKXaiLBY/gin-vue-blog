SELECT 'article' AS tbl, COUNT(*) AS cnt FROM drill_restore.article
UNION ALL SELECT 'talk', COUNT(*) FROM drill_restore.talk
UNION ALL SELECT 'project', COUNT(*) FROM drill_restore.project
UNION ALL SELECT 'user', COUNT(*) FROM drill_restore.user
UNION ALL SELECT 'config', COUNT(*) FROM drill_restore.config;
