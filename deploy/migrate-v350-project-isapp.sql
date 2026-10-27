-- v3.50 迁移: project 表加 is_app 字段 + 补齐项目直达链接数据
-- LoveGirl(id=1): App, url 指 Releases 下载页 (项目未完全做好, 先指仓库发布页, 完成后换正式地址)
-- SparkKeeper(id=3): 本地优先 Web 应用, 挂 GitHub 仓库, 无公网 url
-- Tomato(id=4): App, url 已有下载页
USE gvb;
ALTER TABLE project ADD COLUMN is_app tinyint(1) NOT NULL DEFAULT 0;
UPDATE project SET is_app = 1 WHERE id IN (1, 4);
UPDATE project SET url = 'https://github.com/DKXaiLBY/lovegirl_flutter/releases' WHERE id = 1;
UPDATE project SET repo_url = 'https://github.com/DKXaiLBY/douyin-sparkkeeper' WHERE id = 3;
SELECT id, name, url, repo_url, is_app FROM project ORDER BY sort;
