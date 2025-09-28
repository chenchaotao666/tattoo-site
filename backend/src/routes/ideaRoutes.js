const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes } = require('./baseRoutes');

const router = express.Router();

// 创意服务类
class IdeaService extends BaseService {
    constructor(ideaModel) {
        super(ideaModel);
    }

    // 重写getAll方法，确保正确的分页功能
    async getAll(query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);

            // 执行基础查询
            const result = await this.model.findAll({
                ...pagination
            });

            // 构建返回结果
            const response = {
                data: result.data
            };

            // 添加分页信息（如果有分页参数）
            if (pagination.currentPage && pagination.pageSize) {
                response.pagination = {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize,
                    total: result.total,
                    totalPages: Math.ceil(result.total / pagination.pageSize)
                };
            }

            return response;
        } catch (error) {
            throw new Error(`Get all records failed: ${error.message}`);
        }
    }
}

// 创建创意路由
function createIdeaRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const ideaService = new IdeaService(models.Idea);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(ideaService, 'Idea');
    router.use('/', baseRoutes);

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createIdeaRoutes(app);
};