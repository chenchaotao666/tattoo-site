const express = require('express');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { createBaseRoutes, validateUUID } = require('./baseRoutes');

const router = express.Router();

// 充值服务类
class RechargeService extends BaseService {
    constructor(rechargeModel) {
        super(rechargeModel);
    }

    // 根据用户ID获取充值记录
    async getUserRecharges(userId, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByUserId(userId, options);
        } catch (error) {
            throw new Error(`Get user recharges failed: ${error.message}`);
        }
    }

    // 根据订单ID获取充值记录
    async getByOrderId(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            return await this.model.findByOrderId(orderId);
        } catch (error) {
            throw new Error(`Get recharge by order ID failed: ${error.message}`);
        }
    }

    // 获取用户充值统计
    async getUserStats(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            return await this.model.getUserRechargeStats(userId);
        } catch (error) {
            throw new Error(`Get user recharge stats failed: ${error.message}`);
        }
    }

    // 按状态获取充值记录
    async getByStatus(status, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByStatus(status, options);
        } catch (error) {
            throw new Error(`Get recharges by status failed: ${error.message}`);
        }
    }

    // 根据捕获ID获取充值记录
    async getByCaptureId(captureId) {
        try {
            if (!captureId) {
                throw new Error('Capture ID is required');
            }

            return await this.model.findByCaptureId(captureId);
        } catch (error) {
            throw new Error(`Get recharge by capture ID failed: ${error.message}`);
        }
    }

    // 更新捕获状态
    async updateCaptureStatus(id, captureStatus, captureId = null) {
        try {
            const updateData = { captureStatus };
            if (captureId) {
                updateData.captureId = captureId;
            }

            return await this.model.update(id, updateData);
        } catch (error) {
            throw new Error(`Update capture status failed: ${error.message}`);
        }
    }

    // 按捕获状态获取充值记录
    async getByCaptureStatus(captureStatus, query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findByCaptureStatus(captureStatus, options);
        } catch (error) {
            throw new Error(`Get recharges by capture status failed: ${error.message}`);
        }
    }

    // 获取使用vault token的充值记录
    async getVaultTokenRecharges(query = {}) {
        try {
            const pagination = this.normalizePaginationParams(query);
            const sort = this.normalizeSortParams(query);
            const filters = this.normalizeFilters(query);

            const options = { ...pagination, ...sort, filters };
            return await this.model.findVaultTokenRecharges(options);
        } catch (error) {
            throw new Error(`Get vault token recharges failed: ${error.message}`);
        }
    }
}

// 创建充值路由
function createRechargeRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const rechargeService = new RechargeService(models.Recharge);

    // 使用基础CRUD路由
    const baseRoutes = createBaseRoutes(rechargeService, 'Recharge');
    router.use('/', baseRoutes);

    // GET /api/recharges/user/:userId - 获取用户的充值记录
    router.get('/user/:userId', validateUUID, async (req, res) => {
        try {
            const { userId } = req.params;
            const result = await rechargeService.getUserRecharges(userId, req.query);
            res.json(rechargeService.formatPaginatedResponse(result, 'User recharges retrieved successfully'));
        } catch (error) {
            console.error('Get user recharges error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/user/:userId/stats - 获取用户充值统计
    router.get('/user/:userId/stats', validateUUID, async (req, res) => {
        try {
            const { userId } = req.params;
            const stats = await rechargeService.getUserStats(userId);
            res.json(rechargeService.formatResponse(true, stats, 'User recharge stats retrieved successfully'));
        } catch (error) {
            console.error('Get user recharge stats error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/order/:orderId - 根据订单ID获取充值记录
    router.get('/order/:orderId', async (req, res) => {
        try {
            const { orderId } = req.params;
            const recharge = await rechargeService.getByOrderId(orderId);
            
            if (!recharge) {
                return res.status(404).json(rechargeService.formatResponse(false, null, 'Recharge not found'));
            }
            
            res.json(rechargeService.formatResponse(true, recharge, 'Recharge retrieved successfully'));
        } catch (error) {
            console.error('Get recharge by order ID error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/status/:status - 按状态获取充值记录
    router.get('/status/:status', async (req, res) => {
        try {
            const { status } = req.params;
            const result = await rechargeService.getByStatus(status, req.query);
            res.json(rechargeService.formatPaginatedResponse(result, `Recharges with status ${status} retrieved successfully`));
        } catch (error) {
            console.error('Get recharges by status error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/capture/:captureId - 根据捕获ID获取充值记录
    router.get('/capture/:captureId', async (req, res) => {
        try {
            const { captureId } = req.params;
            const recharge = await rechargeService.getByCaptureId(captureId);

            if (!recharge) {
                return res.status(404).json(rechargeService.formatResponse(false, null, 'Recharge not found'));
            }

            res.json(rechargeService.formatResponse(true, recharge, 'Recharge retrieved successfully'));
        } catch (error) {
            console.error('Get recharge by capture ID error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // PUT /api/recharges/:id/capture-status - 更新捕获状态
    router.put('/:id/capture-status', validateUUID, async (req, res) => {
        try {
            const { id } = req.params;
            const { captureStatus, captureId } = req.body;

            if (!captureStatus) {
                return res.status(400).json(rechargeService.formatResponse(false, null, 'Capture status is required'));
            }

            const allowedStatuses = ['PENDING', 'COMPLETED', 'DECLINED', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED'];
            if (!allowedStatuses.includes(captureStatus)) {
                return res.status(400).json(rechargeService.formatResponse(false, null, 'Invalid capture status'));
            }

            const result = await rechargeService.updateCaptureStatus(id, captureStatus, captureId);
            res.json(rechargeService.formatResponse(true, result, 'Capture status updated successfully'));
        } catch (error) {
            console.error('Update capture status error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/capture-status/:status - 按捕获状态获取充值记录
    router.get('/capture-status/:status', async (req, res) => {
        try {
            const { status } = req.params;
            const result = await rechargeService.getByCaptureStatus(status, req.query);
            res.json(rechargeService.formatPaginatedResponse(result, `Recharges with capture status ${status} retrieved successfully`));
        } catch (error) {
            console.error('Get recharges by capture status error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    // GET /api/recharges/vault-token - 获取使用vault token的充值记录
    router.get('/vault-token', async (req, res) => {
        try {
            const result = await rechargeService.getVaultTokenRecharges(req.query);
            res.json(rechargeService.formatPaginatedResponse(result, 'Vault token recharges retrieved successfully'));
        } catch (error) {
            console.error('Get vault token recharges error:', error);
            res.status(500).json(rechargeService.formatResponse(false, null, error.message));
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createRechargeRoutes(app);
};