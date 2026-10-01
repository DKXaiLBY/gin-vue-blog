SET NAMES utf8mb4;
SELECT 'name_raw' AS k, HEX(value) FROM gvb.config WHERE `key` = 'website_name';
SELECT 'intro', value FROM gvb.config WHERE `key` = 'website_intro';
SELECT 'name', value FROM gvb.config WHERE `key` = 'website_name';
SELECT 'notice', LEFT(value, 60) FROM gvb.config WHERE `key` = 'website_notice';
SELECT 'about_head', LEFT(value, 60) FROM gvb.config WHERE `key` = 'about';
SELECT 'article_title', title FROM gvb.article LIMIT 1;
SELECT 'talk_first', LEFT(content, 60) FROM gvb.talk ORDER BY id LIMIT 1;
