const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createModels } = require('../models');
const BaseService = require('../services/BaseService');
const { validateUUID } = require('./baseRoutes');
const CreemService = require('../services/CreemService');
const UserService = require('../services/UserService');
const CreditService = require('../services/CreditService');

const router = express.Router();

// 支付服务类
class PaymentService extends BaseService {
    constructor(rechargeModel, userService, creditService) {
        super(rechargeModel);
        this.userService = userService;
        this.creditService = creditService;
        this.creemService = new CreemService();
    }

    // 获取计划价格配置 - 新的按天购买系统
    getPlanConfig(planCode) {
        const plans = {
            'day7': {
                amount: 12.99,
                // amount: 1,
                credits: 20,
                days: 7,
                description: '7天有效期积分包'
            },
            'day14': {
                amount: 16.99,
                // amount: 1,
                credits: 40,
                days: 14,
                description: '14天有效期积分包'
            },
            'day30': {
                amount: 23.99,
                // amount: 1,
                credits: 80,
                days: 30,
                description: '30天有效期积分包'
            }
        };

        const plan = plans[planCode];
        if (!plan) {
            throw new Error('Invalid plan configuration');
        }

        return plan;
    }

    // 创建支付订单
    async createOrder(userId, orderData) {
        try {
            const { planCode, method, chargeType } = orderData;

            // 验证用户
            const user = await this.userService.getById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 获取计划配置
            const planConfig = this.getPlanConfig(planCode);
            const finalAmount = planConfig.amount;
            const creditsToAdd = planConfig.credits;
            const validDays = planConfig.days;

            // 创建Creem支付会话
            const creemSession = await this.creemService.createPaymentSession({
                orderId: uuidv4(), // 生成临时订单ID
                planCode: planCode
            });

            // 计算积分过期时间
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + validDays);

            // 保存充值记录到数据库
            const rechargeRecord = {
                id: uuidv4(),
                userId: userId,
                orderId: creemSession.id,
                amount: finalAmount,
                creditsAdded: creditsToAdd,
                remainingCredits: 0, // 初始为0，支付成功后设置为creditsAdded
                status: 'pending',
                method: method,
                planCode: planCode,
                chargeType: chargeType,
                duration: 0, // 新系统不使用duration字段
                validDays: validDays, // 新增有效天数字段
                expiryDate: expiryDate, // 新增过期时间字段
                gift_month: '', // Credit类型充值设置为空字符串
                captureId: null,
                captureStatus: null,
                vaultTokenUsed: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.model.create(rechargeRecord);

            return {
                id: creemSession.requestId,
                amount: finalAmount,
                paymentUrl: creemSession.paymentUrl,
                creemSessionId: creemSession.id
            };
        } catch (error) {
            throw new Error(`Create order failed: ${error.message}`);
        }
    }

    // 捕获支付订单
    async captureOrder(userId, orderId) {
        try {
            // 查找充值记录
            const recharge = await this.model.findByOrderId(orderId);
            if (!recharge) {
                throw new Error('Recharge record not found');
            }

            // 验证用户权限
            if (recharge.userId !== userId) {
                throw new Error('Unauthorized access to order');
            }

            // 检查订单状态
            if (recharge.status === 'success') {
                return { status: 'COMPLETED', message: 'Order already completed' };
            }

            // 验证Creem支付状态
            console.log(`[PaymentService] Verifying payment for sessionId: ${orderId}`);
            const verifyResult = await this.creemService.verifyPayment(orderId);
            console.log(`[PaymentService] Verify result:`, JSON.stringify(verifyResult, null, 2));

            if (verifyResult.status === 'COMPLETED') {
                console.log(`[PaymentService] Payment completed successfully for orderId: ${orderId}`);

                // 更新充值记录状态
                await this.model.updateById(recharge.id, {
                    status: 'success',
                    captureId: verifyResult.transactionId,
                    captureStatus: 'COMPLETED',
                    updatedAt: new Date()
                });
                console.log(`[PaymentService] Recharge record updated to success for rechargeId: ${recharge.id}`);

                // 使用新的积分系统添加积分
                console.log(`[PaymentService] Adding credits: ${recharge.creditsAdded} credits, ${recharge.validDays} days validity`);
                await this.creditService.addCredits(
                    userId,
                    recharge.creditsAdded,
                    recharge.validDays,
                    'purchase',
                    recharge.id
                );
                console.log(`[PaymentService] Credits added successfully for userId: ${userId}`);

                return { status: 'COMPLETED', message: 'Payment completed successfully' };
            } else {
                console.log(`[PaymentService] Payment verification failed for sessionId: ${orderId}, status: ${verifyResult.status}`);

                // 更新为失败状态
                await this.model.updateById(recharge.id, {
                    status: 'failed',
                    captureId: verifyResult.transactionId,
                    captureStatus: verifyResult.status,
                    updatedAt: new Date()
                });
                console.log(`[PaymentService] Recharge record updated to failed for rechargeId: ${recharge.id}`);

                return { status: verifyResult.status, message: verifyResult.message || 'Payment verification failed' };
            }
        } catch (error) {
            throw new Error(`Capture order failed: ${error.message}`);
        }
    }
}

// 认证中间件
const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const userId = req.headers['x-user-id'] || req.body.userId || req.query.userId;

        // 如果有JWT token，优先使用JWT验证
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const jwt = require('jsonwebtoken');
            const secretKey = process.env.JWT_SECRET || 'your-secret-key';

            try {
                const decoded = jwt.verify(token, secretKey);
                req.userId = decoded.userId || decoded.id;
                return next();
            } catch (jwtError) {
                console.error('JWT verification failed:', jwtError.message);
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid or expired token'
                });
            }
        }

        // 如果没有JWT token，使用传统的userId方式
        if (userId) {
            req.userId = userId;
            return next();
        }

        return res.status(401).json({
            status: 'fail',
            message: 'User authentication required'
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'fail',
            message: 'Authentication failed'
        });
    }
};

// 创建支付路由
function createPaymentRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const userService = new UserService(models.User, null, models.Recharge);
    const creditService = new CreditService(models.Recharge, userService, models.CreditUsageLog);
    // Update userService with creditService after creditService is created
    userService.creditService = creditService;
    const paymentService = new PaymentService(models.Recharge, userService, creditService);

    // POST /api/payment/order - 创建支付订单
    router.post('/order', authenticateUser, async (req, res) => {
        try {
            const { planCode, method, chargeType, rechargeAmount } = req.body;

            // 验证必填字段
            if (!planCode || !method || !chargeType) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Missing required fields: planCode, method, chargeType'
                });
            }

            // 验证枚举值
            const validPlanCodes = ['day7', 'day14', 'day30'];
            const validMethods = ['creem'];
            const validChargeTypes = ['Credit']; // 新系统统一使用Credit类型

            if (!validPlanCodes.includes(planCode)) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid planCode'
                });
            }

            if (!validMethods.includes(method)) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid method. Only creem is supported.'
                });
            }

            if (!validChargeTypes.includes(chargeType)) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid chargeType'
                });
            }

            const result = await paymentService.createOrder(req.userId, {
                planCode,
                method,
                chargeType,
                rechargeAmount
            });

            res.json({
                status: 'success',
                data: result,
                message: 'Order created successfully'
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }
    });

    // POST /api/payment/capture/:orderId - 捕获支付订单
    router.post('/capture/:orderId', authenticateUser, async (req, res) => {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Order ID is required'
                });
            }

            const result = await paymentService.captureOrder(req.userId, orderId);

            res.json({
                status: 'success',
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Capture order error:', error);
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }
    });

    // GET /api/payment/chargerecord - 获取用户充值记录
    router.get('/chargerecord', authenticateUser, async (req, res) => {
        try {
            const { page = 1, pageSize = 10 } = req.query;
            const currentPage = parseInt(page);
            const limit = parseInt(pageSize);

            const result = await models.Recharge.findByUserId(req.userId, {
                currentPage,
                pageSize: limit,
                sortBy: 'createdAt',
                sortOrder: 'DESC'
            });

            // 转换数据格式以匹配前端接口
            const formattedData = result.data?.map(record => ({
                orderId: record.orderId,
                amount: record.amount.toString(),
                currency: 'USD',
                planCode: record.planCode,
                chargeType: record.chargeType,
                status: record.status,
                createdAt: record.createdAt,
                creditsAdded: record.creditsAdded,
                duration: record.duration,
                giftMonth: record.duration > 0 ? record.duration.toString() : '0',
                gift_month: record.duration > 0 ? record.duration.toString() : '0',
                method: record.method,
                monthlyCredit: Math.floor(record.creditsAdded / (record.duration || 1))
            })) || [];

            res.json({
                status: 'success',
                data: formattedData,
                pagination: result.pagination,
                message: 'Charge records retrieved successfully'
            });
        } catch (error) {
            console.error('Get charge records error:', error);
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }
    });

    // GET /api/payment/creem/verify/:sessionId - 验证Creem支付状态
    router.get('/creem/verify/:sessionId', authenticateUser, async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Session ID is required'
                });
            }

            // 查找充值记录
            const recharge = await models.Recharge.findByOrderId(sessionId);
            if (!recharge) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Payment record not found'
                });
            }

            // 验证用户权限
            if (recharge.userId !== req.userId) {
                return res.status(403).json({
                    status: 'fail',
                    message: 'Unauthorized access to payment'
                });
            }

            // 如果已经是成功状态，直接返回
            if (recharge.status === 'success') {
                return res.json({
                    status: 'success',
                    data: {
                        status: 'COMPLETED',
                        message: 'Payment already completed',
                        transactionId: recharge.captureId
                    }
                });
            }

            // 验证Creem支付状态
            const verifyResult = await paymentService.creemService.verifyPayment(sessionId);

            console.log(`[PaymentRoutes] verifyResult:`, verifyResult);

            // 如果支付成功，更新记录并添加积分
            if (verifyResult.status === 'COMPLETED' && recharge.status !== 'success') {
                await models.Recharge.updateById(recharge.id, {
                    status: 'success',
                    captureId: verifyResult.transactionId,
                    captureStatus: 'COMPLETED',
                    updatedAt: new Date()
                });

                // 添加积分
                await creditService.addCredits(
                    req.userId,
                    recharge.creditsAdded,
                    recharge.validDays,
                    'purchase',
                    recharge.id
                );
            }

            res.json({
                status: 'success',
                data: verifyResult,
                message: 'Payment status verified successfully'
            });
        } catch (error) {
            console.error('Verify Creem payment error:', error);
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }
    });

    // GET /api/payment/credits - 获取用户积分信息
    router.get('/credits', authenticateUser, async (req, res) => {
        try {
            const stats = await creditService.getCreditStats(req.userId);

            res.json({
                status: 'success',
                data: stats,
                message: 'Credit stats retrieved successfully'
            });
        } catch (error) {
            console.error('Get credit stats error:', error);
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }
    });

    return router;
}

// 导出路由工厂函数
module.exports = (app) => {
    return createPaymentRoutes(app);
};