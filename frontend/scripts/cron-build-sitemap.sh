#!/bin/bash

# 简单的周期构建脚本 - 通过 npm run build 重新生成 sitemap
# 建议添加到 crontab 中：
# 每12小时执行一次: 0 */12 * * * /path/to/cron-build-sitemap.sh

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 日志文件
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/build-sitemap.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🕐 Starting sitemap update via build process"

# 切换到项目目录
cd "$PROJECT_DIR" || {
    log "❌ ERROR: Cannot change to project directory: $PROJECT_DIR"
    exit 1
}

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    log "❌ ERROR: Node.js not found"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log "❌ ERROR: npm not found"
    exit 1
fi

# 构建项目（这会触发 sitemap 生成）
log "🔨 Running npm run build to regenerate sitemap..."
if npm run build >> "$LOG_FILE" 2>&1; then
    log "✅ Build completed successfully - sitemap updated"

    # 检查生成的文件
    if [[ -f "dist/sitemap.xml" ]]; then
        local file_size=$(stat -c%s "dist/sitemap.xml" 2>/dev/null || echo "unknown")
        log "📊 Generated sitemap size: ${file_size} bytes"
    fi

    log "🎉 Sitemap update completed"
else
    log "❌ Build failed - sitemap not updated"
    exit 1
fi