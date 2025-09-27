const cron = require('node-cron');

/**
 * 积分清理定时任务服务
 */
class CreditCleanupService {
    constructor(creditService) {
        this.creditService = creditService;
        this.isRunning = false;
        this.cleanupJob = null;
    }

    /**
     * 启动定时清理任务
     * 每天凌晨2点执行一次积分过期清理
     */
    start() {
        if (this.isRunning) {
            console.log('Credit cleanup service is already running');
            return;
        }

        console.log('Starting credit cleanup service...');

        // 每天凌晨2点执行
        this.cleanupJob = cron.schedule('0 2 * * *', async () => {
            await this.performCleanup();
        }, {
            scheduled: true,
            timezone: "UTC"
        });

        this.isRunning = true;
        console.log('Credit cleanup service started. Next cleanup at 2:00 AM UTC daily.');
    }

    /**
     * 停止定时清理任务
     */
    stop() {
        if (!this.isRunning) {
            console.log('Credit cleanup service is not running');
            return;
        }

        if (this.cleanupJob) {
            this.cleanupJob.destroy();
            this.cleanupJob = null;
        }

        this.isRunning = false;
        console.log('Credit cleanup service stopped');
    }

    /**
     * 手动执行清理任务
     */
    async performCleanup() {
        try {
            console.log('Starting credit cleanup task...');
            const startTime = new Date();

            // 获取即将过期的积分（用于提醒）
            const expiringCredits = await this.creditService.getCreditsExpiringWithinDays(7);
            console.log(`Found ${expiringCredits.length} credit records expiring within 7 days`);

            // 发送过期提醒邮件（如果需要）
            if (expiringCredits.length > 0) {
                await this.sendExpirationReminders(expiringCredits);
            }

            // 清理已过期的积分
            const cleanedUpCount = await this.creditService.cleanupExpiredCredits();
            console.log(`Cleaned up ${cleanedUpCount} expired credit records`);

            // 记录清理统计
            const endTime = new Date();
            const duration = endTime - startTime;

            const cleanupStats = {
                timestamp: endTime.toISOString(),
                duration: `${duration}ms`,
                expiredRecordsCleaned: cleanedUpCount,
                expiringRecordsFound: expiringCredits.length,
                success: true
            };

            console.log('Credit cleanup completed:', cleanupStats);

            // 可以将统计信息存储到数据库
            // await this.saveCleanupStats(cleanupStats);

            return cleanupStats;

        } catch (error) {
            console.error('Credit cleanup task failed:', error);

            const errorStats = {
                timestamp: new Date().toISOString(),
                error: error.message,
                success: false
            };

            // 可以将错误信息存储到数据库
            // await this.saveCleanupStats(errorStats);

            throw error;
        }
    }

    /**
     * 发送过期提醒邮件
     */
    async sendExpirationReminders(expiringCredits) {
        try {
            // 按用户分组
            const userCredits = {};
            expiringCredits.forEach(credit => {
                if (!userCredits[credit.userId]) {
                    userCredits[credit.userId] = {
                        email: credit.email,
                        username: credit.username,
                        records: []
                    };
                }
                userCredits[credit.userId].records.push(credit);
            });

            console.log(`Sending expiration reminders to ${Object.keys(userCredits).length} users`);

            // 为每个用户发送提醒邮件
            for (const [userId, userData] of Object.entries(userCredits)) {
                try {
                    await this.sendUserExpirationReminder(userId, userData);
                } catch (error) {
                    console.error(`Failed to send expiration reminder to user ${userId}:`, error);
                    // 单个用户邮件发送失败不应该影响整个清理任务
                }
            }

        } catch (error) {
            console.error('Send expiration reminders failed:', error);
            // 邮件发送失败不应该影响积分清理
        }
    }

    /**
     * 发送单个用户的过期提醒邮件
     */
    async sendUserExpirationReminder(userId, userData) {
        // 这里可以集成邮件服务（如SendGrid、AWS SES等）
        // 暂时只记录日志

        const totalExpiringCredits = userData.records.reduce((sum, record) => sum + record.credits, 0);
        const earliestExpiry = new Date(Math.min(...userData.records.map(r => new Date(r.expiryDate))));

        const reminderData = {
            userId: userId,
            email: userData.email,
            username: userData.username,
            totalExpiringCredits: totalExpiringCredits,
            recordsCount: userData.records.length,
            earliestExpiry: earliestExpiry.toISOString(),
            message: `Dear ${userData.username}, you have ${totalExpiringCredits} credits expiring soon. Please use them before ${earliestExpiry.toLocaleDateString()}.`
        };

        console.log('Credit expiration reminder:', reminderData);

        // 实际发送邮件的代码
        // await this.emailService.sendExpirationReminder(reminderData);
    }

    /**
     * 获取清理服务状态
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            nextRun: this.cleanupJob ? this.cleanupJob.nextDate() : null,
            cronExpression: '0 2 * * *', // 每天凌晨2点
            timezone: 'UTC'
        };
    }

    /**
     * 保存清理统计信息（可选）
     */
    async saveCleanupStats(stats) {
        try {
            // 这里可以将统计信息保存到数据库
            // await this.cleanupStatsModel.create(stats);
            console.log('Cleanup stats saved:', stats);
        } catch (error) {
            console.error('Save cleanup stats failed:', error);
        }
    }
}

module.exports = CreditCleanupService;