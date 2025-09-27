const BaseModel = require('./BaseModel');

class Idea extends BaseModel {
    constructor(db) {
        super(db, 'ideas');
    }

    // 搜索创意（支持多语言）
    async search(keyword, options = {}) {
        try {
            const { currentPage, pageSize } = options;

            const baseQuery = `
                SELECT * FROM ${this.tableName}
                WHERE title->'$.en' LIKE ?
                   OR title->'$.zh' LIKE ?
                   OR prompt->'$.en' LIKE ?
                   OR prompt->'$.zh' LIKE ?
                ORDER BY createdAt DESC
            `;

            const searchPattern = `%${keyword}%`;
            const searchParams = [searchPattern, searchPattern, searchPattern, searchPattern];

            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total FROM ${this.tableName}
                WHERE title->'$.en' LIKE ?
                   OR title->'$.zh' LIKE ?
                   OR prompt->'$.en' LIKE ?
                   OR prompt->'$.zh' LIKE ?
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
            throw new Error(`Search ideas failed: ${error.message}`);
        }
    }
}

module.exports = Idea;