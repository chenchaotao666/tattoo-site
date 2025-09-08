const BaseService = require('./BaseService');

class ImageService extends BaseService {
    constructor(imageModel) {
        super(imageModel);
    }

    // 重写getAll方法，包含tags信息
    async getAll(query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            // 构建基础查询，包含JOIN tags信息
            let baseQuery = `
                SELECT DISTINCT i.*, 
                       c.name as categoryName, 
                       c.slug as categorySlug,
                       s.title as styleTitle,
                       u.username as authorName
                FROM images i
                LEFT JOIN categories c ON i.categoryId = c.id
                LEFT JOIN styles s ON i.styleId = s.id
                LEFT JOIN users u ON i.userId = u.id
            `;

            const conditions = [];
            const values = [];

            // 构建过滤条件
            if (Object.keys(filters).length > 0) {
                const { where, values: filterValues } = this.buildFilterQuery(filters);
                if (where) {
                    conditions.push(where.replace('WHERE ', ''));
                    values.push(...filterValues);
                }
            }

            // 组装WHERE子句
            if (conditions.length > 0) {
                baseQuery += ` WHERE ${conditions.join(' AND ')}`;
            }

            // 添加排序
            if (sort.sortBy) {
                baseQuery += ` ${this.buildSortQuery(sort.sortBy, sort.sortOrder)}`;
            }

            // 获取总数（用于分页）
            let totalCount = 0;
            if (pagination.currentPage && pagination.pageSize) {
                let countQuery = baseQuery.replace(
                    /SELECT DISTINCT.*?FROM/s, 
                    'SELECT COUNT(DISTINCT i.id) as total FROM'
                ).replace(/ORDER BY.*$/s, '');
                
                const [countResult] = await this.model.db.execute(countQuery, values);
                totalCount = countResult[0].total;
            }

            // 添加分页
            const paginatedQuery = this.buildPaginationQuery(baseQuery, pagination.currentPage, pagination.pageSize);
            const [rows] = await this.model.db.execute(paginatedQuery, values);

            // 为每个图片获取tags信息
            const imagesWithTags = await Promise.all(rows.map(async (image) => {
                const tags = await this.model.getImageTags(image.id);
                return {
                    ...image,
                    tags: tags || []
                };
            }));

            // 构建返回结果
            const result = {
                data: imagesWithTags
            };

            // 添加分页信息（如果有分页参数）
            if (pagination.currentPage && pagination.pageSize) {
                result.pagination = {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / pagination.pageSize)
                };
            }

            return result;
        } catch (error) {
            throw new Error(`Get all images with tags failed: ${error.message}`);
        }
    }

    // 辅助方法：构建过滤条件
    buildFilterQuery(filters = {}) {
        const conditions = [];
        const values = [];

        // 安全的操作符白名单
        const validOperators = ['=', '>', '<', '>=', '<=', '!=', '<>', 'LIKE', 'NOT LIKE'];

        // 验证字段名，只允许字母、数字、下划线和点
        const sanitizeField = (field) => {
            if (typeof field !== 'string') return null;
            const cleanField = field.replace(/[^a-zA-Z0-9_.]/g, '');
            return cleanField === field ? field : null;
        };

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                // 为image表字段添加别名前缀
                const fieldName = key.includes('.') ? key : `i.${key}`;
                const sanitizedKey = sanitizeField(fieldName);
                if (!sanitizedKey) return; // 跳过无效字段名

                // 处理布尔字段的字符串转换
                const booleanFields = ['isColor', 'isPublic', 'isOnline'];
                const fieldBase = key.replace('i.', ''); // 移除前缀获取基础字段名
                let processedValue = value;

                if (booleanFields.includes(fieldBase)) {
                    // 转换字符串布尔值为数字
                    if (value === 'true' || value === true) {
                        processedValue = 1;
                    } else if (value === 'false' || value === false) {
                        processedValue = 0;
                    }
                }

                if (Array.isArray(value)) {
                    // 数组条件 (IN)
                    const placeholders = value.map(() => '?').join(',');
                    conditions.push(`${sanitizedKey} IN (${placeholders})`);
                    values.push(...value);
                } else if (typeof value === 'object' && value.operator) {
                    // 自定义操作符 - 验证操作符安全性
                    const operatorStr = typeof value.operator === 'string' ? value.operator : String(value.operator);
                    const operator = operatorStr.toUpperCase();
                    if (validOperators.includes(operator)) {
                        conditions.push(`${sanitizedKey} ${operator} ?`);
                        values.push(value.value);
                    }
                } else if (typeof value === 'string' && value.includes('*')) {
                    // 模糊查询
                    conditions.push(`${sanitizedKey} LIKE ?`);
                    values.push(value.replace(/\*/g, '%'));
                } else {
                    // 精确匹配
                    conditions.push(`${sanitizedKey} = ?`);
                    values.push(processedValue);
                }
            }
        });

        return {
            where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
            values
        };
    }

    // 辅助方法：构建分页查询
    buildPaginationQuery(baseQuery, currentPage, pageSize) {
        if (currentPage && pageSize) {
            const offset = (currentPage - 1) * pageSize;
            return `${baseQuery} LIMIT ${pageSize} OFFSET ${offset}`;
        }
        return baseQuery;
    }

    // 辅助方法：构建排序查询
    buildSortQuery(sortBy, sortOrder = 'ASC') {
        if (!sortBy) return '';
        const validOrders = ['ASC', 'DESC'];
        
        // 确保 sortOrder 是字符串
        const orderStr = typeof sortOrder === 'string' ? sortOrder : (Array.isArray(sortOrder) ? sortOrder[0] || 'ASC' : String(sortOrder));
        const order = validOrders.includes(orderStr.toUpperCase()) ? orderStr.toUpperCase() : 'ASC';
        
        // 验证字段名，只允许字母、数字、下划线和点
        const sanitizeField = (field) => {
            if (typeof field !== 'string') return null;
            // 只允许字母、数字、下划线、点（用于表别名如 i.createdAt）
            const cleanField = field.replace(/[^a-zA-Z0-9_.]/g, '');
            return cleanField === field ? field : null;
        };
        
        // 支持多字段排序
        if (Array.isArray(sortBy)) {
            const sortFields = sortBy.map((field, index) => {
                // 为字段添加别名前缀（如果没有的话）
                const fieldName = field.includes('.') ? field : `i.${field}`;
                const sanitizedField = sanitizeField(fieldName);
                if (!sanitizedField) return null;
                const fieldOrder = Array.isArray(sortOrder) ? (sortOrder[index] || 'ASC') : order;
                // 确保 fieldOrder 是字符串
                const fieldOrderStr = typeof fieldOrder === 'string' ? fieldOrder : String(fieldOrder);
                const validOrder = validOrders.includes(fieldOrderStr.toUpperCase()) ? fieldOrderStr.toUpperCase() : 'ASC';
                return `${sanitizedField} ${validOrder}`;
            }).filter(Boolean);
            
            return sortFields.length > 0 ? `ORDER BY ${sortFields.join(', ')}` : '';
        }
        
        // 为字段添加别名前缀（如果没有的话）
        const fieldName = sortBy.includes('.') ? sortBy : `i.${sortBy}`;
        const sanitizedField = sanitizeField(fieldName);
        return sanitizedField ? `ORDER BY ${sanitizedField} ${order}` : '';
    }

    // 重写getById方法，提供更具体的错误信息
    async getById(id) {
        try {
            if (!id) {
                throw new Error('Image ID is required');
            }

            const image = await this.model.findById(id);
            if (!image) {
                throw new Error('Image not found');
            }

            return image;
        } catch (error) {
            throw new Error(`Get image by ID failed: ${error.message}`);
        }
    }

    // 获取用户生成的图片
    async getUserGeneratedImages(userId, query = {}) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            // 构造查询参数，添加用户ID和生成类型过滤条件
            const userGeneratedQuery = {
                ...query,
                type: 'text2image', // 只查询生成的图片
                userId: userId
            };

            // 复用getAll方法，确保返回的数据格式一致（包含关联信息）
            const result = await this.getAll(userGeneratedQuery);
            
            return this.formatResponse(true, result.data, 'User generated images retrieved successfully');
        } catch (error) {
            throw new Error(`Get user generated images failed: ${error.message}`);
        }
    }

    // 获取图片标签
    async getImageTags(imageId) {
        try {
            if (!imageId) {
                throw new Error('Image ID is required');
            }

            return await this.model.getImageTags(imageId);
        } catch (error) {
            throw new Error(`Get image tags failed: ${error.message}`);
        }
    }

    // 根据批次ID获取图片
    async getImagesByBatchId(batchId, query = {}) {
        try {
            if (!batchId) {
                throw new Error('Batch ID is required');
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            // 添加批次ID过滤条件
            const batchFilters = {
                ...filters,
                batchId: batchId
            };

            const options = { ...pagination, ...sort, filters: batchFilters };
            const result = await this.model.findByBatchId(batchId, options);

            return this.formatResponse(true, result, 'Images retrieved by batch ID successfully');
        } catch (error) {
            throw new Error(`Get images by batch ID failed: ${error.message}`);
        }
    }

    // 根据批次ID删除所有图片
    async deleteByBatchId(batchId, userId = null) {
        try {
            if (!batchId) {
                throw new Error('Batch ID is required');
            }

            // 首先获取要删除的图片列表（用于权限检查和文件清理）
            const imagesResult = await this.getImagesByBatchId(batchId);
            const images = imagesResult.data || [];

            if (images.length === 0) {
                return this.formatResponse(false, null, 'No images found for this batch ID');
            }

            // 如果提供了用户ID，检查权限（只能删除自己的图片）
            if (userId) {
                const unauthorizedImages = images.filter(img => img.userId !== userId);
                if (unauthorizedImages.length > 0) {
                    throw new Error('Unauthorized: You can only delete your own images');
                }
            }

            // 执行批次删除
            const deleteResult = await this.model.deleteByBatchId(batchId);
            
            // 删除本地文件（如果存在）
            await this.cleanupLocalFiles(images);

            return this.formatResponse(
                true, 
                {
                    deletedCount: deleteResult.affectedRows || deleteResult.deletedCount || images.length,
                    batchId: batchId,
                    deletedImages: images.map(img => ({ id: img.id, filename: img.name }))
                }, 
                `Successfully deleted ${images.length} images from batch ${batchId}`
            );
        } catch (error) {
            throw new Error(`Delete images by batch ID failed: ${error.message}`);
        }
    }

    // 清理本地文件
    async cleanupLocalFiles(images) {
        const fs = require('fs');
        const path = require('path');
        
        for (const image of images) {
            try {
                // 尝试从 additionalInfo 中获取文件路径
                if (image.additionalInfo) {
                    let additionalInfo;
                    try {
                        additionalInfo = typeof image.additionalInfo === 'string' 
                            ? JSON.parse(image.additionalInfo) 
                            : image.additionalInfo;
                    } catch (e) {
                        console.warn(`Failed to parse additionalInfo for image ${image.id}`);
                        continue;
                    }

                    // 构建文件路径
                    const uploadDir = path.join(__dirname, '../../uploads/generated');
                    
                    // 尝试多种可能的文件名格式
                    const possibleFilenames = [
                        `${image.batchId}_${additionalInfo.generationId}_0.png`,
                        `${additionalInfo.generationId}_0.png`,
                        path.basename(image.tattooUrl || '')
                    ].filter(Boolean);

                    for (const filename of possibleFilenames) {
                        const filepath = path.join(uploadDir, filename);
                        if (fs.existsSync(filepath)) {
                            fs.unlinkSync(filepath);
                            console.log(`Deleted local file: ${filename}`);
                            break; // 找到并删除了文件，跳出循环
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to delete local file for image ${image.id}:`, error.message);
                // 继续处理其他文件，不中断整个过程
            }
        }
    }
}

module.exports = ImageService;