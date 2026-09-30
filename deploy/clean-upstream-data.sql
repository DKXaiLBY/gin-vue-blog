-- 1. 删除上游 3 篇示例文章 (内容含原作者 QQ 群号等推广信息)
DELETE FROM article WHERE id IN (1, 2, 3);

-- 2. 清掉用户资料里的原作者官网链接
UPDATE user_info SET website='' WHERE website LIKE '%hahacode%';

-- 3. 备案号占位符置空 (页脚会自动隐藏, 等真实备案后再填)
UPDATE config SET value='' WHERE `key`='website_record';

-- 4. 确认 article_tag / comment 等关联随文章删除 (外键级联则无残留)
SELECT id, title FROM article;
SELECT COUNT(*) AS leftover_hahacode FROM user_info WHERE website LIKE '%hahacode%';
