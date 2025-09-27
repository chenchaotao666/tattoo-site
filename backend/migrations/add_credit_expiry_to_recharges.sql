-- 创建积分使用日志表（可选）
CREATE TABLE IF NOT EXISTS credit_usage_logs (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    creditsUsed INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    recordsAffected INT NOT NULL DEFAULT 0,
    details JSON,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_userId (userId),
    INDEX idx_reason (reason),
    INDEX idx_createdAt (createdAt),

    CONSTRAINT fk_credit_usage_logs_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建积分清理统计表（可选）
CREATE TABLE IF NOT EXISTS credit_cleanup_stats (
    id VARCHAR(36) PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    duration VARCHAR(20),
    expiredRecordsCleaned INT DEFAULT 0,
    expiringRecordsFound INT DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    error TEXT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_timestamp (timestamp),
    INDEX idx_success (success)
);