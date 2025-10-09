#!/bin/bash

# 自动安装 sitemap cron 任务

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_COMMAND="0 3 * * 0 cd $PROJECT_DIR && npm run sitemap:build"
CRON_COMMENT="# Auto-generate sitemap every Sunday at 3am"

echo "🕐 Installing sitemap cron job..."

# 检查是否已存在
if crontab -l 2>/dev/null | grep -q "sitemap:build"; then
    echo "⚠️  Sitemap cron job already exists!"
    echo "Current job:"
    crontab -l | grep "sitemap:build"
    echo ""
    read -p "Replace existing job? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Installation cancelled"
        exit 0
    fi

    # 移除现有任务
    echo "🗑️  Removing existing job..."
    crontab -l | grep -v "sitemap:build" | crontab -
fi

# 添加新任务
echo "➕ Adding new cron job..."
(crontab -l 2>/dev/null || true; echo "$CRON_COMMENT"; echo "$CRON_COMMAND") | crontab -

echo "✅ Sitemap cron job installed successfully!"
echo "📋 Job details:"
echo "   Schedule: Every Sunday at 3:00 AM"
echo "   Command:  $CRON_COMMAND"
echo ""
echo "📊 Current cron jobs:"
crontab -l | grep -E "(sitemap|#.*sitemap)" || echo "No sitemap jobs found"

echo ""
echo "💡 Management commands:"
echo "   npm run sitemap:cron:status     - Check status"
echo "   npm run sitemap:cron:uninstall  - Remove job"
echo "   npm run sitemap:build           - Run manually"