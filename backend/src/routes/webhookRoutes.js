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

            const sessionId = eventData.session_id;
            const transactionId = eventData.transaction_id;
            const amount = eventData.amount;
            const currency = eventData.currency;

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

    // 处理支付失败事件
    async handlePaymentFailed(eventData) {
        try {
            console.log(`[CreemWebhook] Starting handlePaymentFailed`);
            console.log(`[CreemWebhook] Event data:`, JSON.stringify(eventData, null, 2));

            const sessionId = eventData.session_id;
            const failureReason = eventData.failure_reason;

            console.log(`[CreemWebhook] Extracted info - sessionId: ${sessionId}, reason: ${failureReason}`);

            if (!sessionId) {
                console.error('[CreemWebhook] Session ID not found in webhook event');
                return;
            }

            console.log(`[CreemWebhook] Processing payment failed for session: ${sessionId}`);

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
                amount: recharge.amount
            });

            console.log(`[CreemWebhook] Updating recharge record status to failed with reason: ${failureReason}`);
            // 更新充值记录状态为失败
            await this.rechargeModel.updateById(recharge.id, {
                status: 'failed',
                captureStatus: 'FAILED',
                updatedAt: new Date()
            });

            console.log(`[CreemWebhook] Payment failed processed for user: ${recharge.userId}, session: ${sessionId}`);

        } catch (error) {
            console.error('[CreemWebhook] Error processing payment failed:', error);
            throw error;
        }
    }

    // 处理支付取消事件
    async handlePaymentCancelled(eventData) {
        try {
            console.log(`[CreemWebhook] Starting handlePaymentCancelled`);
            console.log(`[CreemWebhook] Event data:`, JSON.stringify(eventData, null, 2));

            const sessionId = eventData.session_id;

            console.log(`[CreemWebhook] Extracted info - sessionId: ${sessionId}`);

            if (!sessionId) {
                console.error('[CreemWebhook] Session ID not found in webhook event');
                return;
            }

            console.log(`[CreemWebhook] Processing payment cancelled for session: ${sessionId}`);

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
                amount: recharge.amount
            });

            console.log(`[CreemWebhook] Updating recharge record status to cancelled`);
            // 更新充值记录状态为取消
            await this.rechargeModel.updateById(recharge.id, {
                status: 'cancelled',
                captureStatus: 'CANCELLED',
                updatedAt: new Date()
            });

            console.log(`[CreemWebhook] Payment cancelled processed for user: ${recharge.userId}, session: ${sessionId}`);

        } catch (error) {
            console.error('[CreemWebhook] Error processing payment cancelled:', error);
            throw error;
        }
    }

    // 处理退款完成事件
    async handleRefundCompleted(eventData) {
        try {
            console.log(`[CreemWebhook] Starting handleRefundCompleted`);
            console.log(`[CreemWebhook] Event data:`, JSON.stringify(eventData, null, 2));

            const refundId = eventData.refund_id;
            const transactionId = eventData.transaction_id;
            const refundAmount = eventData.amount;

            console.log(`[CreemWebhook] Extracted info - refundId: ${refundId}, transactionId: ${transactionId}, amount: ${refundAmount}`);

            // 查找对应的充值记录
            const recharge = await this.rechargeModel.findByCaptureId(transactionId);
            if (!recharge) {
                console.error(`[CreemWebhook] Recharge record not found for transaction: ${transactionId}`);
                return;
            }

            console.log(`[CreemWebhook] Found recharge record:`, {
                id: recharge.id,
                userId: recharge.userId,
                status: recharge.status,
                creditsAdded: recharge.creditsAdded,
                remainingCredits: recharge.remainingCredits,
                amount: recharge.amount
            });

            // 检查是否已经成功处理过支付（即是否已经添加了积分）
            if (recharge.status === 'success') {
                console.log(`[CreemWebhook] Processing refund for successful payment - user: ${recharge.userId}, credits: ${recharge.creditsAdded}`);

                // 先更新充值记录状态为退款，并将剩余积分清零
                console.log(`[CreemWebhook] Updating recharge status to refund and clearing ${recharge.remainingCredits} remaining credits`);
                await this.rechargeModel.updateById(recharge.id, {
                    status: 'refund',
                    captureStatus: 'REFUNDED',
                    remainingCredits: 0,  // 退款时将剩余积分清零
                    updatedAt: new Date()
                });

                // 然后检查用户是否应该降级等级
                console.log(`[CreemWebhook] Checking if user ${recharge.userId} should be downgraded after refund`);
                try {
                    const userCreditHistory = await this.creditService.getUserCreditHistory(recharge.userId, { pageSize: 10 });
                    console.log(`[CreemWebhook] User credit history retrieved, records count: ${userCreditHistory.data?.length || 0}`);

                    // 如果用户没有其他有效的付费充值记录，将等级降回 free
                    const hasPaidCredits = userCreditHistory.data.some(record =>
                        record.method !== 'system' &&
                        record.status === 'success' &&
                        record.id !== recharge.id
                    );

                    console.log(`[CreemWebhook] User has other paid credits: ${hasPaidCredits}`);

                    if (!hasPaidCredits) {
                        console.log(`[CreemWebhook] Downgrading user ${recharge.userId} to free level`);
                        await this.userService.model.updateById(recharge.userId, {
                            level: 'free',
                            updatedAt: new Date()
                        });
                        console.log(`[CreemWebhook] User ${recharge.userId} downgraded to free level after refund`);
                    } else {
                        console.log(`[CreemWebhook] User ${recharge.userId} keeps paid level (has other active purchases)`);
                    }
                } catch (levelError) {
                    console.error(`[CreemWebhook] Failed to check/update user level after refund for user ${recharge.userId}:`, levelError.message);
                }
            } else {
                console.log(`[CreemWebhook] Processing refund for non-successful payment (status: ${recharge.status})`);
                // 如果充值记录不是成功状态，只更新 captureStatus
                await this.rechargeModel.updateById(recharge.id, {
                    captureStatus: 'REFUNDED',
                    updatedAt: new Date()
                });
                console.log(`[CreemWebhook] Refund noted for non-successful recharge ${recharge.id} (status: ${recharge.status})`);
            }

            console.log(`[CreemWebhook] Refund processed successfully for user: ${recharge.userId}, transaction: ${transactionId}`);

        } catch (error) {
            console.error('[CreemWebhook] Error processing refund completed:', error);
            throw error;
        }
    }

    // 处理 webhook 事件
    async processWebhookEvent(eventType, eventData) {
        try {
            console.log(`Processing Creem webhook event: ${eventType}`);

            switch (eventType) {
                case 'payment.completed':
                    await this.handlePaymentCompleted(eventData);
                    break;

                case 'payment.failed':
                    await this.handlePaymentFailed(eventData);
                    break;

                case 'payment.cancelled':
                    await this.handlePaymentCancelled(eventData);
                    break;

                case 'refund.completed':
                    await this.handleRefundCompleted(eventData);
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

            const eventType = eventData.type;
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
            await creemWebhookService.processWebhookEvent(eventType, eventData.data);

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