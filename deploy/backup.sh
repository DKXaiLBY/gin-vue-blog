#!/bin/bash
# 博客自动备份: MySQL 全库 + 上传图片, 保留 7 天
# 凭据零落盘: 密码直接取 gvb-mysql 容器自身环境变量
set -e
DATE=$(date +%Y%m%d)
BACKUP_DIR=/opt/backups

docker exec gvb-mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --databases gvb' | gzip > "$BACKUP_DIR/gvb-db-$DATE.sql.gz"
tar -czf "$BACKUP_DIR/gvb-uploads-$DATE.tar.gz" -C /opt/blog/deploy/start/gvb file 2>/dev/null || true

find "$BACKUP_DIR" -name "gvb-*" -mtime +7 -delete
echo "backup done: $(ls -lh $BACKUP_DIR | tail -2)"
