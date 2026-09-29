ALTER TABLE config MODIFY `value` VARCHAR(5000);
UPDATE config SET value='2026-09-28 22:00:00' WHERE `key`='website_createtime';
SELECT `key`, LEFT(value,40) AS head FROM config WHERE `key` IN ('website_createtime','about');
