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

    // 获取已发布的文章
    async getPublished(query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findPublished(options);
        } catch (error) {
            throw new Error(`Get published posts failed: ${error.message}`);
        }
    }

    // 按作者获取文章
    async getByAuthor(author, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByAuthor(author, options);
        } catch (error) {
            throw new Error(`Get posts by author failed: ${error.message}`);
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

    // GET /api/posts/published - 获取已发布的文章
    router.get('/published', async (req, res) => {
        try {
            const result = await postService.getPublished(req.query);
            res.json(postService.formatPaginatedResponse(result, 'Published posts retrieved successfully'));
        } catch (error) {
            console.error('Get published posts error:', error);
            res.status(500).json(postService.formatResponse(false, null, error.message));
        }
    });

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

    // GET /api/posts/author/:author - 按作者获取文章
    router.get('/author/:author', async (req, res) => {
        try {
            const { author } = req.params;
            const result = await postService.getByAuthor(author, req.query);
            res.json(postService.formatPaginatedResponse(result, `Posts by ${author} retrieved successfully`));
        } catch (error) {
            console.error('Get posts by author error:', error);
            res.status(500).json(postService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createPostRoutes(app);
};