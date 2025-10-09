#!/bin/bash

# 卸载 sitemap cron 任务

set -euo pipefail

PROJECT_NAME="tattoo-site-frontend"

echo "🗑️  Uninstalling sitemap cron job for $PROJECT_NAME..."

# 检查是否存在
if ! crontab -l 2>/dev/null | grep -q "$PROJECT_NAME"; then
    echo "❌ No sitemap cron job found for $PROJECT_NAME"
    exit 0
fi

# 显示即将删除的任务
echo "📋 Found existing job:"
crontab -l | grep "$PROJECT_NAME"

echo ""
read -p "Are you sure you want to remove this cron job? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Uninstall cancelled"
    exit 0
fi

# 移除任务（包括注释行）
crontab -l | grep -v "$PROJECT_NAME" | crontab -

echo "✅ Sitemap cron job for $PROJECT_NAME removed successfully!"

# 验证删除
if crontab -l 2>/dev/null | grep -q "$PROJECT_NAME"; then
    echo "⚠️  Warning: Job may still exist"
else
    echo "🎉 Confirmed: No cron jobs remaining for $PROJECT_NAME"
fi