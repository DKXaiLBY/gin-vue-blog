-- v3.49 前置清理: 站名定稿 DKXaiLBY (上游种子遗留旧名, 用户已确认弃用)
USE gvb;
UPDATE config SET value = 'DKXaiLBY' WHERE `key` = 'website_name';
SELECT `key`, value FROM config WHERE `key` IN ('website_name', 'website_author', 'website_notice');
