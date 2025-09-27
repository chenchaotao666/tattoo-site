const BaseModel = require('./BaseModel');

class Recharge extends BaseModel {
    constructor(db) {
        super(db, 'recharges');
    }

    // 根据用户ID查找充值记录
    async findByUserId(userId, options = {}) {
        try {
            const filters = { ...options.filters, userId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find recharges by user failed: ${error.message}`);
        }
    }

    // 根据订单ID查找充值记录
    async findByOrderId(orderId) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE orderId = ?`;
            const [rows] = await this.db.execute(query, [orderId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find recharge by order ID failed: ${error.message}`);
        }
    }

    // 获取用户充值统计
    async getUserRechargeStats(userId) {
        try {
            const query = `
                SELECT
                    COUNT(*) as totalRecharges,
                    SUM(amount) as totalAmount,
                    SUM(creditsAdded) as totalCredits,
                    AVG(amount) as avgAmount,
                    MAX(createdAt) as lastRechargeDate
                FROM ${this.tableName}
                WHERE userId = ? AND status = 'success'
            `;
            const [rows] = await this.db.execute(query, [userId]);
            return rows[0];
        } catch (error) {
            throw new Error(`Get user recharge stats failed: ${error.message}`);
        }
    }

    // 按状态查找充值记录
    async findByStatus(status, options = {}) {
        try {
            const filters = { ...options.filters, status };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find recharges by status failed: ${error.message}`);
        }
    }

    // 根据捕获ID查找充值记录
    async findByCaptureId(captureId) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE captureId = ?`;
            const [rows] = await this.db.execute(query, [captureId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find recharge by capture ID failed: ${error.message}`);
        }
    }

    // 按捕获状态查找充值记录
    async findByCaptureStatus(captureStatus, options = {}) {
        try {
            const filters = { ...options.filters, captureStatus };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find recharges by capture status failed: ${error.message}`);
        }
    }

    // 查找使用vault token的充值记录
    async findVaultTokenRecharges(options = {}) {
        try {
            const filters = { ...options.filters, vaultTokenUsed: 1 };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find vault token recharges failed: ${error.message}`);
        }
    }

    // ==================== 新增积分管理功能 ====================

    /**
     * 根据用户ID获取有效积分记录（按过期时间排序）
     */
    async getValidCreditsByUserId(userId) {
        try {
            const query = `
                SELECT * FROM ${this.tableName}
                WHERE userId = ?
                AND remainingCredits > 0
                AND status = 'success'
                AND (expiryDate IS NULL OR expiryDate > NOW())
                ORDER BY expiryDate ASC
            `;
            const [rows] = await this.db.execute(query, [userId]);
            return rows;
        } catch (error) {
            throw new Error(`Get valid credits by user ID failed: ${error.message}`);
        }
    }

    /**
     * 根据用户ID获取用户总有效积分
     */
    async getTotalValidCreditsByUserId(userId) {
        try {
            const query = `
                SELECT COALESCE(SUM(remainingCredits), 0) as totalCredits
                FROM ${this.tableName}
                WHERE userId = ?
                AND remainingCredits > 0
                AND status = 'success'
                AND (expiryDate IS NULL OR expiryDate > NOW())
            `;
            const [rows] = await this.db.execute(query, [userId]);
            return rows[0].totalCredits;
        } catch (error) {
            throw new Error(`Get total valid credits by user ID failed: ${error.message}`);
        }
    }

    /**
     * 扣除积分（优先扣除最快过期的积分）
     */
    async deductCredits(userId, creditsToDeduct) {
        try {
            if (creditsToDeduct <= 0) {
                throw new Error('Credits to deduct must be positive');
            }

            // 获取用户的有效积分记录，按过期时间排序（最快过期的在前）
            const creditRecords = await this.getValidCreditsByUserId(userId);

            if (creditRecords.length === 0) {
                throw new Error('No valid credits available');
            }

            // 计算总可用积分
            const totalAvailable = creditRecords.reduce((sum, record) => sum + record.remainingCredits, 0);

            if (totalAvailable < creditsToDeduct) {
                throw new Error('Insufficient credits');
            }

            let remainingToDeduct = creditsToDeduct;
            const updatedRecords = [];

            // 按过期时间顺序扣除积分
            for (const record of creditRecords) {
                if (remainingToDeduct <= 0) break;

                const deductFromThisRecord = Math.min(record.remainingCredits, remainingToDeduct);
                const newRemainingCredits = record.remainingCredits - deductFromThisRecord;

                // 更新积分记录
                await this.updateById(record.id, {
                    remainingCredits: newRemainingCredits,
                    updatedAt: new Date()
                });

                updatedRecords.push({
                    recordId: record.id,
                    deducted: deductFromThisRecord,
                    remaining: newRemainingCredits,
                    expiryDate: record.expiryDate
                });

                remainingToDeduct -= deductFromThisRecord;
            }

            return {
                totalDeducted: creditsToDeduct,
                recordsUpdated: updatedRecords,
                remainingCredits: await this.getTotalValidCreditsByUserId(userId)
            };

        } catch (error) {
            throw new Error(`Deduct credits failed: ${error.message}`);
        }
    }

    /**
     * 获取过期的积分记录
     */
    async getExpiredCredits(limit = 1000) {
        try {
            const query = `
                SELECT * FROM ${this.tableName}
                WHERE remainingCredits > 0
                AND status = 'success'
                AND expiryDate IS NOT NULL
                AND expiryDate <= NOW()
                LIMIT ?
            `;
            const [rows] = await this.db.execute(query, [limit]);
            return rows;
        } catch (error) {
            throw new Error(`Get expired credits failed: ${error.message}`);
        }
    }

    /**
     * 清理过期积分
     */
    async cleanupExpiredCredits() {
        try {
            const query = `
                UPDATE ${this.tableName}
                SET remainingCredits = 0, updatedAt = NOW()
                WHERE remainingCredits > 0
                AND status = 'success'
                AND expiryDate IS NOT NULL
                AND expiryDate <= NOW()
            `;
            const [result] = await this.db.execute(query);
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Cleanup expired credits failed: ${error.message}`);
        }
    }

    /**
     * 获取即将过期的积分记录（用于提醒）
     */
    async getCreditsExpiringWithinDays(days = 7) {
        try {
            const query = `
                SELECT r.*, u.email, u.username
                FROM ${this.tableName} r
                LEFT JOIN users u ON r.userId = u.id
                WHERE r.remainingCredits > 0
                AND r.status = 'success'
                AND r.expiryDate IS NOT NULL
                AND r.expiryDate > NOW()
                AND r.expiryDate <= DATE_ADD(NOW(), INTERVAL ? DAY)
                ORDER BY r.expiryDate ASC
            `;
            const [rows] = await this.db.execute(query, [days]);
            return rows;
        } catch (error) {
            throw new Error(`Get credits expiring within days failed: ${error.message}`);
        }
    }
}

module.exports = Recharge;