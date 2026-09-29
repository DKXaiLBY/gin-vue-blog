UPDATE config SET value='欢迎来到我的博客，正在持续建设中…' WHERE `key`='website_notice';
UPDATE config SET value='' WHERE `key` IN ('gitee','qq');
UPDATE user_info SET intro='记录学习轨迹与项目作品' WHERE intro LIKE '%阵雨%';
SELECT `key`,value FROM config WHERE `key` IN ('website_notice','gitee','qq');
