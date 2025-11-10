const express = require('express');
const { createModels } = require('../models');
const UserService = require('../services/UserService');
const CreditService = require('../services/CreditService');
const CreemService = require('../services/CreemService');

const router = express.Router();


// Creem webhook 处理服务 - 简化版，直接使用 CreemService
class CreemWebhookService {
    constructor(rechargeModel, userService, creditService) {
        this.rechargeModel = rechargeModel;
        this.userService = userService;
        this.creditService = creditService;
        this.creemService = new CreemService();
    }

    // 验证 Creem webhook 签名
    verifyWebhookSignature(payload, signature) {
        try {
            return this.creemService.verifyWebhookSignature(payload, signature);
        } catch (error) {
            console.error('[CreemWebhook] Signature verification failed:', error);
            return false;
        }
    }

    // 处理支付完成事件
    async handlePaymentCompleted(eventData) {
        try {
            console.log(`[CreemWebhook] Starting handlePaymentCompleted`);
            console.log(`[CreemWebhook] Event data:`, JSON.stringify(eventData, null, 2));

            const sessionId = eventData.id;
            const transactionId = eventData.order.transaction;
            const amount = eventData.order.amount;
            const currency = eventData.order.currency;

            console.log(`[CreemWebhook] Extracted info - sessionId: ${sessionId}, transactionId: ${transactionId}, amount: ${amount} ${currency}`);

            if (!sessionId) {
                console.error('[CreemWebhook] Session ID not found in webhook event');
                return;
            }

            console.log(`[CreemWebhook] Processing payment completed for session: ${sessionId}`);

            // 查找对应的充值记录
            const recharge = await this.rechargeModel.findByOrderId(sessionId);
            if (!recharge) {
                console.error(`[CreemWebhook] Recharge record not found for session: ${sessionId}`);
                return;
            }

            console.log(`[CreemWebhook] Found recharge record:`, {
                id: recharge.id,
                userId: recharge.userId,
                status: recharge.status,
                creditsAdded: recharge.creditsAdded,
                validDays: recharge.validDays
            });

            // 检查是否已经处理过
            if (recharge.status === 'success') {
                console.log(`[CreemWebhook] Session ${sessionId} already processed, skipping`);
                return;
            }

            console.log(`[CreemWebhook] Updating recharge record status to success`);
            // 更新充值记录状态
            await this.rechargeModel.updateById(recharge.id, {
                status: 'success',
                captureId: transactionId,
                captureStatus: 'COMPLETED',
                updatedAt: new Date()
            });

            console.log(`[CreemWebhook] Adding credits to user: ${recharge.userId} - ${recharge.creditsAdded} credits for ${recharge.validDays} days`);
            // 添加积分并升级用户等级
            await this.creditService.addCredits(
                recharge.userId,
                recharge.creditsAdded,
                recharge.validDays,
                'purchase',
                recharge.id
            );

            console.log(`[CreemWebhook] Payment completed and credits added successfully for user: ${recharge.userId}, session: ${sessionId}`);

        } catch (error) {
            console.error('[CreemWebhook] Error processing payment completed:', error);
            throw error;
        }
    }

    // 处理 webhook 事件
    async processWebhookEvent(eventType, eventData) {
        try {
            console.log(`Processing Creem webhook event: ${eventType}`);

            switch (eventType) {
                case 'checkout.completed':
                    await this.handlePaymentCompleted(eventData);
                    break;

                default:
                    console.log(`Unhandled Creem webhook event type: ${eventType}`);
                    break;
            }

        } catch (error) {
            console.error(`Error processing Creem webhook event ${eventType}:`, error);
            throw error;
        }
    }
}

// 创建 webhook 路由
function createWebhookRoutes(app) {
    const db = app.locals.db;
    const models = createModels(db);
    const userService = new UserService(models.User, null, models.Recharge);
    const creditService = new CreditService(models.Recharge, userService, models.CreditUsageLog);
    userService.creditService = creditService;

    const creemWebhookService = new CreemWebhookService(models.Recharge, userService, creditService);

    // Creem webhook 端点
    router.post('/webhook', async (req, res) => {
        try {
            const headers = req.headers;
            const body = req.body;

            console.log(`[CreemWebhook] Received webhook request`);
            console.log(`[CreemWebhook] Headers:`, headers);
            console.log(`[CreemWebhook] body:`, body);

            // 解析 webhook 事件数据
            let eventData;
            if (typeof body === 'string') {
                try {
                    eventData = JSON.parse(body);
                } catch (parseError) {
                    console.error('[CreemWebhook] Failed to parse webhook body:', parseError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid JSON payload'
                    });
                }
            } else if (typeof body === 'object' && body !== null) {
                // Body is already parsed by express.json() middleware
                eventData = body;
            } else {
                console.error('[CreemWebhook] Invalid webhook body type:', typeof body);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid body format'
                });
            }

            console.log(`[CreemWebhook] eventData:`, eventData);

            const eventType = eventData.eventType;
            const eventId = eventData.id;
            const signature = headers['x-creem-signature'];
            const timestamp = headers['x-creem-timestamp'];

            console.log(`[CreemWebhook] Event: ${eventType}, ID: ${eventId}`);

            // 验证 webhook 签名
            if (signature) {
                const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
                const isValidSignature = creemWebhookService.verifyWebhookSignature(rawBody, signature);
                if (!isValidSignature) {
                    console.error('[CreemWebhook] Invalid webhook signature');
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid webhook signature'
                    });
                }
                console.log('[CreemWebhook] Signature verified successfully');
            } else {
                console.warn('[CreemWebhook] No signature verification headers found, skipping verification');
            }

            // 处理 webhook 事件
            await creemWebhookService.processWebhookEvent(eventType, eventData.object);

            // 返回成功响应
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                eventId: eventId,
                eventType: eventType
            });

        } catch (error) {
            console.error('[CreemWebhook] Processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
}

module.exports = createWebhookRoutes;