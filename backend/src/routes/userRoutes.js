const express = require('express');
const { createModels } = require('../models');
const UserService = require('../services/UserService');
const CreditService = require('../services/CreditService');
const { validateBody, validateUUID } = require('./baseRoutes');
const { generateTokens, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 创建用户服务实例
function createUserRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const userService = new UserService(models.User, null, models.Recharge);
    const creditService = new CreditService(models.Recharge, userService, models.CreditUsageLog);
    // Update userService with creditService after creditService is created
    userService.creditService = creditService;

    // 特定路由（必须在参数化路由之前定义）

    // POST /api/users/login - 用户登录
    router.post('/login', validateBody(['email', 'password']), async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userService.loginUser(email, password);

            // 生成JWT tokens
            const { accessToken, refreshToken } = generateTokens(user);

            const loginResponse = {
                user: user,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresIn: '7d'
            };

            res.json(userService.formatResponse(true, loginResponse, 'Login successful'));
        } catch (error) {
            console.error('User login error:', error);
            const statusCode = error.message.includes('Invalid') ? 401 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/auth/google - Google OAuth 登录
    router.post('/auth/google', validateBody(['token']), async (req, res) => {
        try {
            const { token } = req.body;
            console.log('🔑 Received Google OAuth login request');

            const user = await userService.googleLogin(token);
            console.log('✅ Google OAuth login successful for user:', user.email);

            // 生成JWT tokens
            const { accessToken, refreshToken } = generateTokens(user);

            const loginResponse = {
                user: user,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresIn: '7d'
            };

            res.json(userService.formatResponse(true, loginResponse, 'Google login successful'));
        } catch (error) {
            console.error('❌ Google OAuth login error:', error);
            const statusCode = error.message.includes('Google账户必须有邮箱地址') ||
                              error.message.includes('Google登录凭证') ||
                              error.message.includes('无效的Google登录凭证') ? 400 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/users/profile - 获取当前登录用户的个人资料
    router.get('/profile', authenticateToken, async (req, res) => {
        try {
            const userId = req.userId;
            const userProfile = await userService.getUserProfile(userId);
            res.json(userService.formatResponse(true, userProfile, 'User profile retrieved successfully'));
        } catch (error) {
            console.error('Get user profile error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

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

    // PUT /api/users/update - 更新当前登录用户信息
    router.put('/update', authenticateToken, async (req, res) => {
        try {
            const userId = req.userId;
            const user = await userService.updateUser(userId, req.body);
            res.json(userService.formatResponse(true, user, 'User updated successfully'));
        } catch (error) {
            console.error('Update user error:', error);
            const statusCode = error.message.includes('not found') ? 404 :
                              error.message.includes('already exists') || error.message.includes('Validation failed') ? 400 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });


    // 基础CRUD路由（放在最后，避免路由冲突）

    // GET /api/users - 获取所有用户
    router.get('/', async (req, res) => {
        try {
            const result = await userService.getAll(req.query);
            res.json(userService.formatPaginatedResponse(result, 'Users retrieved successfully'));
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json(userService.formatResponse(false, null, error.message));
        }
    });

    // POST /api/users - 创建用户（自定义实现）
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

    // GET /api/users/:id - 根据ID获取用户  
    router.get('/:id', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userService.getById(id);
            res.json(userService.formatResponse(true, user, 'User retrieved successfully'));
        } catch (error) {
            console.error('Get user by ID error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/users/:id - 更新用户（自定义实现）
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

    // DELETE /api/users/:id - 删除用户
    router.delete('/:id', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const success = await userService.deleteById(id);
            res.json(userService.formatResponse(success, null, success ? 'User deleted successfully' : 'Failed to delete user'));
        } catch (error) {
            console.error('Delete user error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json(userService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createUserRoutes(app);
};