const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const ImageGenerateService = require('../services/ImageGenerateService');
const { createBaseRoutes, validateBody, validateUUID } = require('./baseRoutes');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 图片服务类
class ImageService extends BaseService {
    constructor(imageModel) {
        super(imageModel);
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

    // 获取用户的图片
    async getUserImages(userId, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByUserId(userId, options);
        } catch (error) {
            throw new Error(`Get user images failed: ${error.message}`);
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
}

// 创建图片路由
function createImageRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const imageService = new ImageService(models.Image);
    const imageGenerateService = new ImageGenerateService(models.Image);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(imageService, 'Image');
    router.use('/', baseRoutes);

    // POST /api/images/generate-tattoo - 生成纹身图片（同步，等待完成）
    router.post('/generate-tattoo', optionalAuth, validateBody(['prompt']), async (req, res) => {
        try {
            const {
                prompt,
                width = 1024,
                height = 1024,
                num_outputs = 1,
                scheduler = "K_EULER",
                guidance_scale = 7.5,
                num_inference_steps = 25,
                negative_prompt = "ugly, broken, distorted, blurry, low quality, bad anatomy",
                lora_scale = 0.6,
                refine = "expert_ensemble_refiner",
                high_noise_frac = 0.9,
                apply_watermark = false,
                style_preset,
                seed
            } = req.body;

            // 构建参数对象
            const params = {
                prompt,
                width: parseInt(width),
                height: parseInt(height),
                num_outputs: parseInt(num_outputs),
                scheduler,
                guidance_scale: parseFloat(guidance_scale),
                num_inference_steps: parseInt(num_inference_steps),
                negative_prompt,
                lora_scale: parseFloat(lora_scale),
                refine,
                high_noise_frac: parseFloat(high_noise_frac),
                apply_watermark: Boolean(apply_watermark),
                // 添加用户信息和其他元数据
                userId: req.userId || null, // 从认证中间件获取
                categoryId: req.body.categoryId || null,
                styleId: req.body.styleId || null
            };

            // 如果提供了种子，添加到参数中
            if (seed !== undefined) {
                params.seed = parseInt(seed);
            }

            // 如果提供了样式预设，应用样式
            if (style_preset) {
                const styledParams = imageGenerateService.applyStylePreset(params, style_preset);
                Object.assign(params, styledParams);
            }

            const result = await imageGenerateService.generateTattoo(params);
            res.json(result);
        } catch (error) {
            console.error('Generate tattoo error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/images/generate-tattoo/async - 异步生成纹身图片（立即返回任务ID）
    router.post('/generate-tattoo/async', optionalAuth, validateBody(['prompt']), async (req, res) => {
        try {
            const {
                prompt,
                width = 1024,
                height = 1024,
                num_outputs = 1,
                scheduler = "K_EULER",
                guidance_scale = 7.5,
                num_inference_steps = 50,
                negative_prompt = "ugly, broken, distorted, blurry, low quality, bad anatomy",
                lora_scale = 0.6,
                refine = "expert_ensemble_refiner",
                high_noise_frac = 0.9,
                apply_watermark = false,
                style_preset,
                seed
            } = req.body;

            // 构建参数对象
            const params = {
                prompt,
                width: parseInt(width),
                height: parseInt(height),
                num_outputs: parseInt(num_outputs),
                scheduler,
                guidance_scale: parseFloat(guidance_scale),
                num_inference_steps: parseInt(num_inference_steps),
                negative_prompt,
                lora_scale: parseFloat(lora_scale),
                refine,
                high_noise_frac: parseFloat(high_noise_frac),
                apply_watermark: Boolean(apply_watermark),
                // 添加用户信息和其他元数据
                userId: req.userId || null,
                categoryId: req.body.categoryId || null,
                styleId: req.body.styleId || null
            };

            // 如果提供了种子，添加到参数中
            if (seed !== undefined) {
                params.seed = parseInt(seed);
            }

            // 如果提供了样式预设，应用样式
            if (style_preset) {
                const styledParams = imageGenerateService.applyStylePreset(params, style_preset);
                Object.assign(params, styledParams);
            }

            // 启动异步生成任务
            const result = await imageGenerateService.generateTattooAsync(params);
            res.json(result);
        } catch (error) {
            console.error('Generate tattoo async error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/images/generate-tattoo/complete - 完成异步生成任务
    router.post('/generate-tattoo/complete', optionalAuth, validateBody(['predictionId']), async (req, res) => {
        try {
            const { predictionId, originalParams = {} } = req.body;
            
            // 合并参数
            const params = {
                userId: req.userId || null,
                categoryId: originalParams.categoryId || req.body.categoryId || null,
                styleId: originalParams.styleId || req.body.styleId || null,
                prompt: originalParams.prompt || req.body.prompt || 'Generated tattoo',
                ...originalParams
            };

            const result = await imageGenerateService.completeGeneration(predictionId, params);
            res.json(result);
        } catch (error) {
            console.error('Complete generation error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/images/generate-tattoo/batch - 批量生成纹身图片
    router.post('/generate-tattoo/batch', validateBody(['prompts']), async (req, res) => {
        try {
            const { prompts, ...commonParams } = req.body;

            const result = await imageGenerateService.batchGenerate(prompts, commonParams);
            res.json(result);
        } catch (error) {
            console.error('Batch generate tattoo error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/generate-tattoo/status/:predictionId - 获取生成状态
    router.get('/generate-tattoo/status/:predictionId', async (req, res) => {
        try {
            const { predictionId } = req.params;
            const result = await imageGenerateService.getGenerationStatus(predictionId);
            res.json(result);
        } catch (error) {
            console.error('Get generation status error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/generate-tattoo/model-info - 获取模型信息
    router.get('/generate-tattoo/model-info', async (req, res) => {
        try {
            const modelInfo = imageGenerateService.getModelInfo();
            res.json(imageGenerateService.formatResponse(true, modelInfo, 'Model info retrieved successfully'));
        } catch (error) {
            console.error('Get model info error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/generate-tattoo/style-presets - 获取样式预设
    router.get('/generate-tattoo/style-presets', async (req, res) => {
        try {
            const stylePresets = imageGenerateService.getStylePresets();
            res.json(imageGenerateService.formatResponse(true, stylePresets, 'Style presets retrieved successfully'));
        } catch (error) {
            console.error('Get style presets error:', error);
            res.status(500).json(imageGenerateService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/public - 获取公开图片
    router.get('/public', async (req, res) => {
        try {
            const result = await imageService.getPublicImages(req.query);
            res.json(imageService.formatPaginatedResponse(result, 'Public images retrieved successfully'));
        } catch (error) {
            console.error('Get public images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/hot - 获取热门图片
    router.get('/hot', async (req, res) => {
        try {
            const images = await imageService.getHotImages(req.query);
            res.json(imageService.formatResponse(true, images, 'Hot images retrieved successfully'));
        } catch (error) {
            console.error('Get hot images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/slug/:slug - 根据slug获取图片
    router.get('/slug/:slug', async (req, res) => {
        try {
            const { slug } = req.params;
            const image = await imageService.getBySlug(slug);
            res.json(imageService.formatResponse(true, image, 'Image retrieved successfully'));
        } catch (error) {
            console.error('Get image by slug error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/user/:userId - 获取用户的图片
    router.get('/user/:userId', validateUUID, async (req, res) => {
        try {
            const { userId } = req.params;
            const result = await imageService.getUserImages(userId, req.query);
            res.json(imageService.formatPaginatedResponse(result, 'User images retrieved successfully'));
        } catch (error) {
            console.error('Get user images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/category/:categoryId - 获取分类的图片
    router.get('/category/:categoryId', validateUUID, async (req, res) => {
        try {
            const { categoryId } = req.params;
            const result = await imageService.getCategoryImages(categoryId, req.query);
            res.json(imageService.formatPaginatedResponse(result, 'Category images retrieved successfully'));
        } catch (error) {
            console.error('Get category images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/style/:styleId - 获取样式的图片
    router.get('/style/:styleId', validateUUID, async (req, res) => {
        try {
            const { styleId } = req.params;
            const result = await imageService.getStyleImages(styleId, req.query);
            res.json(imageService.formatPaginatedResponse(result, 'Style images retrieved successfully'));
        } catch (error) {
            console.error('Get style images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/:id/tags - 获取图片标签
    router.get('/:id/tags', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const tags = await imageService.getImageTags(id);
            res.json(imageService.formatResponse(true, tags, 'Image tags retrieved successfully'));
        } catch (error) {
            console.error('Get image tags error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/images/:id/tags - 更新图片标签
    router.put('/:id/tags', validateUUID, validateBody(['tagIds']), async (req, res) => {
        try {
            const { id } = req.params;
            const { tagIds } = req.body;
            const result = await imageService.updateImageTags(id, tagIds);
            res.json(imageService.formatResponse(true, result, 'Image tags updated successfully'));
        } catch (error) {
            console.error('Update image tags error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/images/:id/similar - 获取相似图片
    router.get('/:id/similar', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const { limit } = req.query;
            const images = await imageService.getSimilarImages(id, parseInt(limit) || 6);
            res.json(imageService.formatResponse(true, images, 'Similar images retrieved successfully'));
        } catch (error) {
            console.error('Get similar images error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/images/:id/hotness - 更新图片热度
    router.post('/:id/hotness', validateUUID, validateBody(['hotnessChange']), async (req, res) => {
        try {
            const { id } = req.params;
            const { hotnessChange } = req.body;
            const image = await imageService.updateHotness(id, hotnessChange);
            res.json(imageService.formatResponse(true, image, 'Image hotness updated successfully'));
        } catch (error) {
            console.error('Update image hotness error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/images/:id/status - 更新图片在线状态
    router.put('/:id/status', validateUUID, validateBody(['isOnline']), async (req, res) => {
        try {
            const { id } = req.params;
            const { isOnline } = req.body;
            const image = await imageService.updateOnlineStatus(id, isOnline);
            res.json(imageService.formatResponse(true, image, 'Image status updated successfully'));
        } catch (error) {
            console.error('Update image status error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(imageService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/images/batch/status - 批量更新图片状态
    router.put('/batch/status', validateBody(['imageIds']), async (req, res) => {
        try {
            const { imageIds, ...updates } = req.body;
            const result = await imageService.batchUpdateStatus(imageIds, updates);
            res.json(imageService.formatResponse(true, result, 'Images status updated successfully'));
        } catch (error) {
            console.error('Batch update images status error:', error);
            res.status(500).json(imageService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createImageRoutes(app);
};