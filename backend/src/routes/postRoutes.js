const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes, validateUUID } = require('./baseRoutes');

const router = express.Router();

// 文章服务类
class PostService extends BaseService {
    constructor(postModel) {
        super(postModel);
    }

    // 重写getAll方法，过滤掉lang参数并在查询后处理多语言字段
    async getAll(query = {}) {
        try {
            const lang = query.lang; // 保存lang参数
            const { lang: _, ...queryWithoutLang } = query; // 从query中移除lang参数
            
            const pagination = this.normalizePaginationParams(queryWithoutLang);
            const sort = this.normalizeSortParams(queryWithoutLang);
            const filters = this.normalizeFilters(queryWithoutLang);

            const options = {
                ...pagination,
                ...sort,
                filters
            };

            // 执行查询（不包含lang参数）
            const result = await this.model.findAll(options);

            // 如果指定了lang参数，则对多语言字段进行过滤
            if (lang && result.data) {
                result.data = result.data.map(post => {
                    return this.extractLangContent(post, lang);
                });
            }

            return result;
        } catch (error) {
            throw new Error(`Get all records failed: ${error.message}`);
        }
    }


    // 根据slug获取文章
    async getBySlug(slug) {
        try {
            if (!slug) {
                throw new Error('Slug is required');
            }

            const post = await this.model.findBySlug(slug);
            if (!post) {
                throw new Error('Post not found');
            }

            return post;
        } catch (error) {
            throw new Error(`Get post by slug failed: ${error.message}`);
        }
    }
}

// 创建文章路由
function createPostRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const postService = new PostService(models.Post);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(postService, 'Post');
    router.use('/', baseRoutes);

    // GET /api/posts/slug/:slug - 根据slug获取文章
    router.get('/slug/:slug', async (req, res) => {
        try {
            const { slug } = req.params;
            const post = await postService.getBySlug(slug);
            res.json(postService.formatResponse(true, post, 'Post retrieved successfully'));
        } catch (error) {
            console.error('Get post by slug error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(postService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createPostRoutes(app);
};