const express = require('express');
const { createModels } = require('../models');
const UserService = require('../services/UserService');
const CreditService = require('../services/CreditService');
const PayPalService = require('../services/PayPalService');

const router = express.Router();

// PayPal webhook 处理服务
class PayPalWebhookService {
    constructor(rechargeModel, userService, creditService) {
        this.rechargeModel = rechargeModel;
        this.userService = userService;
        this.creditService = creditService;
        this.paypalService = new PayPalService();
    }

    // 验证 PayPal webhook 签名
    async verifyWebhookSignature(headers, body, webhookId) {
        try {
            // PayPal webhook 验证所需的头部信息
            const authAlgo = headers['paypal-auth-algo'];
            const transmission_id = headers['paypal-transmission-id'];
            const cert_id = headers['paypal-cert-id'];
            const transmission_sig = headers['paypal-transmission-sig'];
            const transmission_time = headers['paypal-transmission-time'];

            if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
                throw new Error('Missing required PayPal webhook headers');
            }

            // 调用 PayPal API 验证 webhook
            const isValid = await this.paypalService.verifyWebhookSignature(headers, JSON.stringify(body), webhookId);
            return isValid;

        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            return false;
        }
    }

    // 处理支付完成事件
    async handlePaymentCaptureCompleted(eventData) {
        try {
            console.log(`[Webhook] Starting handlePaymentCaptureCompleted`);
            console.log(`[Webhook] Event data:`, JSON.stringify(eventData, null, 2));

            const captureId = eventData.resource.id;
            const orderId = eventData.resource.supplementary_data?.related_ids?.order_id;
            const amount = eventData.resource.amount?.value;
            const currency = eventData.resource.amount?.currency_code;

            console.log(`[Webhook] Extracted info - captureId: ${captureId}, orderId: ${orderId}, amount: ${amount} ${currency}`);

            if (!orderId) {
                console.error('[Webhook] Order ID not found in webhook event');
                return;
            }

            console.log(`[Webhook] Processing payment capture completed for order: ${orderId}`);

            // 查找对应的充值记录
            const recharge = await this.rechargeModel.findByOrderId(orderId);
            if (!recharge) {
                console.error(`[Webhook] Recharge record not found for order: ${orderId}`);
                return;
            }

            console.log(`[Webhook] Found recharge record:`, {
                id: recharge.id,
                userId: recharge.userId,
                status: recharge.status,
                creditsAdded: recharge.creditsAdded,
                validDays: recharge.validDays
            });

            // 检查是否已经处理过
            if (recharge.status === 'success') {
                console.log(`[Webhook] Order ${orderId} already processed, skipping`);
                return;
            }

            console.log(`[Webhook] Updating recharge record status to success`);
            // 更新充值记录状态
            await this.rechargeModel.updateById(recharge.id, {
                status: 'success',
                captureId: captureId,
                captureStatus: 'COMPLETED',
                updatedAt: new Date()
            });

            console.log(`[Webhook] Adding credits to user: ${recharge.userId} - ${recharge.creditsAdded} credits for ${recharge.validDays} days`);
            // 添加积分并升级用户等级
            await this.creditService.addCredits(
                recharge.userId,
                recharge.creditsAdded,
                recharge.validDays,
                'purchase',
                recharge.id
            );

            console.log(`[Webhook] Payment completed and credits added successfully for user: ${recharge.userId}, order: ${orderId}`);

        } catch (error) {
            console.error('[Webhook] Error processing payment capture completed:', error);
            throw error;
        }
    }

    // 处理支付失败事件
    async handlePaymentCaptureDenied(eventData) {
        try {
            console.log(`[Webhook] Starting handlePaymentCaptureDenied`);
            console.log(`[Webhook] Event data:`, JSON.stringify(eventData, null, 2));

            const captureId = eventData.resource.id;
            const orderId = eventData.resource.supplementary_data?.related_ids?.order_id;
            const denialReason = eventData.resource.reason_code;

            console.log(`[Webhook] Extracted info - captureId: ${captureId}, orderId: ${orderId}, reason: ${denialReason}`);

            if (!orderId) {
                console.error('[Webhook] Order ID not found in webhook event');
                return;
            }

            console.log(`[Webhook] Processing payment capture denied for order: ${orderId}`);

            // 查找对应的充值记录
            const recharge = await this.rechargeModel.findByOrderId(orderId);
            if (!recharge) {
                console.error(`[Webhook] Recharge record not found for order: ${orderId}`);
                return;
            }

            console.log(`[Webhook] Found recharge record:`, {
                id: recharge.id,
                userId: recharge.userId,
                status: recharge.status,
                amount: recharge.amount
            });

            console.log(`[Webhook] Updating recharge record status to failed with reason: ${denialReason}`);
            // 更新充值记录状态为失败
            await this.rechargeModel.updateById(recharge.id, {
                status: 'failed',
                captureId: eventData.resource.id,
                captureStatus: 'DENIED',
                updatedAt: new Date()
            });

            console.log(`[Webhook] Payment denied processed for user: ${recharge.userId}, order: ${orderId}`);

        } catch (error) {
            console.error('[Webhook] Error processing payment capture denied:', error);
            throw error;
        }
    }

    // 处理退款事件
    async handlePaymentCaptureRefunded(eventData) {
        try {
            console.log(`[Webhook] Starting handlePaymentCaptureRefunded`);
            console.log(`[Webhook] Event data:`, JSON.stringify(eventData, null, 2));

            const captureId = eventData.resource.id;
            const refundId = eventData.resource.refund_id;
            const refundAmount = eventData.resource.amount.value;
            const currency = eventData.resource.amount.currency_code;
            const refundStatus = eventData.resource.status;

            console.log(`[Webhook] Extracted info - captureId: ${captureId}, refundId: ${refundId}, amount: ${refundAmount} ${currency}, status: ${refundStatus}`);

            // 查找对应的充值记录
            const recharge = await this.rechargeModel.findByCaptureId(captureId);
            if (!recharge) {
                console.error(`[Webhook] Recharge record not found for capture: ${captureId}`);
                return;
            }

            console.log(`[Webhook] Found recharge record:`, {
                id: recharge.id,
                userId: recharge.userId,
                status: recharge.status,
                creditsAdded: recharge.creditsAdded,
                remainingCredits: recharge.remainingCredits,
                amount: recharge.amount
            });

            // 检查是否已经成功处理过支付（即是否已经添加了积分）
            if (recharge.status === 'success') {
                console.log(`[Webhook] Processing refund for successful payment - user: ${recharge.userId}, credits: ${recharge.creditsAdded}`);

                // 先更新充值记录状态为退款，并将剩余积分清零
                console.log(`[Webhook] Updating recharge status to refund and clearing ${recharge.remainingCredits} remaining credits`);
                await this.rechargeModel.updateById(recharge.id, {
                    status: 'refund',
                    captureStatus: 'REFUNDED',
                    remainingCredits: 0,  // 退款时将剩余积分清零
                    updatedAt: new Date()
                });

                // 然后检查用户是否应该降级等级
                console.log(`[Webhook] Checking if user ${recharge.userId} should be downgraded after refund`);
                try {
                    const userCreditHistory = await this.creditService.getUserCreditHistory(recharge.userId, { pageSize: 10 });
                    console.log(`[Webhook] User credit history retrieved, records count: ${userCreditHistory.data?.length || 0}`);

                    // 如果用户没有其他有效的付费充值记录，将等级降回 free
                    const hasPaidCredits = userCreditHistory.data.some(record =>
                        record.method !== 'system' &&
                        record.status === 'success' &&
                        record.id !== recharge.id
                    );

                    console.log(`[Webhook] User has other paid credits: ${hasPaidCredits}`);

                    if (!hasPaidCredits) {
                        console.log(`[Webhook] Downgrading user ${recharge.userId} to free level`);
                        await this.userService.model.updateById(recharge.userId, {
                            level: 'free',
                            updatedAt: new Date()
                        });
                        console.log(`[Webhook] User ${recharge.userId} downgraded to free level after refund`);
                    } else {
                        console.log(`[Webhook] User ${recharge.userId} keeps paid level (has other active purchases)`);
                    }
                } catch (levelError) {
                    console.error(`[Webhook] Failed to check/update user level after refund for user ${recharge.userId}:`, levelError.message);
                }
            } else {
                console.log(`[Webhook] Processing refund for non-successful payment (status: ${recharge.status})`);
                // 如果充值记录不是成功状态，只更新 captureStatus
                await this.rechargeModel.updateById(recharge.id, {
                    captureStatus: 'REFUNDED',
                    updatedAt: new Date()
                });
                console.log(`[Webhook] Refund noted for non-successful recharge ${recharge.id} (status: ${recharge.status})`);
            }

            console.log(`[Webhook] Refund processed successfully for user: ${recharge.userId}, capture: ${captureId}`);

        } catch (error) {
            console.error('[Webhook] Error processing payment capture refunded:', error);
            throw error;
        }
    }

    // 处理 webhook 事件
    async processWebhookEvent(eventType, eventData) {
        try {
            console.log(`Processing PayPal webhook event: ${eventType}`);

            switch (eventType) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    await this.handlePaymentCaptureCompleted(eventData);
                    break;

                case 'PAYMENT.CAPTURE.DENIED':
                    await this.handlePaymentCaptureDenied(eventData);
                    break;

                case 'PAYMENT.CAPTURE.REFUNDED':
                    await this.handlePaymentCaptureRefunded(eventData);
                    break;

                case 'CHECKOUT.ORDER.APPROVED':
                    console.log('Order approved:', eventData.resource.id);
                    // 订单已批准，但还未完成支付
                    break;

                case 'CHECKOUT.ORDER.COMPLETED':
                    console.log('Order completed:', eventData.resource.id);
                    // 订单完成事件（可能与 PAYMENT.CAPTURE.COMPLETED 重复）
                    break;

                default:
                    console.log(`Unhandled webhook event type: ${eventType}`);
                    break;
            }

        } catch (error) {
            console.error(`Error processing webhook event ${eventType}:`, error);
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

    const webhookService = new PayPalWebhookService(models.Recharge, userService, creditService);

    // PayPal webhook 端点
    router.post('/paypal', async (req, res) => {
        try {
            const headers = req.headers;
            const body = req.body;

            // 解析 webhook 事件数据
            let eventData;
            if (typeof body === 'string') {
                try {
                    eventData = JSON.parse(body);
                } catch (parseError) {
                    console.error('Failed to parse webhook body:', parseError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid JSON payload'
                    });
                }
            } else if (typeof body === 'object' && body !== null) {
                // Body is already parsed by express.json() middleware
                eventData = body;
            } else {
                console.error('Invalid webhook body type:', typeof body);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid body format'
                });
            }

            const eventType = eventData.event_type;
            const eventId = eventData.id;

            console.log(`Received PayPal webhook: ${eventType}, Event ID: ${eventId}`);

            // 验证 webhook 签名（可选，但推荐用于生产环境）
            const webhookId = process.env.PAYPAL_WEBHOOK_ID;
            if (webhookId) {
                const isValidSignature = await webhookService.verifyWebhookSignature(headers, eventData, webhookId);
                if (!isValidSignature) {
                    console.error('Invalid webhook signature');
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid webhook signature'
                    });
                }
            }

            // 处理 webhook 事件
            await webhookService.processWebhookEvent(eventType, eventData);

            // 返回成功响应
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                eventId: eventId,
                eventType: eventType
            });

        } catch (error) {
            console.error('PayPal webhook processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Webhook 状态检查端点（用于调试）
    router.get('/paypal/status', async (req, res) => {
        try {
            res.json({
                success: true,
                message: 'PayPal webhook endpoint is active',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Webhook status check failed'
            });
        }
    });

    return router;
}

module.exports = createWebhookRoutes;