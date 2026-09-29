UPDATE config SET value='DKXaiLBY 的个人博客' WHERE `key`='website_name';
UPDATE config SET value='DKXaiLBY' WHERE `key`='website_author';
UPDATE config SET value='记录学习轨迹与项目作品' WHERE `key`='website_intro';
UPDATE config SET value='/avatar.png' WHERE `key` IN ('website_avatar','user_avatar','tourist_avatar');
UPDATE config SET value='https://github.com/DKXaiLBY' WHERE `key`='github';
UPDATE config SET value='粤ICP备XXXXXXXX号' WHERE `key`='website_record';
SELECT `key`,value FROM config WHERE `key` IN ('website_name','website_author','website_avatar','github','website_intro');
