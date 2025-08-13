const express = require('express');
const { createModels } = require('../models');
const UserService = require('../services/UserService');
const { createBaseRoutes, validateBody, validateUUID } = require('./baseRoutes');

const router = express.Router();

// 创建用户服务实例
function createUserRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const userService = new UserService(models.User);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(userService, 'User');
    router.use('/', baseRoutes);

    // GET /api/users/email/:email - 根据邮箱查找用户
    router.get('/email/:email', async (req, res) => {
        try {
            const { email } = req.params;
            const user = await userService.getUserByEmail(email);
            
            if (!user) {
                return res.status(404).json(userService.formatResponse(false, null, 'User not found'));
            }
            
            res.json(userService.formatResponse(true, user, 'User retrieved successfully'));
        } catch (error) {
            console.error('Get user by email error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/username/:username - 根据用户名查找用户
    router.get('/username/:username', async (req, res) => {
        try {
            const { username } = req.params;
            const user = await userService.getUserByUsername(username);
            
            if (!user) {
                return res.status(404).json(userService.formatResponse(false, null, 'User not found'));
            }
            
            res.json(userService.formatResponse(true, user, 'User retrieved successfully'));
        } catch (error) {
            console.error('Get user by username error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/:id/stats - 获取用户统计信息
    router.get('/:id/stats', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const stats = await userService.getUserStats(id);
            
            if (!stats) {
                return res.status(404).json(userService.formatResponse(false, null, 'User not found'));
            }
            
            res.json(userService.formatResponse(true, stats, 'User stats retrieved successfully'));
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/:id/dashboard - 获取用户仪表板数据
    router.get('/:id/dashboard', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const dashboard = await userService.getUserDashboard(id);
            
            res.json(userService.formatResponse(true, dashboard, 'User dashboard retrieved successfully'));
        } catch (error) {
            console.error('Get user dashboard error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/users/:id/credits - 更新用户积分
    router.post('/:id/credits', validateUUID, validateBody(['creditsChange']), async (req, res) => {
        try {
            const { id } = req.params;
            const { creditsChange } = req.body;
            
            const user = await userService.updateUserCredits(id, creditsChange);
            res.json(userService.formatResponse(true, user, 'User credits updated successfully'));
        } catch (error) {
            console.error('Update user credits error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/users/:id/balance - 更新用户余额
    router.post('/:id/balance', validateUUID, validateBody(['balanceChange']), async (req, res) => {
        try {
            const { id } = req.params;
            const { balanceChange } = req.body;
            
            const user = await userService.updateUserBalance(id, balanceChange);
            res.json(userService.formatResponse(true, user, 'User balance updated successfully'));
        } catch (error) {
            console.error('Update user balance error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/role/:role - 按角色获取用户
    router.get('/role/:role', async (req, res) => {
        try {
            const { role } = req.params;
            const result = await userService.getUsersByRole(role, req.query);
            
            res.json(userService.formatPaginatedResponse(result, `Users with role ${role} retrieved successfully`));
        } catch (error) {
            console.error('Get users by role error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/level/:level - 按等级获取用户
    router.get('/level/:level', async (req, res) => {
        try {
            const { level } = req.params;
            const result = await userService.getUsersByLevel(level, req.query);
            
            res.json(userService.formatPaginatedResponse(result, `Users with level ${level} retrieved successfully`));
        } catch (error) {
            console.error('Get users by level error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/memberships/expiring - 获取即将到期的会员
    router.get('/memberships/expiring', async (req, res) => {
        try {
            const { days } = req.query;
            const users = await userService.getExpiringMemberships(parseInt(days) || 7);
            
            res.json(userService.formatResponse(true, users, 'Expiring memberships retrieved successfully'));
        } catch (error) {
            console.error('Get expiring memberships error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/users - 创建用户（重写以添加验证）
    router.post('/', validateBody(['username', 'email']), async (req, res) => {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(userService.formatResponse(true, user, 'User created successfully'));
        } catch (error) {
            console.error('Create user error:', error);
            const statusCode = error.message.includes('already exists') || error.message.includes('Validation failed') ? 400 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/users/:id - 更新用户（重写以添加验证）
    router.put('/:id', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userService.updateUser(id, req.body);
            res.json(userService.formatResponse(true, user, 'User updated successfully'));
        } catch (error) {
            console.error('Update user error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 
                              error.message.includes('already exists') || error.message.includes('Validation failed') ? 400 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createUserRoutes(app);
};