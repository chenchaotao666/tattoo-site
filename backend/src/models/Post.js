const BaseModel = require('./BaseModel');

class Post extends BaseModel {
    constructor(db) {
        super(db, 'posts');
    }

    // 根据slug查找文章
    async findBySlug(slug) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE slug = ?`;
            const [rows] = await this.db.execute(query, [slug]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find post by slug failed: ${error.message}`);
        }
    }

    // 获取已发布的文章
    async findPublished(options = {}) {
        try {
            const filters = { ...options.filters, status: 'published' };
            const sortBy = options.sortBy || 'publishedAt';
            const sortOrder = options.sortOrder || 'DESC';

            return await this.findAll({
                ...options,
                filters,
                sortBy,
                sortOrder
            });
        } catch (error) {
            throw new Error(`Find published posts failed: ${error.message}`);
        }
    }

    // 根据作者查找文章
    async findByAuthor(author, options = {}) {
        try {
            const filters = { ...options.filters, author };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find posts by author failed: ${error.message}`);
        }
    }

    // 搜索文章（支持多语言）
    async search(keyword, options = {}) {
        try {
            const { currentPage, pageSize, status = 'published' } = options;

            let baseQuery = `
                SELECT * FROM ${this.tableName}
                WHERE status = ?
                AND (title->'$.en' LIKE ?
                     OR title->'$.zh' LIKE ?
                     OR excerpt->'$.en' LIKE ?
                     OR excerpt->'$.zh' LIKE ?)
                ORDER BY publishedAt DESC
            `;

            const searchPattern = `%${keyword}%`;
            const searchParams = [status, searchPattern, searchPattern, searchPattern, searchPattern];

            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total FROM ${this.tableName}
                WHERE status = ?
                AND (title->'$.en' LIKE ?
                     OR title->'$.zh' LIKE ?
                     OR excerpt->'$.en' LIKE ?
                     OR excerpt->'$.zh' LIKE ?)
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
            throw new Error(`Search posts failed: ${error.message}`);
        }
    }
}

module.exports = Post;