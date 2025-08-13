const BaseModel = require('./BaseModel');

class Image extends BaseModel {
    constructor(db) {
        super(db, 'images');
    }

    // 根据slug查找图片
    async findBySlug(slug) {
        try {
            const query = `
                SELECT i.*, 
                       c.name as categoryName, 
                       c.slug as categorySlug,
                       s.title as styleTitle,
                       u.username as authorName
                FROM ${this.tableName} i
                LEFT JOIN categories c ON i.categoryId = c.id
                LEFT JOIN styles s ON i.styleId = s.id
                LEFT JOIN users u ON i.userId = u.id
                WHERE i.slug = ?
            `;
            const [rows] = await this.db.execute(query, [slug]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Find image by slug failed: ${error.message}`);
        }
    }

    // 获取用户的图片
    async findByUserId(userId, options = {}) {
        try {
            const filters = { ...options.filters, userId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find images by user failed: ${error.message}`);
        }
    }

    // 获取分类的图片
    async findByCategoryId(categoryId, options = {}) {
        try {
            const filters = { ...options.filters, categoryId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find images by category failed: ${error.message}`);
        }
    }

    // 获取样式的图片
    async findByStyleId(styleId, options = {}) {
        try {
            const filters = { ...options.filters, styleId };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find images by style failed: ${error.message}`);
        }
    }

    // 获取公开且上线的图片
    async findPublicImages(options = {}) {
        try {
            const filters = { ...options.filters, isPublic: 1, isOnline: 1 };
            return await this.findAll({ ...options, filters });
        } catch (error) {
            throw new Error(`Find public images failed: ${error.message}`);
        }
    }

    // 获取热门图片
    async findHotImages(limit = 20, options = {}) {
        try {
            const { categoryId, styleId, isColor } = options;
            
            let query = `
                SELECT i.*, 
                       c.name as categoryName, 
                       c.slug as categorySlug,
                       s.title as styleTitle,
                       u.username as authorName
                FROM ${this.tableName} i
                LEFT JOIN categories c ON i.categoryId = c.id
                LEFT JOIN styles s ON i.styleId = s.id
                LEFT JOIN users u ON i.userId = u.id
                WHERE i.isPublic = 1 AND i.isOnline = 1
            `;
            
            const params = [];
            
            if (categoryId) {
                query += ` AND i.categoryId = ?`;
                params.push(categoryId);
            }
            
            if (styleId) {
                query += ` AND i.styleId = ?`;
                params.push(styleId);
            }
            
            if (isColor !== undefined) {
                query += ` AND i.isColor = ?`;
                params.push(isColor);
            }
            
            query += ` ORDER BY i.hotness DESC, i.createdAt DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await this.db.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Find hot images failed: ${error.message}`);
        }
    }

    // 搜索图片（支持多语言）
    async search(keyword, options = {}) {
        try {
            const { currentPage = 1, pageSize = 12, categoryId, styleId, isColor, type } = options;

            let baseQuery = `
                SELECT i.*, 
                       c.name as categoryName, 
                       c.slug as categorySlug,
                       s.title as styleTitle,
                       u.username as authorName
                FROM ${this.tableName} i
                LEFT JOIN categories c ON i.categoryId = c.id
                LEFT JOIN styles s ON i.styleId = s.id
                LEFT JOIN users u ON i.userId = u.id
                WHERE i.isPublic = 1 AND i.isOnline = 1
                AND (i.title->'$.en' LIKE ? 
                     OR i.title->'$.zh' LIKE ?
                     OR i.description->'$.en' LIKE ?
                     OR i.description->'$.zh' LIKE ?)
            `;

            const searchPattern = `%${keyword}%`;
            const params = [searchPattern, searchPattern, searchPattern, searchPattern];

            // 添加额外筛选条件
            if (categoryId) {
                baseQuery += ` AND i.categoryId = ?`;
                params.push(categoryId);
            }
            
            if (styleId) {
                baseQuery += ` AND i.styleId = ?`;
                params.push(styleId);
            }
            
            if (isColor !== undefined) {
                baseQuery += ` AND i.isColor = ?`;
                params.push(isColor);
            }
            
            if (type) {
                baseQuery += ` AND i.type = ?`;
                params.push(type);
            }

            baseQuery += ` ORDER BY i.hotness DESC, i.createdAt DESC`;

            // 获取总数
            let countQuery = baseQuery.replace(
                /SELECT.*?FROM/s, 
                'SELECT COUNT(*) as total FROM'
            ).replace(/ORDER BY.*$/s, '');
            
            const [countResult] = await this.db.execute(countQuery, params);
            const total = countResult[0].total;

            // 分页查询
            const query = this.buildPaginationQuery(baseQuery, currentPage, pageSize);
            const [rows] = await this.db.execute(query, params);

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
            throw new Error(`Search images failed: ${error.message}`);
        }
    }

    // 更新图片热度
    async updateHotness(imageId, hotnessChange) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET hotness = GREATEST(0, LEAST(1000, hotness + ?)), 
                    updatedAt = NOW() 
                WHERE id = ?
            `;
            const [result] = await this.db.execute(query, [hotnessChange, imageId]);
            
            if (result.affectedRows === 0) {
                throw new Error(`Image with ID ${imageId} not found`);
            }

            return await this.findById(imageId);
        } catch (error) {
            throw new Error(`Update image hotness failed: ${error.message}`);
        }
    }

    // 获取图片的标签
    async getImageTags(imageId) {
        try {
            const query = `
                SELECT t.* 
                FROM tags t
                INNER JOIN image_tags it ON t.id = it.tagId
                WHERE it.imageId = ?
                ORDER BY t.name->'$.en'
            `;
            const [rows] = await this.db.execute(query, [imageId]);
            return rows;
        } catch (error) {
            throw new Error(`Get image tags failed: ${error.message}`);
        }
    }

    // 为图片添加标签
    async addTags(imageId, tagIds) {
        try {
            if (!Array.isArray(tagIds) || tagIds.length === 0) {
                return { success: true, message: 'No tags to add' };
            }

            // 先删除现有标签关联
            await this.db.execute('DELETE FROM image_tags WHERE imageId = ?', [imageId]);

            // 批量插入新的标签关联
            const values = tagIds.map(tagId => [imageId, tagId]);
            const placeholders = values.map(() => '(?, ?)').join(',');
            const flatValues = values.flat();

            const query = `INSERT INTO image_tags (imageId, tagId) VALUES ${placeholders}`;
            await this.db.execute(query, flatValues);

            return { success: true, message: 'Tags updated successfully' };
        } catch (error) {
            throw new Error(`Add image tags failed: ${error.message}`);
        }
    }

    // 获取相似图片（基于分类和标签）
    async getSimilarImages(imageId, limit = 6) {
        try {
            const query = `
                SELECT DISTINCT i.*, 
                       c.name as categoryName,
                       s.title as styleTitle,
                       COUNT(common_tags.tagId) as commonTagCount
                FROM ${this.tableName} i
                LEFT JOIN categories c ON i.categoryId = c.id
                LEFT JOIN styles s ON i.styleId = s.id
                LEFT JOIN image_tags it ON i.id = it.imageId
                LEFT JOIN (
                    SELECT tagId FROM image_tags WHERE imageId = ?
                ) common_tags ON it.tagId = common_tags.tagId
                WHERE i.id != ? 
                  AND i.isPublic = 1 
                  AND i.isOnline = 1
                  AND (i.categoryId = (SELECT categoryId FROM ${this.tableName} WHERE id = ?)
                       OR common_tags.tagId IS NOT NULL)
                GROUP BY i.id
                ORDER BY commonTagCount DESC, i.hotness DESC, i.createdAt DESC
                LIMIT ?
            `;
            
            const [rows] = await this.db.execute(query, [imageId, imageId, imageId, limit]);
            return rows;
        } catch (error) {
            throw new Error(`Get similar images failed: ${error.message}`);
        }
    }

    // 更新图片在线状态
    async updateOnlineStatus(imageId, isOnline) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET isOnline = ?, updatedAt = NOW() 
                WHERE id = ?
            `;
            const [result] = await this.db.execute(query, [isOnline, imageId]);
            
            if (result.affectedRows === 0) {
                throw new Error(`Image with ID ${imageId} not found`);
            }

            return await this.findById(imageId);
        } catch (error) {
            throw new Error(`Update image online status failed: ${error.message}`);
        }
    }

    // 批量更新图片状态
    async batchUpdateStatus(imageIds, updates) {
        try {
            if (!Array.isArray(imageIds) || imageIds.length === 0) {
                throw new Error('Image IDs array is required');
            }

            const updateFields = [];
            const values = [];

            if (updates.isPublic !== undefined) {
                updateFields.push('isPublic = ?');
                values.push(updates.isPublic);
            }

            if (updates.isOnline !== undefined) {
                updateFields.push('isOnline = ?');
                values.push(updates.isOnline);
            }

            if (updateFields.length === 0) {
                throw new Error('No update fields provided');
            }

            updateFields.push('updatedAt = NOW()');

            const placeholders = imageIds.map(() => '?').join(',');
            values.push(...imageIds);

            const query = `
                UPDATE ${this.tableName} 
                SET ${updateFields.join(', ')} 
                WHERE id IN (${placeholders})
            `;

            const [result] = await this.db.execute(query, values);

            return {
                success: true,
                message: `${result.affectedRows} images updated successfully`,
                updatedCount: result.affectedRows
            };
        } catch (error) {
            throw new Error(`Batch update images failed: ${error.message}`);
        }
    }
}

module.exports = Image;