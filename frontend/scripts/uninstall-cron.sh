#!/bin/bash

# 卸载 sitemap cron 任务

set -euo pipefail

echo "🗑️  Uninstalling sitemap cron job..."

# 检查是否存在
if ! crontab -l 2>/dev/null | grep -q "sitemap:build"; then
    echo "❌ No sitemap cron job found"
    exit 0
fi

# 显示即将删除的任务
echo "📋 Found existing job:"
crontab -l | grep -E "(#.*sitemap|sitemap:build)"

echo ""
read -p "Are you sure you want to remove this cron job? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Uninstall cancelled"
    exit 0
fi

# 移除任务（包括注释行）
crontab -l | grep -vE "(#.*sitemap|sitemap:build)" | crontab -

echo "✅ Sitemap cron job removed successfully!"

# 验证删除
if crontab -l 2>/dev/null | grep -q "sitemap:build"; then
    echo "⚠️  Warning: Job may still exist"
else
    echo "🎉 Confirmed: No sitemap cron jobs remaining"
fi