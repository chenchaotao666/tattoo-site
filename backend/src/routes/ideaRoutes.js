const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes } = require('./baseRoutes');

const router = express.Router();

// 创建创意路由
function createIdeaRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const ideaService = new BaseService(models.Idea);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(ideaService, 'Idea');
    router.use('/', baseRoutes);

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createIdeaRoutes(app);
};