const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes, validateBody, validateUUID } = require('./baseRoutes');

const router = express.Router();

// 样式服务类
class StyleService extends BaseService {
    constructor(styleModel) {
        super(styleModel);
    }

    // 获取样式使用统计
    async getUsageStats(styleId) {
        try {
            if (!styleId) {
                throw new Error('Style ID is required');
            }

            return await this.model.getUsageStats(styleId);
        } catch (error) {
            throw new Error(`Get style usage stats failed: ${error.message}`);
        }
    }

    // 获取热门样式
    async getPopularStyles(limit = 10) {
        try {
            return await this.model.findPopularStyles(limit);
        } catch (error) {
            throw new Error(`Get popular styles failed: ${error.message}`);
        }
    }

    // 获取样式的图片
    async getStyleImages(styleId, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const { isOnline } = query;
            
            const options = { 
                ...pagination, 
                isOnline: isOnline !== undefined ? Boolean(isOnline) : true 
            };
            
            return await this.model.getStyleImages(styleId, options);
        } catch (error) {
            throw new Error(`Get style images failed: ${error.message}`);
        }
    }

    // 批量创建样式
    async createBatch(stylesData) {
        try {
            return await this.model.createBatch(stylesData);
        } catch (error) {
            throw new Error(`Batch create styles failed: ${error.message}`);
        }
    }
}

// 创建样式路由
function createStyleRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const styleService = new StyleService(models.Style);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(styleService, 'Style');
    router.use('/', baseRoutes);

    // GET /api/styles/popular - 获取热门样式
    router.get('/popular', async (req, res) => {
        try {
            const { limit } = req.query;
            const styles = await styleService.getPopularStyles(parseInt(limit) || 10);
            res.json(styleService.formatResponse(true, styles, 'Popular styles retrieved successfully'));
        } catch (error) {
            console.error('Get popular styles error:', error);
            res.status(500).json(styleService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/styles/:id/stats - 获取样式使用统计
    router.get('/:id/stats', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await styleService.getUsageStats(id);
            
            if (!stats) {
                return res.status(404).json(styleService.formatResponse(false, null, 'Style not found'));
            }
            
            res.json(styleService.formatResponse(true, stats, 'Style stats retrieved successfully'));
        } catch (error) {
            console.error('Get style stats error:', error);
            res.status(500).json(styleService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/styles/:id/images - 获取样式的图片
    router.get('/:id/images', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await styleService.getStyleImages(id, req.query);
            res.json(styleService.formatPaginatedResponse(result, 'Style images retrieved successfully'));
        } catch (error) {
            console.error('Get style images error:', error);
            res.status(500).json(styleService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/styles/batch - 批量创建样式
    router.post('/batch', validateBody(['styles']), async (req, res) => {
        try {
            const { styles } = req.body;
            const result = await styleService.createBatch(styles);
            res.status(201).json(styleService.formatResponse(true, result, 'Styles created successfully'));
        } catch (error) {
            console.error('Batch create styles error:', error);
            res.status(500).json(styleService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createStyleRoutes(app);
};