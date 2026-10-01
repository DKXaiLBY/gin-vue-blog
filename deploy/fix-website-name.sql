UPDATE gvb.config SET value = '阵雨' WHERE `key` = 'website_name';
SELECT `key`, value FROM gvb.config WHERE `key` IN ('website_name', 'website_author', 'website_intro', 'website_createtime') ORDER BY `key`;
