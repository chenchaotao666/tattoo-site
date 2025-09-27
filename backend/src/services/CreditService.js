const BaseService = require('./BaseService');

/**
 * 积分管理服务 - 基于Recharge模型
 */
class CreditService extends BaseService {
    constructor(rechargeModel, userService, creditUsageLogModel) {
        super(rechargeModel);
        this.userService = userService;
        this.creditUsageLogModel = creditUsageLogModel;
    }

    /**
     * 获取用户的总有效积分
     */
    async getUserTotalCredits(userId) {
        try {
            return await this.model.getTotalValidCreditsByUserId(userId);
        } catch (error) {
            throw new Error(`Get user total credits failed: ${error.message}`);
        }
    }

    /**
     * 获取用户的有效积分记录
     */
    async getUserValidCredits(userId) {
        try {
            return await this.model.getValidCreditsByUserId(userId);
        } catch (error) {
            throw new Error(`Get user valid credits failed: ${error.message}`);
        }
    }

    /**
     * 添加积分（购买后调用） - 这个方法主要用于更新已存在的充值记录
     */
    async addCredits(userId, credits, days, source = 'purchase', sourceId = null) {
        try {
            // 对于购买类型，sourceId应该是recharge记录的ID
            if (source === 'purchase' && sourceId) {
                // 更新现有的充值记录，设置过期时间和剩余积分
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + days);

                await this.model.updateById(sourceId, {
                    expiryDate: expiryDate,
                    validDays: days,
                    remainingCredits: credits,
                    updatedAt: new Date()
                });

                // 用户充值成功后，将用户等级升级为 pro
                if (this.userService) {
                    try {
                        const currentUser = await this.userService.model.findById(userId);
                        if (currentUser && currentUser.level !== 'pro') {
                            await this.userService.model.updateById(userId, {
                                level: 'pro',
                                updatedAt: new Date()
                            });
                            console.log(`User ${userId} upgraded to pro level after successful payment`);
                        }
                    } catch (userUpdateError) {
                        console.error(`Failed to upgrade user ${userId} to pro level:`, userUpdateError.message);
                        // 用户等级升级失败不应该影响积分添加
                    }
                }

                return {
                    id: sourceId,
                    credits,
                    expiryDate,
                    source
                };
            }

            // 对于其他类型（如系统赠送），可以创建新记录
            // 这里可以根据需要扩展
            throw new Error('Unsupported credit source type for new records');

        } catch (error) {
            throw new Error(`Add credits failed: ${error.message}`);
        }
    }

    /**
     * 扣除积分（生成纹身时调用）
     * 优先扣除最快过期的积分
     */
    async deductCredits(userId, creditsToDeduct, reason = 'tattoo_generation') {
        try {
            if (creditsToDeduct <= 0) {
                throw new Error('Credits to deduct must be positive');
            }

            // 检查用户总积分是否足够
            const totalCredits = await this.getUserTotalCredits(userId);
            if (totalCredits < creditsToDeduct) {
                throw new Error(`Insufficient credits. Available: ${totalCredits}, Required: ${creditsToDeduct}`);
            }

            // 执行扣除
            const result = await this.model.deductCredits(userId, creditsToDeduct);

            // 记录使用日志
            await this.logCreditUsage(userId, creditsToDeduct, reason, result);

            return result;
        } catch (error) {
            throw new Error(`Deduct credits failed: ${error.message}`);
        }
    }

    /**
     * 记录积分使用日志
     */
    async logCreditUsage(userId, creditsUsed, reason, deductionResult) {
        try {
            const logEntry = {
                userId: userId,
                creditsUsed: creditsUsed,
                reason: reason,
                recordsAffected: deductionResult.recordsUpdated.length,
                details: deductionResult.recordsUpdated
            };

            // 保存到积分使用日志表
            const savedLog = await this.creditUsageLogModel.create(logEntry);

            console.log('Credit usage logged:', JSON.stringify(logEntry, null, 2));

            return savedLog;
        } catch (error) {
            console.error('Log credit usage failed:', error);
            // 日志记录失败不应该影响主要功能
            // 但仍然返回logEntry用于调试
            return {
                userId: userId,
                creditsUsed: creditsUsed,
                reason: reason,
                recordsAffected: deductionResult.recordsUpdated.length,
                details: deductionResult.recordsUpdated,
                error: error.message
            };
        }
    }


    /**
     * 获取用户积分历史（基于Recharge记录）
     */
    async getUserCreditHistory(userId, options = {}) {
        try {
            return await this.model.findByUserId(userId, options);
        } catch (error) {
            throw new Error(`Get user credit history failed: ${error.message}`);
        }
    }


    /**
     * 获取用户积分使用历史
     */
    async getUserCreditUsageHistory(userId, options = {}) {
        try {
            return await this.creditUsageLogModel.findByUserId(userId, options);
        } catch (error) {
            throw new Error(`Get user credit usage history failed: ${error.message}`);
        }
    }

    /**
     * 获取用户积分使用统计
     */
    async getUserCreditUsageStats(userId) {
        try {
            return await this.creditUsageLogModel.getUserUsageStats(userId);
        } catch (error) {
            throw new Error(`Get user credit usage stats failed: ${error.message}`);
        }
    }

    /**
     * 获取积分统计信息
     */
    async getCreditStats(userId) {
        try {
            const [totalValid, validRecords, history] = await Promise.all([
                this.getUserTotalCredits(userId),
                this.getUserValidCredits(userId),
                this.getUserCreditHistory(userId, { pageSize: 1 })
            ]);

            // 计算统计信息
            const stats = {
                totalCredits: totalValid,
                activeRecords: validRecords.length,
                recordsDetails: validRecords.map(record => ({
                    id: record.id,
                    credits: record.credits,
                    initialCredits: record.initialCredits,
                    source: record.source,
                    expiryDate: record.expiryDate,
                    daysUntilExpiry: Math.ceil((new Date(record.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                })),
                totalRecords: history.pagination.total
            };

            // 按过期时间分组
            const now = new Date();
            const expiringIn7Days = validRecords.filter(r => {
                const daysUntilExpiry = (new Date(r.expiryDate) - now) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= 7;
            });
            const expiringIn30Days = validRecords.filter(r => {
                const daysUntilExpiry = (new Date(r.expiryDate) - now) / (1000 * 60 * 60 * 24);
                return daysUntilExpiry <= 30;
            });

            stats.expiringIn7Days = expiringIn7Days.length;
            stats.expiringIn30Days = expiringIn30Days.length;
            stats.creditsExpiringIn7Days = expiringIn7Days.reduce((sum, r) => sum + r.credits, 0);
            stats.creditsExpiringIn30Days = expiringIn30Days.reduce((sum, r) => sum + r.credits, 0);

            return stats;
        } catch (error) {
            throw new Error(`Get credit stats failed: ${error.message}`);
        }
    }

    /**
     * 验证用户是否有足够的积分
     */
    async validateSufficientCredits(userId, requiredCredits) {
        try {
            const totalCredits = await this.getUserTotalCredits(userId);
            return {
                sufficient: totalCredits >= requiredCredits,
                available: totalCredits,
                required: requiredCredits,
                shortfall: Math.max(0, requiredCredits - totalCredits)
            };
        } catch (error) {
            throw new Error(`Validate sufficient credits failed: ${error.message}`);
        }
    }
}

module.exports = CreditService;