const BaseService = require('./BaseService');

class ImageService extends BaseService {
    constructor(imageModel) {
        super(imageModel);
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

    // 根据slug获取图片
    async getBySlug(slug) {
        try {
            if (!slug) {
                throw new Error('Slug is required');
            }

            const image = await this.model.findBySlug(slug);
            if (!image) {
                throw new Error('Image not found');
            }

            return image;
        } catch (error) {
            throw new Error(`Get image by slug failed: ${error.message}`);
        }
    }

    // 获取用户生成的图片
    async getUserGeneratedImages(userId, query = {}) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            // 添加生成类型过滤条件
            const generatedFilters = {
                ...filters,
                type: 'text2image', // 只查询生成的图片
                userId: userId
            };

            // 获取分页数据
            const paginatedOptions = { ...pagination, ...sort, filters: generatedFilters };
            const paginatedResult = await this.model.findByUserId(userId, paginatedOptions);
            
            // 获取总数（不分页）
            // 构造 count 查询参数，包含过滤条件但不包含分页信息
            const countQuery = {
                ...query,
                type: 'text2image',
                userId: userId
            };
            const totalResult = await this.count(countQuery);
            
            // 直接返回图片列表，不进行批次分组
            const images = paginatedResult.data || [];
            
            // 返回包含images和total字段的结构，方便分页
            const responseData = {
                images: images,
                total: totalResult || 0
            };
            
            return this.formatResponse(true, responseData, 'User generated images retrieved successfully');
        } catch (error) {
            throw new Error(`Get user generated images failed: ${error.message}`);
        }
    }


    // 获取分类的图片
    async getCategoryImages(categoryId, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByCategoryId(categoryId, options);
        } catch (error) {
            throw new Error(`Get category images failed: ${error.message}`);
        }
    }

    // 获取样式的图片
    async getStyleImages(styleId, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByStyleId(styleId, options);
        } catch (error) {
            throw new Error(`Get style images failed: ${error.message}`);
        }
    }

    // 获取公开图片
    async getPublicImages(query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findPublicImages(options);
        } catch (error) {
            throw new Error(`Get public images failed: ${error.message}`);
        }
    }

    // 获取热门图片
    async getHotImages(query = {}) {
        try {
            const { limit = 20, ...options } = query;
            return await this.model.findHotImages(parseInt(limit), options);
        } catch (error) {
            throw new Error(`Get hot images failed: ${error.message}`);
        }
    }

    // 更新热度
    async updateHotness(imageId, hotnessChange) {
        try {
            if (!imageId) {
                throw new Error('Image ID is required');
            }

            if (typeof hotnessChange !== 'number') {
                throw new Error('Hotness change must be a number');
            }

            return await this.model.updateHotness(imageId, hotnessChange);
        } catch (error) {
            throw new Error(`Update image hotness failed: ${error.message}`);
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

    // 更新图片标签
    async updateImageTags(imageId, tagIds) {
        try {
            if (!imageId) {
                throw new Error('Image ID is required');
            }

            return await this.model.addTags(imageId, tagIds);
        } catch (error) {
            throw new Error(`Update image tags failed: ${error.message}`);
        }
    }

    // 获取相似图片
    async getSimilarImages(imageId, limit = 6) {
        try {
            if (!imageId) {
                throw new Error('Image ID is required');
            }

            return await this.model.getSimilarImages(imageId, limit);
        } catch (error) {
            throw new Error(`Get similar images failed: ${error.message}`);
        }
    }

    // 更新在线状态
    async updateOnlineStatus(imageId, isOnline) {
        try {
            if (!imageId) {
                throw new Error('Image ID is required');
            }

            return await this.model.updateOnlineStatus(imageId, isOnline);
        } catch (error) {
            throw new Error(`Update online status failed: ${error.message}`);
        }
    }

    // 批量更新状态
    async batchUpdateStatus(imageIds, updates) {
        try {
            return await this.model.batchUpdateStatus(imageIds, updates);
        } catch (error) {
            throw new Error(`Batch update status failed: ${error.message}`);
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

    // 获取用户的批次列表
    async getUserBatches(userId, query = {}) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            
            const options = { ...pagination, ...sort };
            const result = await this.model.getUserBatches(userId, options);

            return this.formatResponse(true, result, 'User batches retrieved successfully');
        } catch (error) {
            throw new Error(`Get user batches failed: ${error.message}`);
        }
    }
}

module.exports = ImageService;