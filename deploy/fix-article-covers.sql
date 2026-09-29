-- 示例文章封面指向外部图床, 统一换成本地渐变图止血
UPDATE article SET img='/covers/article_list.svg' WHERE img LIKE 'http%';
SELECT id,title,img FROM article;
