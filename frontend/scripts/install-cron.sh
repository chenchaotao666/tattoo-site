#!/bin/bash

# 自动安装 sitemap cron 任务

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="tattoo-site-frontend"
CRON_COMMAND="0 3 */3 * * cd $PROJECT_DIR && npm run sitemap:build # $PROJECT_NAME"
CRON_COMMENT="# Auto-generate sitemap for $PROJECT_NAME every 3 days at 3am"

echo "🕐 Installing sitemap cron job..."

# 检查是否已存在
if crontab -l 2>/dev/null | grep -q "$PROJECT_NAME"; then
    echo "⚠️  Sitemap cron job for $PROJECT_NAME already exists!"
    echo "Current job:"
    crontab -l | grep "$PROJECT_NAME"
    echo ""
    read -p "Replace existing job? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Installation cancelled"
        exit 0
    fi

    # 移除现有任务
    echo "🗑️  Removing existing job..."
    crontab -l | grep -v "$PROJECT_NAME" | crontab -
fi

# 添加新任务
echo "➕ Adding new cron job..."
(crontab -l 2>/dev/null || true; echo "$CRON_COMMENT"; echo "$CRON_COMMAND") | crontab -

echo "✅ Sitemap cron job installed successfully!"
echo "📋 Job details:"
echo "   Schedule: Every 3 days at 3:00 AM"
echo "   Command:  $CRON_COMMAND"
echo ""
echo "📊 Current cron jobs for this project:"
crontab -l | grep "$PROJECT_NAME" || echo "No jobs found for $PROJECT_NAME"

echo ""
echo "💡 Management commands:"
echo "   npm run sitemap:cron:status     - Check status"
echo "   npm run sitemap:cron:uninstall  - Remove job"
echo "   npm run sitemap:build           - Run manually"