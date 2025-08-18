const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes } = require('./baseRoutes');

const router = express.Router();

// 创建样式路由 - 只提供基础CRUD功能
function createStyleRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const styleService = new BaseService(models.Style);

    // 使用基础CRUD路由提供完整的增删改查功能
    const baseRoutes = createBaseRoutes(styleService, 'Style');
    router.use('/', baseRoutes);

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createStyleRoutes(app);
};