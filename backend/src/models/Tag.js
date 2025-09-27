const BaseModel = require('./BaseModel');

class Tag extends BaseModel {
    constructor(db) {
        super(db, 'tags');
    }

    // 获取标签使用统计
    async getUsageStats(tagId) {
        try {
            const query = `
                SELECT
                    t.*,
                    COUNT(it.imageId) as imageCount,
                    COUNT(CASE WHEN i.isOnline = 1 THEN 1 END) as onlineImageCount
                FROM ${this.tableName} t
                LEFT JOIN image_tags it ON t.id = it.tagId
                LEFT JOIN images i ON it.imageId = i.id
                WHERE t.id = ?
                GROUP BY t.id
            `;
            const [rows] = await this.db.execute(query, [tagId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Get tag usage stats failed: ${error.message}`);
        }
    }

    // 获取热门标签
    async findPopularTags(limit = 20) {
        try {
            const query = `
                SELECT
                    t.*,
                    COUNT(it.imageId) as imageCount
                FROM ${this.tableName} t
                LEFT JOIN image_tags it ON t.id = it.tagId
                LEFT JOIN images i ON it.imageId = i.id AND i.isOnline = 1
                GROUP BY t.id
                HAVING imageCount > 0
                ORDER BY imageCount DESC
                LIMIT ?
            `;
            const [rows] = await this.db.execute(query, [limit]);
            return rows;
        } catch (error) {
            throw new Error(`Find popular tags failed: ${error.message}`);
        }
    }

    // 搜索标签（支持多语言）
    async search(keyword, options = {}) {
        try {
            const { currentPage, pageSize } = options;

            const baseQuery = `
                SELECT * FROM ${this.tableName}
                WHERE name->'$.en' LIKE ?
                   OR name->'$.zh' LIKE ?
                ORDER BY name->'$.en' ASC
            `;

            const searchPattern = `%${keyword}%`;
            const searchParams = [searchPattern, searchPattern];

            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total FROM ${this.tableName}
                WHERE name->'$.en' LIKE ?
                   OR name->'$.zh' LIKE ?
            `;
            const [countResult] = await this.db.execute(countQuery, searchParams);
            const total = countResult[0].total;

            // 分页查询
            const query = this.buildPaginationQuery(baseQuery, currentPage, pageSize);
            const [rows] = await this.db.execute(query, searchParams);

            return {
                data: rows,
                pagination: {
                    currentPage: parseInt(currentPage),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages: Math.ceil(total / pageSize)
                }
            };
        } catch (error) {
            throw new Error(`Search tags failed: ${error.message}`);
        }
    }
}

module.exports = Tag;