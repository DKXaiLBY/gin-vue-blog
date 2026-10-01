SELECT 'view_count' AS k, value FROM gvb.config WHERE `key` = 'view_count'
UNION ALL SELECT 'website_name', value FROM gvb.config WHERE `key` = 'website_name'
UNION ALL SELECT 'article_cnt', COUNT(*) FROM gvb.article
UNION ALL SELECT 'talk_cnt', COUNT(*) FROM gvb.talk
UNION ALL SELECT 'project_cnt', COUNT(*) FROM gvb.project
UNION ALL SELECT 'comment_cnt', COUNT(*) FROM gvb.comment;
SHOW TABLES FROM gvb;
