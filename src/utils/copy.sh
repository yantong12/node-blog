!#/bin/sh
cd /Users/qiyu/Desktop/tong-node/blog-1/logs
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log