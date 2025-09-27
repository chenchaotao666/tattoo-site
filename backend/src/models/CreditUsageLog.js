const BaseModel = require('./BaseModel');

class CreditUsageLog extends BaseModel {
    constructor(db) {
        super(db, 'credit_usage_logs');
    }

    // 根据用户ID查找积分使用记录
    async findByUserId(userId, options = {}) {
        try {
            const filters = { ...options.filters, userId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find credit usage logs by user failed: ${error.message}`);
        }
    }

    // 根据使用原因查找记录
    async findByReason(reason, options = {}) {
        try {
            const filters = { ...options.filters, reason };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find credit usage logs by reason failed: ${error.message}`);
        }
    }

    // 获取用户积分使用统计
    async getUserUsageStats(userId) {
        try {
            const query = `
                SELECT
                    COUNT(*) as totalUsageCount,
                    SUM(creditsUsed) as totalCreditsUsed,
                    AVG(creditsUsed) as avgCreditsUsed,
                    MAX(createdAt) as lastUsageDate,
                    MIN(createdAt) as firstUsageDate
                FROM ${this.tableName}
                WHERE userId = ?
            `;
            const [rows] = await this.db.execute(query, [userId]);
            return rows[0];
        } catch (error) {
            throw new Error(`Get user usage stats failed: ${error.message}`);
        }
    }

    // 按原因统计积分使用
    async getUsageStatsByReason(options = {}) {
        try {
            const { startDate, endDate, userId } = options;
            let query = `
                SELECT
                    reason,
                    COUNT(*) as usageCount,
                    SUM(creditsUsed) as totalCreditsUsed,
                    AVG(creditsUsed) as avgCreditsUsed
                FROM ${this.tableName}
                WHERE 1=1
            `;
            const values = [];

            if (userId) {
                query += ' AND userId = ?';
                values.push(userId);
            }

            if (startDate) {
                query += ' AND createdAt >= ?';
                values.push(startDate);
            }

            if (endDate) {
                query += ' AND createdAt <= ?';
                values.push(endDate);
            }

            query += ' GROUP BY reason ORDER BY totalCreditsUsed DESC';

            const [rows] = await this.db.execute(query, values);
            return rows;
        } catch (error) {
            throw new Error(`Get usage stats by reason failed: ${error.message}`);
        }
    }

    // 获取时间范围内的积分使用记录
    async findByDateRange(startDate, endDate, options = {}) {
        try {
            const filters = {
                ...options.filters,
                createdAt: {
                    operator: '>=',
                    value: startDate
                }
            };

            // 如果有结束日期，需要手动构建查询
            if (endDate) {
                const { currentPage, pageSize, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

                let query = `
                    SELECT * FROM ${this.tableName}
                    WHERE createdAt >= ? AND createdAt <= ?
                `;
                const values = [startDate, endDate];

                // 添加其他过滤条件
                if (options.filters) {
                    Object.entries(options.filters).forEach(([key, value]) => {
                        if (key !== 'createdAt' && value !== undefined && value !== null && value !== '') {
                            query += ` AND ${key} = ?`;
                            values.push(value);
                        }
                    });
                }

                // 添加排序
                query += ` ORDER BY ${sortBy} ${sortOrder}`;

                // 添加分页
                if (currentPage && pageSize) {
                    const offset = (currentPage - 1) * pageSize;
                    query += ` LIMIT ${pageSize} OFFSET ${offset}`;
                }

                const [rows] = await this.db.execute(query, values);

                const result = { data: rows };

                // 计算总数（如果需要分页信息）
                if (currentPage && pageSize) {
                    const countQuery = `
                        SELECT COUNT(*) as total FROM ${this.tableName}
                        WHERE createdAt >= ? AND createdAt <= ?
                    `;
                    let countValues = [startDate, endDate];

                    if (options.filters) {
                        Object.entries(options.filters).forEach(([key, value]) => {
                            if (key !== 'createdAt' && value !== undefined && value !== null && value !== '') {
                                countQuery += ` AND ${key} = ?`;
                                countValues.push(value);
                            }
                        });
                    }

                    const [countResult] = await this.db.execute(countQuery, countValues);
                    const total = countResult[0].total;

                    result.pagination = {
                        currentPage: parseInt(currentPage),
                        pageSize: parseInt(pageSize),
                        total,
                        totalPages: Math.ceil(total / pageSize)
                    };
                }

                return result;
            }

            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find credit usage logs by date range failed: ${error.message}`);
        }
    }
}

module.exports = CreditUsageLog;